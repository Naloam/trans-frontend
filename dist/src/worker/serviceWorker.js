var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
const DEFAULT_CONFIG = {
  reduceMotion: false,
  immersiveModeEnabled: true,
  autoClipboard: false,
  cacheTTL: 3600
  // 1小时
};
class TranslationCache {
  constructor() {
    __publicField(this, "dbName", "immersive-translate");
    __publicField(this, "version", 1);
    __publicField(this, "storeName", "translations");
    __publicField(this, "db", null);
  }
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: "hash" });
          store.createIndex("expireAt", "expireAt", { unique: false });
        }
      };
    });
  }
  async get(hash) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.get(hash);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        if (result && result.expireAt > Date.now()) {
          resolve(result.data);
        } else {
          resolve(null);
        }
      };
    });
  }
  async set(hash, data, ttlSeconds = 3600) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const expireAt = Date.now() + ttlSeconds * 1e3;
      const request = store.put({ hash, data, expireAt });
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
  async clearExpired() {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const index = store.index("expireAt");
      const range = IDBKeyRange.upperBound(Date.now());
      const request = index.openCursor(range);
      request.onerror = () => reject(request.error);
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
    });
  }
}
const cache = new TranslationCache();
async function generateHash(text, source, target, format = "text") {
  const data = `${text}|${source}|${target}|${format}`;
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(data));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function fetchTranslation(request, retries = 2) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8e3);
  try {
    const backendRequest = {
      target: request.target,
      segments: [
        {
          id: request.id,
          text: request.text
          // model 字段可选，这里暂不指定
        }
      ]
      // extra_args 可以根据需要添加
    };
    const backendUrl = "http://localhost:8000";
    const response = await fetch(`${backendUrl}/translate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(backendRequest),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const backendResponse = await response.json();
    const translatedSegment = backendResponse.segments.find((segment) => segment.id === request.id);
    if (!translatedSegment) {
      throw new Error("无法找到对应的翻译结果");
    }
    return {
      ok: true,
      data: {
        translatedText: translatedSegment.text,
        detectedLanguage: backendResponse.translated,
        alternatives: []
      }
    };
  } catch (error) {
    clearTimeout(timeoutId);
    if (retries > 0 && error.name !== "AbortError") {
      console.log(`Translation request failed, retrying... (${retries} attempts left)`);
      await new Promise((resolve) => setTimeout(resolve, 1e3));
      await new Promise((resolve) => setTimeout(resolve, 1e3));
      return fetchTranslation(request, retries - 1);
    }
    return {
      ok: false,
      error: {
        code: error.name === "AbortError" ? "TIMEOUT" : "NETWORK_ERROR",
        message: error.message || "Translation request failed"
      }
    };
  }
}
async function handleTranslateRequest(request) {
  try {
    const hash = await generateHash(request.text, request.source, request.target, request.format);
    const cached = await cache.get(hash);
    if (cached) {
      console.log("Translation cache hit:", hash);
      return { ok: true, data: cached };
    }
    console.log("Translation cache miss, fetching from API:", hash);
    const result = await fetchTranslation(request);
    if (result.ok && result.data) {
      const config = await getConfig();
      await cache.set(hash, result.data, config.cacheTTL);
    }
    return result;
  } catch (error) {
    console.error("Translation handler error:", error);
    return {
      ok: false,
      error: {
        code: "HANDLER_ERROR",
        message: error.message || "Internal translation error"
      }
    };
  }
}
async function getConfig() {
  return new Promise((resolve) => {
    chrome.storage.local.get(DEFAULT_CONFIG, (result) => {
      resolve(result);
    });
  });
}
async function handleMessage(message, sender, sendResponse) {
  console.log("Service worker received message:", message.type, sender.tab?.id);
  try {
    switch (message.type) {
      case "translate":
        const translateResult = await handleTranslateRequest(message.payload);
        sendResponse(translateResult);
        break;
      case "languages":
        sendResponse({
          ok: true,
          data: {
            languages: [
              { code: "en", name: "English" },
              { code: "zh", name: "中文" },
              { code: "ja", name: "日本語" },
              { code: "ko", name: "한국어" },
              { code: "fr", name: "Français" },
              { code: "de", name: "Deutsch" },
              { code: "es", name: "Español" }
            ]
          }
        });
        break;
      case "detect":
        sendResponse({
          ok: true,
          data: {
            detected: "en"
          }
        });
        break;
      case "clearCache":
        await cache.clearExpired();
        sendResponse({
          ok: true,
          data: { message: "Cache cleared" }
        });
        break;
      default:
        sendResponse({
          ok: false,
          error: {
            code: "UNKNOWN_MESSAGE_TYPE",
            message: `Unknown message type: ${message.type}`
          }
        });
    }
  } catch (error) {
    console.error("Message handler error:", error);
    sendResponse({
      ok: false,
      error: {
        code: "MESSAGE_HANDLER_ERROR",
        message: error.message || "Internal message handler error"
      }
    });
  }
}
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender, sendResponse);
  return true;
});
chrome.runtime.onInstalled.addListener((details) => {
  console.log("Extension installed or updated:", details.reason);
  cache.init().catch((error) => {
    console.error("Failed to initialize cache:", error);
  });
});
console.log("Service Worker loaded");
//# sourceMappingURL=serviceWorker.js.map
