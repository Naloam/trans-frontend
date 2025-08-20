/**
 * Chrome Extension Service Worker (Manifest V3)
 * 处理翻译请求、缓存管理、配置存储等后台任务
 * 
 * 调试方法：
 * 1. 打开 Chrome -> 扩展程序 -> Immersive Translate -> 详细信息
 * 2. 点击 "检查视图" 下的 "Service Worker" 链接
 * 3. 在 DevTools Console 中查看日志和调试
 */

// Service Worker 环境类型声明
declare const self: ServiceWorkerGlobalScope;
declare interface ServiceWorkerGlobalScope extends WorkerGlobalScope {
  skipWaiting(): Promise<void>;
  clients: Clients;
  addEventListener(type: string, listener: (event: ExtendableEvent) => void): void;
}

declare interface ExtendableEvent extends Event {
  waitUntil(promise: Promise<any>): void;
}

declare interface Clients {
  claim(): Promise<void>;
}

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

// 后端API请求格式
interface BackendTranslateRequest {
  target: string;
  segments: Array<{
    id: string;
    text: string;
    model?: string;
  }>;
  extra_args?: {
    style?: string;
    identity?: string;
  };
}

// 后端API响应格式
interface BackendTranslateResponse {
  translated: string;
  segments: Array<{
    id: string;
    text: string;
  }>;
}

interface MessageRequest {
  type: 'translate' | 'languages' | 'detect' | 'clearCache' | 'translateImage' | 'translateDocument' | 'ping';
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
    // 构造后端API请求格式
    const backendRequest: BackendTranslateRequest = {
      target: request.target,
      segments: [
        {
          id: request.id,
          text: request.text,
          model: "qwen-turbo-latest" // 默认使用qwen-turbo-latest模型
        }
      ],
      // extra_args 可以根据需要添加
    };

    const backendUrl = import.meta.env.BACKEND_URL || 'http://localhost:8000';

    const response = await fetch(`${backendUrl}/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendRequest),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // 处理后端响应格式
    const backendResponse: BackendTranslateResponse = await response.json();

    // 转换为前端期望的格式
    const translatedSegment = backendResponse.segments.find(segment => segment.id === request.id);

    if (!translatedSegment) {
      throw new Error('无法找到对应的翻译结果');
    }

    return {
      ok: true,
      data: {
        translatedText: translatedSegment.text,
        detectedLanguage: backendResponse.translated,
        alternatives: []
      }
    };

  } catch (error: any) {
    clearTimeout(timeoutId);

    if (retries > 0 && error.name !== 'AbortError') {
      console.log(`Translation request failed, retrying... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒后重试
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

// 图片翻译函数 stub
async function translateImage(_fileData: ArrayBuffer, fileName: string, fileType: string): Promise<TranslateResponse> {
  try {
    // 这里应该实现实际的图片翻译逻辑
    // 例如：使用OCR识别图片中的文本，然后翻译识别出的文本

    console.log('Translating image:', fileName, fileType);

    // 模拟处理过程
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 模拟返回结果
    return {
      ok: true,
      data: {
        translatedText: `这是从图片 "${fileName}" 中识别并翻译的文本内容。\n\nOCR识别和翻译功能需要连接到后端服务来实现。`,
        detectedLanguage: 'en',
        alternatives: []
      }
    };
  } catch (error: any) {
    return {
      ok: false,
      error: {
        code: 'IMAGE_TRANSLATION_ERROR',
        message: error.message || '图片翻译失败'
      }
    };
  }
}

// 文档翻译函数 stub
async function translateDocument(_fileData: ArrayBuffer, fileName: string, fileType: string): Promise<TranslateResponse> {
  try {
    // 这里应该实现实际的文档翻译逻辑
    // 例如：解析PDF/TXT/Docx文件，提取文本内容，然后翻译

    console.log('Translating document:', fileName, fileType);

    // 模拟处理过程
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 模拟返回结果
    return {
      ok: true,
      data: {
        translatedText: `这是从文档 "${fileName}" 中提取并翻译的文本内容。\n\n文档解析和翻译功能需要连接到后端服务来实现。`,
        detectedLanguage: 'en',
        alternatives: []
      }
    };
  } catch (error: any) {
    return {
      ok: false,
      error: {
        code: 'DOCUMENT_TRANSLATION_ERROR',
        message: error.message || '文档翻译失败'
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

  } catch (error: any) {
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

      case 'translateImage':
        const imageTranslateResult = await translateImage(
          message.payload.file,
          message.payload.fileName,
          message.payload.fileType
        );
        sendResponse(imageTranslateResult);
        break;

      case 'translateDocument':
        const documentTranslateResult = await translateDocument(
          message.payload.file,
          message.payload.fileName,
          message.payload.fileType
        );
        sendResponse(documentTranslateResult);
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
        // 语言检测（模拟数据）
        sendResponse({
          ok: true,
          data: {
            detected: 'en'
          }
        });
        break;

      case 'clearCache':
        await cache.clearExpired();
        sendResponse({
          ok: true,
          data: { message: 'Cache cleared' }
        });
        break;

      case 'ping':
        // 简单的ping消息，用于检查扩展状态
        sendResponse({
          ok: true,
          data: { message: 'pong' }
        });
        break;

      default:
        sendResponse({
          ok: false,
          error: {
            code: 'UNKNOWN_MESSAGE_TYPE',
            message: `Unknown message type: ${message.type}`
          }
        });
    }
  } catch (error: any) {
    console.error('Message handler error:', error);
    // 使用try-catch包装sendResponse，避免context销毁时报错
    try {
      sendResponse({
        ok: false,
        error: {
          code: 'MESSAGE_HANDLER_ERROR',
          message: error.message || 'Internal message handler error'
        }
      });
    } catch (sendError) {
      console.error('Failed to send error response:', sendError);
    }
  }
}

// 清理并重新创建context menus
async function setupContextMenus() {
  try {
    // 先清理所有现有的context menus
    await chrome.contextMenus.removeAll();
    console.log('Existing context menus removed');
  } catch (error) {
    console.log('No existing context menus to remove or error:', error);
  }
  
  // 创建新的context menus
  try {
    chrome.contextMenus.create({
      id: 'translateImage',
      title: '翻译选中图片',
      contexts: ['image'],
      documentUrlPatterns: ['<all_urls>']
    });

    chrome.contextMenus.create({
      id: 'translateDocument',
      title: '翻译文件',
      contexts: ['link'],
      documentUrlPatterns: ['<all_urls>'],
      targetUrlPatterns: ['*://*/*.pdf', '*://*/*.txt', '*://*/*.docx', '*://*/*.doc']
    });
    
    console.log('Context menus created successfully');
  } catch (error) {
    console.error('Failed to create context menus:', error);
  }
}

// 创建上下文菜单
chrome.runtime.onInstalled.addListener(() => {
  setupContextMenus();
});

// 监听上下文菜单点击事件
chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log('Context menu clicked on tab:', tab?.id);
  if (info.menuItemId === 'translateImage' && info.srcUrl) {
    // 处理图片翻译
    console.log('Translate image clicked:', info.srcUrl);
    // 这里应该实现下载图片并翻译的逻辑
  } else if (info.menuItemId === 'translateDocument' && info.linkUrl) {
    // 处理文档翻译
    console.log('Translate document clicked:', info.linkUrl);
    // 这里应该实现下载文档并翻译的逻辑
  }
});

// 事件监听器
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender, sendResponse);
  return true; // 保持消息通道开放以支持异步响应
});

// 安装和更新事件
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed or updated:', details.reason);

  // 初始化缓存
  cache.init().catch(error => {
    console.error('Failed to initialize cache:', error);
  });
});

// ServiceWorker生命周期事件处理
(self as any).addEventListener('install', (event: any) => {
  console.log('Service Worker installing...');
  // 立即激活新的service worker
  event.waitUntil((self as any).skipWaiting());
});

(self as any).addEventListener('activate', (event: any) => {
  console.log('Service Worker activating...');
  // 立即接管所有页面
  event.waitUntil(
    Promise.all([
      (self as any).clients.claim(),
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
(self as any).addEventListener('error', (event: any) => {
  console.error('Service Worker error:', event.error);
});

(self as any).addEventListener('unhandledrejection', (event: any) => {
  console.error('Service Worker unhandled rejection:', event.reason);
});

console.log('Service Worker loaded');