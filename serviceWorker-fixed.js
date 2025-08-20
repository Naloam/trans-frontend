var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

const DEFAULT_CONFIG = {
    reduceMotion: false,
    immersiveModeEnabled: true,
    autoClipboard: false,
    cacheTTL: 3600
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
                    text: request.text,
                    model: "qwen-turbo-latest"
                }
            ]
        };
        const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";
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

async function translateImage(_fileData, fileName, fileType) {
    try {
        console.log("Translating image:", fileName, fileType);
        await new Promise((resolve) => setTimeout(resolve, 2e3));
        return {
            ok: true,
            data: {
                translatedText: `这是从图片 "${fileName}" 中识别并翻译的文本内容。\n\nOCR识别和翻译功能需要连接到后端服务来实现。`,
                detectedLanguage: "en",
                alternatives: []
            }
        };
    } catch (error) {
        return {
            ok: false,
            error: {
                code: "IMAGE_TRANSLATION_ERROR",
                message: error.message || "图片翻译失败"
            }
        };
    }
}

async function translateDocument(_fileData, fileName, fileType) {
    try {
        console.log("Translating document:", fileName, fileType);
        await new Promise((resolve) => setTimeout(resolve, 2e3));
        return {
            ok: true,
            data: {
                translatedText: `这是从文档 "${fileName}" 中提取并翻译的文本内容。\n\n文档解析和翻译功能需要连接到后端服务来实现。`,
                detectedLanguage: "en",
                alternatives: []
            }
        };
    } catch (error) {
        return {
            ok: false,
            error: {
                code: "DOCUMENT_TRANSLATION_ERROR",
                message: error.message || "文档翻译失败"
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
            case "translateImage":
                const imageTranslateResult = await translateImage(
                    message.payload.file,
                    message.payload.fileName,
                    message.payload.fileType
                );
                sendResponse(imageTranslateResult);
                break;
            case "translateDocument":
                const documentTranslateResult = await translateDocument(
                    message.payload.file,
                    message.payload.fileName,
                    message.payload.fileType
                );
                sendResponse(documentTranslateResult);
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

// 清理并重新创建context menus
async function setupContextMenus() {
    try {
        // 先清理所有现有的context menus
        await chrome.contextMenus.removeAll();
        console.log("Existing context menus removed");
    } catch (error) {
        console.log("No existing context menus to remove or error:", error);
    }

    // 创建新的context menus
    try {
        chrome.contextMenus.create({
            id: "translateImage",
            title: "翻译选中图片",
            contexts: ["image"],
            documentUrlPatterns: ["<all_urls>"]
        });

        chrome.contextMenus.create({
            id: "translateDocument",
            title: "翻译文件",
            contexts: ["link"],
            documentUrlPatterns: ["<all_urls>"],
            targetUrlPatterns: ["*://*/*.pdf", "*://*/*.txt", "*://*/*.docx", "*://*/*.doc"]
        });

        console.log("Context menus created successfully");
    } catch (error) {
        console.error("Failed to create context menus:", error);
    }
}

chrome.runtime.onInstalled.addListener(() => {
    setupContextMenus();
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    console.log("Context menu clicked on tab:", tab?.id);
    if (info.menuItemId === "translateImage" && info.srcUrl) {
        console.log("Translate image clicked:", info.srcUrl);
    } else if (info.menuItemId === "translateDocument" && info.linkUrl) {
        console.log("Translate document clicked:", info.linkUrl);
    }
});

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

// ServiceWorker生命周期事件处理
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    // 立即激活新的service worker
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    // 立即接管所有页面
    event.waitUntil(
        Promise.all([
            self.clients.claim(),
            // 清理旧的缓存
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== 'immersive-translate-v1') {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
        ])
    );
});

// 处理ServiceWorker错误
self.addEventListener('error', (event) => {
    console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('Service Worker unhandled rejection:', event.reason);
});

console.log("Service Worker loaded");


