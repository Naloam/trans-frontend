/**
 * Chrome Extension Service Worker (Manifest V3)
 * 处理翻译请求、缓存管理、配置存储等后台任务
 * 
 * 调试方法：
 * 1. 打开 Chrome -> 扩展程序 -> Immersive Translate -> 详细信息
 * 2. 点击 "检查视图" 下的 "Service Worker" 链接
 * 3. 在 DevTools Console 中查看日志和调试
 */

// 消息类型定义
interface TranslateRequest {
  id: string;
  text: string;
  source: string;
  target: string;
  format?: 'text' | 'html';
}

interface TranslateResponse {
  ok: boolean;
  data?: {
    translatedText: string;
    detectedLanguage?: string;
    alternatives?: string[];
  };
  error?: {
    code: string;
    message: string;
  };
}

interface MessageRequest {
  type: 'translate' | 'languages' | 'detect' | 'clearCache';
  payload: any;
}

interface MessageResponse {
  ok: boolean;
  data?: any;
  error?: {
    code: string;
    message: string;
  };
}

// 配置接口
interface ExtensionConfig {
  reduceMotion: boolean;
  immersiveModeEnabled: boolean;
  autoClipboard: boolean;
  cacheTTL: number;
}

// 默认配置
const DEFAULT_CONFIG: ExtensionConfig = {
  reduceMotion: false,
  immersiveModeEnabled: true,
  autoClipboard: false,
  cacheTTL: 3600 // 1小时
};

// IndexedDB 缓存助手
class TranslationCache {
  private dbName = 'immersive-translate';
  private version = 1;
  private storeName = 'translations';
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'hash' });
          store.createIndex('expireAt', 'expireAt', { unique: false });
        }
      };
    });
  }

  async get(hash: string): Promise<any> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
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

  async set(hash: string, data: any, ttlSeconds: number = 3600): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const expireAt = Date.now() + (ttlSeconds * 1000);
      
      const request = store.put({ hash, data, expireAt });
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clearExpired(): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('expireAt');
      const range = IDBKeyRange.upperBound(Date.now());
      
      const request = index.openCursor(range);
      request.onerror = () => reject(request.error);
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
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

// 全局实例
const cache = new TranslationCache();

// 生成缓存键
async function generateHash(text: string, source: string, target: string, format: string = 'text'): Promise<string> {
  const data = `${text}|${source}|${target}|${format}`;
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// 翻译API请求（带重试）
async function fetchTranslation(request: TranslateRequest, retries: number = 2): Promise<TranslateResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8秒超时

  try {
    const response = await fetch('https://api.example.com/v1/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: request.text,
        source: request.source,
        target: request.target,
        format: request.format || 'text'
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      ok: true,
      data: {
        translatedText: data.translatedText,
        detectedLanguage: data.detectedLanguage,
        alternatives: data.alternatives || []
      }
    };

  } catch (error) {
    clearTimeout(timeoutId);
    
    if (retries > 0 && error.name !== 'AbortError') {
      console.log(`Translation request failed, retrying... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒后重试
      return fetchTranslation(request, retries - 1);
    }

    return {
      ok: false,
      error: {
        code: error.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK_ERROR',
        message: error.message || 'Translation request failed'
      }
    };
  }
}

// 处理翻译请求
async function handleTranslateRequest(request: TranslateRequest): Promise<TranslateResponse> {
  try {
    // 生成缓存键
    const hash = await generateHash(request.text, request.source, request.target, request.format);
    
    // 检查缓存
    const cached = await cache.get(hash);
    if (cached) {
      console.log('Translation cache hit:', hash);
      return { ok: true, data: cached };
    }

    // 发起翻译请求
    console.log('Translation cache miss, fetching from API:', hash);
    const result = await fetchTranslation(request);
    
    // 缓存成功的结果
    if (result.ok && result.data) {
      const config = await getConfig();
      await cache.set(hash, result.data, config.cacheTTL);
    }

    return result;

  } catch (error) {
    console.error('Translation handler error:', error);
    return {
      ok: false,
      error: {
        code: 'HANDLER_ERROR',
        message: error.message || 'Internal translation error'
      }
    };
  }
}

// 获取配置
async function getConfig(): Promise<ExtensionConfig> {
  return new Promise((resolve) => {
    chrome.storage.local.get(DEFAULT_CONFIG, (result) => {
      resolve(result as ExtensionConfig);
    });
  });
}

// 保存配置
async function setConfig(config: Partial<ExtensionConfig>): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set(config, () => {
      resolve();
    });
  });
}

// 消息处理器
async function handleMessage(
  message: MessageRequest,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: MessageResponse) => void
): Promise<void> {
  console.log('Service worker received message:', message.type, sender.tab?.id);

  try {
    switch (message.type) {
      case 'translate':
        const translateResult = await handleTranslateRequest(message.payload);
        sendResponse(translateResult);
        break;

      case 'languages':
        // 返回支持的语言列表（模拟数据）
        sendResponse({
          ok: true,
          data: {
            languages: [
              { code: 'en', name: 'English' },
              { code: 'zh', name: '中文' },
              { code: 'ja', name: '日本語' },
              { code: 'ko', name: '한국어' },
              { code: 'fr', name: 'Français' },
              { code: 'de', name: 'Deutsch' },
              { code: 'es', name: 'Español' }
            ]
          }
        });
        break;

      case 'detect':
        // 语言检测（简单实现）
        const text = message.payload.text;
        const detected = /[\u4e00-\u9fff]/.test(text) ? 'zh' : 'en';
        sendResponse({
          ok: true,
          data: { detectedLanguage: detected }
        });
        break;

      case 'clearCache':
        await cache.clearExpired();
        sendResponse({ ok: true, data: { message: 'Cache cleared' } });
        break;

      default:
        sendResponse({
          ok: false,
          error: { code: 'UNKNOWN_MESSAGE_TYPE', message: `Unknown message type: ${message.type}` }
        });
    }
  } catch (error) {
    console.error('Message handler error:', error);
    sendResponse({
      ok: false,
      error: { code: 'HANDLER_ERROR', message: error.message }
    });
  }
}

// 事件监听器
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender, sendResponse);
  return true; // 保持消息通道开放以支持异步响应
});

// 长连接处理（用于实时通信）
chrome.runtime.onConnect.addListener((port) => {
  console.log('Service worker connected:', port.name);
  
  port.onMessage.addListener(async (message) => {
    const response = await new Promise<MessageResponse>((resolve) => {
      handleMessage(message, { tab: port.sender?.tab }, resolve);
    });
    port.postMessage(response);
  });

  port.onDisconnect.addListener(() => {
    console.log('Service worker disconnected:', port.name);
  });
});

// 定期清理过期缓存
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'clearExpiredCache') {
    cache.clearExpired().catch(console.error);
  }
});

// 设置定期清理任务
chrome.alarms.create('clearExpiredCache', { periodInMinutes: 60 });

// Service Worker 启动时初始化
console.log('Immersive Translate Service Worker started');
cache.init().catch(console.error);