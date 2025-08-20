/**
 * 优化的Chrome Extension Service Worker (Manifest V3)
 * 集成了请求管理、离线翻译、个人记忆、上下文感知等高级功能
 */

import { requestManager } from '../lib/requestManager';
import { offlineTranslationManager } from '../lib/offlineTranslation';
import { personalTranslationMemory } from '../lib/personalTranslationMemory';
import { contextualTranslationEngine } from '../lib/contextualTranslation';
import { mobileSyncService } from '../lib/mobileSyncService';

// 消息类型定义
interface TranslateRequest {
  id: string;
  text: string;
  source: string;
  target: string;
  format?: 'text' | 'html';
  context?: string;
  documentId?: string;
  sentenceIndex?: number;
  priority?: number;
}

interface TranslateResponse {
  ok: boolean;
  data?: {
    translatedText: string;
    detectedLanguage?: string;
    alternatives?: string[];
    confidence?: number;
    source?: 'online' | 'offline' | 'memory' | 'contextual';
    contextualAdjustments?: any[];
  };
  error?: {
    code: string;
    message: string;
  };
}

interface MessageRequest {
  type: 'translate' | 'languages' | 'detect' | 'clearCache' | 'translateImage' | 'translateDocument' | 'createContext' | 'getStats';
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
  offlineEnabled: boolean;
  memoryEnabled: boolean;
  contextAwareEnabled: boolean;
  batchProcessingEnabled: boolean;
}

// 默认配置
const DEFAULT_CONFIG: ExtensionConfig = {
  reduceMotion: false,
  immersiveModeEnabled: true,
  autoClipboard: false,
  cacheTTL: 3600,
  offlineEnabled: true,
  memoryEnabled: true,
  contextAwareEnabled: true,
  batchProcessingEnabled: true
};

class OptimizedTranslationService {
  private initialized = false;
  private config: ExtensionConfig = DEFAULT_CONFIG;

  /**
   * 初始化服务
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // 加载配置
      this.config = await this.getConfig();

      // 初始化各个子系统
      if (this.config.offlineEnabled) {
        await offlineTranslationManager.initialize();
        console.log('Offline translation system initialized');
      }

      if (this.config.memoryEnabled) {
        await personalTranslationMemory.initialize();
        console.log('Personal translation memory initialized');
      }

      if (this.config.contextAwareEnabled) {
        await contextualTranslationEngine.initialize();
        console.log('Contextual translation engine initialized');
      }

      this.initialized = true;
      console.log('Optimized Translation Service initialized successfully');

    } catch (error) {
      console.error('Failed to initialize translation service:', error);
      throw error;
    }
  }

  /**
   * 智能翻译处理
   */
  async handleTranslateRequest(request: TranslateRequest): Promise<TranslateResponse> {
    try {
      // 确保服务已初始化
      if (!this.initialized) {
        await this.initialize();
      }

      // 1. 优先检查个人翻译记忆
      if (this.config.memoryEnabled) {
        const memorySuggestion = await personalTranslationMemory.getPersonalizedSuggestion(
          request.text,
          request.source,
          request.target,
          request.context
        );

        if (memorySuggestion.confidence > 0.8) {
          // 记忆中有高置信度的翻译
          await personalTranslationMemory.addMemory(
            request.text,
            memorySuggestion.suggestion,
            request.source,
            request.target,
            request.context
          );

          // 同步到移动端
          try {
            await mobileSyncService.addTranslationRecord({
              originalText: request.text,
              translatedText: memorySuggestion.suggestion,
              sourceLanguage: request.source,
              targetLanguage: request.target,
              context: request.context,
              url: (request as any).url,
              confidence: memorySuggestion.confidence
            });
          } catch (syncError) {
            console.warn('Failed to sync translation to mobile:', syncError);
          }

          return {
            ok: true,
            data: {
              translatedText: memorySuggestion.suggestion,
              confidence: memorySuggestion.confidence,
              source: 'memory',
              alternatives: memorySuggestion.alternatives
            }
          };
        }
      }

      // 2. 上下文感知翻译
      if (this.config.contextAwareEnabled && request.documentId && request.sentenceIndex !== undefined) {
        try {
          const contextualResult = await contextualTranslationEngine.translateWithContext(
            request.documentId,
            request.sentenceIndex,
            request.source,
            request.target
          );

          if (contextualResult.confidence > 0.6) {
            return {
              ok: true,
              data: {
                translatedText: contextualResult.translatedText,
                confidence: contextualResult.confidence,
                source: 'contextual',
                contextualAdjustments: contextualResult.contextualAdjustments
              }
            };
          }
        } catch (contextError) {
          console.warn('Contextual translation failed:', contextError);
        }
      }

      // 3. 在线翻译（使用请求管理器进行优化）
      try {
        const onlineResult = await this.fetchOnlineTranslation(request);
        
        // 保存到个人记忆
        if (this.config.memoryEnabled && onlineResult.ok && onlineResult.data) {
          await personalTranslationMemory.addMemory(
            request.text,
            onlineResult.data.translatedText,
            request.source,
            request.target,
            request.context
          );

          // 同步到移动端
          try {
            await mobileSyncService.addTranslationRecord({
              originalText: request.text,
              translatedText: onlineResult.data.translatedText,
              sourceLanguage: request.source,
              targetLanguage: request.target,
              context: request.context,
              url: (request as any).url,
              confidence: onlineResult.data.confidence || 0.8
            });
          } catch (syncError) {
            console.warn('Failed to sync translation to mobile:', syncError);
          }
        }

        return onlineResult;

      } catch (onlineError) {
        console.warn('Online translation failed:', onlineError);

        // 4. 回退到离线翻译
        if (this.config.offlineEnabled) {
          try {
            const offlineResult = await offlineTranslationManager.translate(
              request.text,
              request.source,
              request.target
            );

            return {
              ok: true,
              data: {
                translatedText: offlineResult.translated,
                confidence: offlineResult.confidence,
                source: 'offline'
              }
            };

          } catch (offlineError) {
            console.warn('Offline translation failed:', offlineError);
          }
        }

        // 5. 最终回退：返回原文
        return {
          ok: true,
          data: {
            translatedText: request.text,
            confidence: 0,
            source: 'offline'
          }
        };
      }

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

  /**
   * 在线翻译（使用请求管理器）
   */
  private async fetchOnlineTranslation(request: TranslateRequest): Promise<TranslateResponse> {
    if (this.config.batchProcessingEnabled) {
      // 使用批量处理和去重
      return await requestManager.addRequest({
        id: request.id,
        text: request.text,
        source: request.source,
        target: request.target,
        format: request.format || 'text',
        context: request.context,
        priority: request.priority || 1
      });
    } else {
      // 直接发送请求
      return await this.directFetchTranslation(request);
    }
  }

  /**
   * 直接翻译请求
   */
  private async directFetchTranslation(request: TranslateRequest): Promise<TranslateResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const backendUrl = import.meta.env?.BACKEND_URL || 'http://localhost:8000';
      
      const response = await fetch(`${backendUrl}/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target: request.target,
          segments: [
            {
              id: request.id,
              text: request.text,
              model: "qwen-turbo-latest"
            }
          ]
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const segment = result.segments?.find((s: any) => s.id === request.id);

      if (!segment) {
        throw new Error('无法找到对应的翻译结果');
      }

      return {
        ok: true,
        data: {
          translatedText: segment.text,
          detectedLanguage: result.translated,
          alternatives: [],
          source: 'online'
        }
      };

    } catch (error: any) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * 创建文档上下文
   */
  async createDocumentContext(
    documentId: string,
    sentences: string[],
    metadata?: any
  ): Promise<any> {
    if (!this.config.contextAwareEnabled) {
      return { ok: false, error: { code: 'CONTEXT_DISABLED', message: 'Context awareness is disabled' } };
    }

    try {
      const context = await contextualTranslationEngine.createDocumentContext(
        documentId,
        sentences,
        metadata
      );

      return { ok: true, data: context };
    } catch (error: any) {
      return {
        ok: false,
        error: {
          code: 'CONTEXT_CREATION_ERROR',
          message: error.message || 'Failed to create document context'
        }
      };
    }
  }

  /**
   * 图片翻译
   */
  async translateImage(fileData: ArrayBuffer, fileName: string, fileType: string): Promise<TranslateResponse> {
    try {
      console.log('Translating image:', fileName, fileType);

      // 模拟OCR处理
      await new Promise(resolve => setTimeout(resolve, 2000));

      return {
        ok: true,
        data: {
          translatedText: `这是从图片 "${fileName}" 中识别并翻译的文本内容。\n\nOCR识别和翻译功能需要连接到后端服务来实现。`,
          detectedLanguage: 'en',
          alternatives: [],
          source: 'offline'
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

  /**
   * 文档翻译
   */
  async translateDocument(fileData: ArrayBuffer, fileName: string, fileType: string): Promise<TranslateResponse> {
    try {
      console.log('Translating document:', fileName, fileType);

      // 模拟文档处理
      await new Promise(resolve => setTimeout(resolve, 2000));

      return {
        ok: true,
        data: {
          translatedText: `这是从文档 "${fileName}" 中提取并翻译的文本内容。\n\n文档解析和翻译功能需要连接到后端服务来实现。`,
          detectedLanguage: 'en',
          alternatives: [],
          source: 'offline'
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

  /**
   * 获取统计信息
   */
  async getStats(): Promise<any> {
    const stats = {
      initialized: this.initialized,
      config: this.config,
      requestManager: requestManager.getStats(),
      offlineTranslation: this.config.offlineEnabled ? offlineTranslationManager.getStats() : null,
      personalMemory: this.config.memoryEnabled ? await personalTranslationMemory.getStats() : null,
      contextualEngine: this.config.contextAwareEnabled ? contextualTranslationEngine.getStats() : null
    };

    return { ok: true, data: stats };
  }

  /**
   * 获取配置
   */
  private async getConfig(): Promise<ExtensionConfig> {
    return new Promise((resolve) => {
      chrome.storage.local.get(DEFAULT_CONFIG, (result) => {
        resolve({ ...DEFAULT_CONFIG, ...result });
      });
    });
  }

  /**
   * 清理缓存
   */
  async clearCache(): Promise<void> {
    try {
      // 清理个人记忆
      if (this.config.memoryEnabled) {
        await personalTranslationMemory.cleanupExpiredMemories();
      }

      // 清理上下文
      if (this.config.contextAwareEnabled) {
        contextualTranslationEngine.cleanupExpiredContexts();
      }

      console.log('Cache cleanup completed');
    } catch (error) {
      console.warn('Cache cleanup failed:', error);
    }
  }
}

// 全局实例
const translationService = new OptimizedTranslationService();

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
        const translateResult = await translationService.handleTranslateRequest(message.payload);
        sendResponse(translateResult);
        break;

      case 'translateImage':
        const imageTranslateResult = await translationService.translateImage(
          message.payload.file,
          message.payload.fileName,
          message.payload.fileType
        );
        sendResponse(imageTranslateResult);
        break;

      case 'translateDocument':
        const documentTranslateResult = await translationService.translateDocument(
          message.payload.file,
          message.payload.fileName,
          message.payload.fileType
        );
        sendResponse(documentTranslateResult);
        break;

      case 'createContext':
        const contextResult = await translationService.createDocumentContext(
          message.payload.documentId,
          message.payload.sentences,
          message.payload.metadata
        );
        sendResponse(contextResult);
        break;

      case 'languages':
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
              { code: 'es', name: 'Español' },
              { code: 'pt', name: 'Português' },
              { code: 'ru', name: 'Русский' },
              { code: 'ar', name: 'العربية' }
            ]
          }
        });
        break;

      case 'detect':
        // 语言检测
        try {
          const detectedLang = await offlineTranslationManager.detectLanguage(message.payload.text);
          sendResponse({
            ok: true,
            data: { detectedLanguage: detectedLang }
          });
        } catch (error) {
          sendResponse({
            ok: false,
            error: {
              code: 'DETECTION_ERROR',
              message: 'Language detection failed'
            }
          });
        }
        break;

      case 'clearCache':
        await translationService.clearCache();
        sendResponse({ ok: true });
        break;

      case 'getStats':
        const statsResult = await translationService.getStats();
        sendResponse(statsResult);
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
    sendResponse({
      ok: false,
      error: {
        code: 'MESSAGE_HANDLER_ERROR',
        message: error.message || 'Internal message handler error'
      }
    });
  }
}

// 设置上下文菜单
async function setupContextMenus() {
  try {
    await chrome.contextMenus.removeAll();
    
    chrome.contextMenus.create({
      id: 'translateSelection',
      title: '翻译选中文本',
      contexts: ['selection']
    });

    chrome.contextMenus.create({
      id: 'translateImage',
      title: '翻译图片',
      contexts: ['image']
    });

    chrome.contextMenus.create({
      id: 'immersiveTranslate',
      title: '沉浸式翻译',
      contexts: ['page']
    });

    console.log('Context menus created successfully');
  } catch (error) {
    console.error('Failed to setup context menus:', error);
  }
}

// 事件监听器
chrome.runtime.onInstalled.addListener(() => {
  setupContextMenus();
});

// 消息监听器
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender, sendResponse);
  return true; // 保持消息通道开放
});

// 上下文菜单点击监听器
chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log('Context menu clicked:', info.menuItemId, tab?.id);
  
  if (info.menuItemId === 'translateSelection' && info.selectionText) {
    // 翻译选中文本
    chrome.tabs.sendMessage(tab!.id!, {
      type: 'translateSelection',
      text: info.selectionText
    });
  } else if (info.menuItemId === 'translateImage' && info.srcUrl) {
    // 翻译图片
    console.log('Translate image:', info.srcUrl);
  } else if (info.menuItemId === 'immersiveTranslate') {
    // 沉浸式翻译
    chrome.tabs.sendMessage(tab!.id!, {
      type: 'toggleImmersiveTranslation'
    });
  }
});

// 快捷键监听器
chrome.commands.onCommand.addListener((command, tab) => {
  console.log('Command triggered:', command, tab?.id);
  
  if (command === 'toggle-immersive' && tab?.id) {
    chrome.tabs.sendMessage(tab.id, {
      type: 'toggleImmersiveTranslation'
    });
  }
});

// 定期清理任务
setInterval(async () => {
  try {
    await translationService.clearCache();
  } catch (error) {
    console.warn('Scheduled cleanup failed:', error);
  }
}, 60 * 60 * 1000); // 每小时清理一次

console.log('Optimized Service Worker loaded successfully');
