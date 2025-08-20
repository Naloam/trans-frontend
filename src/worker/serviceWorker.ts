/**
 * 稳定的优化Service Worker - 结合高级功能与稳定性
 * 基于 simpleServiceWorker.ts，添加缓存和重试功能，但避免复杂依赖
 */

console.log('Stable Optimized Service Worker starting...');

// ================================
// 内置缓存系统 (避免外部依赖)
// ================================
class SimpleCache {
  private cache = new Map<string, { data: any; expireAt: number }>();
  private readonly TTL = 3600000; // 1小时 (毫秒)

  async get(key: string): Promise<any> {
    const item = this.cache.get(key);
    if (item && item.expireAt > Date.now()) {
      return item.data;
    }
    if (item) {
      this.cache.delete(key);
    }
    return null;
  }

  async set(key: string, data: any, ttl = this.TTL): Promise<void> {
    this.cache.set(key, {
      data,
      expireAt: Date.now() + ttl
    });
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  // 清理过期项
  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (item.expireAt <= now) {
        this.cache.delete(key);
      }
    }
  }

  // 启动定时清理
  startCleanup(): void {
    setInterval(() => this.cleanup(), 300000); // 每5分钟清理一次
  }
}

// ================================
// 优化的翻译服务
// ================================
class StableTranslationService {
  private cache = new SimpleCache();
  private pendingRequests = new Map<string, Promise<any>>();

  constructor() {
    this.cache.startCleanup();
    console.log('Stable Translation Service initialized');
  }

  // 生成缓存键
  private getCacheKey(text: string, source: string, target: string): string {
    return `${text}|${source}|${target}`;
  }

  // 主翻译方法 - 带缓存和去重
  async translate(text: string, source: string, target: string, useCache = true) {
    try {
      const cacheKey = this.getCacheKey(text, source, target);

      // 检查缓存
      if (useCache) {
        const cached = await this.cache.get(cacheKey);
        if (cached) {
          console.log('Cache hit for translation');
          return {
            ok: true,
            data: {
              ...cached,
              source: 'cache'
            }
          };
        }
      }

      // 检查是否有相同的请求正在进行
      if (this.pendingRequests.has(cacheKey)) {
        console.log('Duplicate request detected, waiting for existing request');
        return await this.pendingRequests.get(cacheKey);
      }

      // 创建新的翻译请求
      const requestPromise = this.fetchTranslation(text, source, target);
      this.pendingRequests.set(cacheKey, requestPromise);

      try {
        const result = await requestPromise;

        // 缓存成功的结果
        if (result.ok && useCache) {
          await this.cache.set(cacheKey, result.data);
        }

        return result;
      } finally {
        // 清理pending请求
        this.pendingRequests.delete(cacheKey);
      }

    } catch (error: any) {
      console.error('Translation failed:', error);
      return {
        ok: false,
        error: {
          code: 'TRANSLATION_FAILED',
          message: error.message
        }
      };
    }
  }

  // 网络翻译请求 - 带重试机制
  private async fetchTranslation(text: string, source: string, target: string, retries = 3): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时

    try {
      const response = await fetch('http://2648d4f4.r22.cpolar.top/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          target: target === 'zh' ? '中文' : 'English',
          segments: [{
            id: Date.now().toString(),
            text: text,
            model: 'qwen-turbo-latest'
          }],
          user_id: null,
          extra_args: null
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Backend response:', result);

      const segment = result.segments?.[0];

      return {
        ok: true,
        data: {
          translatedText: segment?.text || text,
          detectedLanguage: source,
          source: 'online',
          timestamp: Date.now()
        }
      };
    } catch (error: any) {
      clearTimeout(timeoutId);

      // 重试逻辑
      if (retries > 0 && error.name !== 'AbortError') {
        console.log(`Translation request failed, retrying... (${retries} attempts left)`, error.message);
        const delay = Math.min(1000 * (4 - retries), 3000); // 1s, 2s, 3s延迟
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.fetchTranslation(text, source, target, retries - 1);
      }

      throw error;
    }
  }

  // 记录单词
  async recordWords(text: string, userId: number = 1) {
    try {
      const response = await fetch('https://2648d4f4.r22.cpolar.top/record-words', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: text,
          user_id: userId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        ok: true,
        data: result
      };
    } catch (error: any) {
      console.error('Record words failed:', error);
      return {
        ok: false,
        error: {
          code: 'RECORD_WORDS_FAILED',
          message: error.message
        }
      };
    }
  }

  // 清理缓存
  async clearCache() {
    try {
      await this.cache.clear();
      return {
        ok: true,
        data: { message: 'Cache cleared successfully', timestamp: Date.now() }
      };
    } catch (error: any) {
      console.error('Clear cache failed:', error);
      return {
        ok: false,
        error: {
          code: 'CLEAR_CACHE_FAILED',
          message: error.message
        }
      };
    }
  }

  // 获取统计信息
  getStats() {
    return {
      cacheSize: this.cache['cache']?.size || 0,
      pendingRequests: this.pendingRequests.size,
      timestamp: Date.now()
    };
  }
}

const stableTranslationService = new StableTranslationService();

// ================================
// 消息处理器 - 确保所有消息类型都有处理
// ================================
chrome.runtime.onMessage.addListener((message: any, _sender: any, sendResponse: any) => {
  console.log('Service Worker received message:', message.type, 'Payload:', message.payload);

  // 处理ping消息 - 用于检查扩展状态
  if (message.type === 'ping') {
    console.log('Ping received from content script');
    sendResponse({ 
      ok: true, 
      data: { 
        status: 'ready',
        version: 'stable-optimized',
        timestamp: Date.now(),
        stats: stableTranslationService.getStats()
      } 
    });
    return true;
  }

  if (message.type === 'translate') {
    // 异步处理翻译请求
    stableTranslationService.translate(
      message.payload.text,
      message.payload.source,
      message.payload.target,
      true // 使用缓存
    ).then(result => {
      console.log('Translation result:', result);
      sendResponse(result);
    }).catch(error => {
      console.error('Translation handler error:', error);
      sendResponse({
        ok: false,
        error: {
          code: 'HANDLER_ERROR',
          message: error.message
        }
      });
    });

    return true; // 保持消息通道开放
  }

  if (message.type === 'recordWords') {
    stableTranslationService.recordWords(
      message.payload.text,
      message.payload.userId || 1
    ).then(result => {
      sendResponse(result);
    }).catch(error => {
      sendResponse({
        ok: false,
        error: {
          code: 'HANDLER_ERROR',
          message: error.message
        }
      });
    });

    return true;
  }

  if (message.type === 'clearCache') {
    stableTranslationService.clearCache().then(result => {
      sendResponse(result);
    }).catch(error => {
      sendResponse({
        ok: false,
        error: {
          code: 'HANDLER_ERROR',
          message: error.message
        }
      });
    });

    return true;
  }

  if (message.type === 'getStats') {
    sendResponse({
      ok: true,
      data: stableTranslationService.getStats()
    });
    return false;
  }

  // 其他消息类型的同步处理
  switch (message.type) {
    case 'languages':
      sendResponse({
        ok: true,
        data: {
          languages: [
            { code: 'auto', name: '自动检测' },
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
      // 简单的语言检测 (可以扩展)
      const text = message.payload?.text || '';
      const isEnglish = /^[a-zA-Z\s\.,!?;:"'-]+$/.test(text);
      const isChinese = /[\u4e00-\u9fff]/.test(text);
      
      sendResponse({
        ok: true,
        data: {
          detected: isChinese ? 'zh' : (isEnglish ? 'en' : 'auto'),
          confidence: 0.8
        }
      });
      break;

    default:
      console.warn('Unknown message type:', message.type);
      sendResponse({
        ok: false,
        error: {
          code: 'UNKNOWN_MESSAGE_TYPE',
          message: `Unknown message type: ${message.type}`
        }
      });
  }

  return false;
});

// ================================
// Chrome扩展生命周期事件
// ================================

// 安装事件
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Stable Optimized Service Worker installed, reason:', details.reason);
  
  try {
    // 创建右键菜单
    chrome.contextMenus.removeAll(() => {
      chrome.contextMenus.create({
        id: 'translateSelection',
        title: '翻译选中文本',
        contexts: ['selection']
      });
      
      chrome.contextMenus.create({
        id: 'immersiveTranslate',
        title: '沉浸式翻译',
        contexts: ['page']
      });

      chrome.contextMenus.create({
        id: 'clearCache',
        title: '清理翻译缓存',
        contexts: ['page']
      });

      chrome.contextMenus.create({
        id: 'getStats',
        title: '查看扩展统计',
        contexts: ['page']
      });
      
      console.log('Context menus created successfully');
    });
    
  } catch (error) {
    console.error('Failed to create context menus:', error);
  }
});

// 右键菜单点击事件
chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log('Context menu clicked:', info.menuItemId);
  
  if (!tab?.id) {
    console.error('Tab ID is undefined');
    return;
  }
  
  switch (info.menuItemId) {
    case 'translateSelection':
      if (info.selectionText) {
        chrome.tabs.sendMessage(tab.id, {
          type: 'translateSelection',
          text: info.selectionText
        });
      }
      break;

    case 'immersiveTranslate':
      chrome.tabs.sendMessage(tab.id, {
        type: 'toggleImmersiveTranslation'
      });
      break;

    case 'clearCache':
      stableTranslationService.clearCache().then(result => {
        console.log('Cache cleared from context menu:', result);
        // 可以发送通知给用户
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, {
            type: 'showNotification',
            message: result.ok ? '缓存已清理' : '清理失败'
          });
        }
      });
      break;

    case 'getStats':
      const stats = stableTranslationService.getStats();
      console.log('Extension stats:', stats);
      chrome.tabs.sendMessage(tab.id, {
        type: 'showNotification',
        message: `缓存: ${stats.cacheSize}条, 请求中: ${stats.pendingRequests}个`
      });
      break;
  }
});

// 快捷键命令
chrome.commands.onCommand.addListener((command, tab) => {
  console.log('Command triggered:', command);
  
  if (command === 'toggle-immersive' && tab?.id) {
    chrome.tabs.sendMessage(tab.id, {
      type: 'toggleImmersiveTranslation'
    });
  }
});

// Service Worker 启动和生命周期 (使用正确的类型声明)
(self as any).addEventListener('install', () => {
  console.log('Service Worker installing...');
  (self as any).skipWaiting();
});

(self as any).addEventListener('activate', (event: any) => {
  console.log('Service Worker activating...');
  event.waitUntil((self as any).clients.claim());
});

// 错误处理
(self as any).addEventListener('error', (event: any) => {
  console.error('Service Worker error:', event.error);
});

(self as any).addEventListener('unhandledrejection', (event: any) => {
  console.error('Service Worker unhandled rejection:', event.reason);
});

console.log('Stable Optimized Service Worker loaded successfully');
