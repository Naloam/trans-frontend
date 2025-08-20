/**
 * 简化的Service Worker用于测试
 */

console.log('Service Worker starting...');

// 基本的翻译服务
class SimpleTranslationService {
  async translate(text, source, target) {
    // 使用真正后端的API格式
    try {
      const response = await fetch('http://localhost:8000/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          segments: [{
            id: Date.now().toString(),
            text: text
          }],
          target_language: target === 'zh' ? '中文' : '英文',
          model_name: 'qwen-turbo-latest',
          identity: '通用专家',
          extra_instructions: '请提供准确的翻译'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const segment = result.translated_segments?.[0];

      return {
        ok: true,
        data: {
          translatedText: segment?.text || text,
          detectedLanguage: source,
          source: 'online'
        }
      };
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

  async recordWords(text: string, userId: number = 1) {
    try {
      const response = await fetch('http://localhost:8000/record-words', {
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
}

const simpleTranslationService = new SimpleTranslationService();

// 消息处理器
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Service Worker received message:', message.type);

  if (message.type === 'translate') {
    // 异步处理翻译请求
    simpleTranslationService.translate(
      message.payload.text,
      message.payload.source,
      message.payload.target
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

    // 保持消息通道开放
    return true;
  }

  if (message.type === 'recordWords') {
    // 异步处理记录单词请求
    simpleTranslationService.recordWords(
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

    // 保持消息通道开放
    return true;
  }

  // 其他消息类型
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

    default:
      sendResponse({
        ok: false,
        error: {
          code: 'UNKNOWN_MESSAGE_TYPE',
          message: `Unknown message type: ${message.type}`
        }
      });
  }
});

// 安装事件
chrome.runtime.onInstalled.addListener(() => {
  console.log('Service Worker installed');
  
  // 创建右键菜单
  try {
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
    
    console.log('Context menus created');
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
  
  if (info.menuItemId === 'translateSelection' && info.selectionText) {
    chrome.tabs.sendMessage(tab.id, {
      type: 'translateSelection',
      text: info.selectionText
    });
  } else if (info.menuItemId === 'immersiveTranslate') {
    chrome.tabs.sendMessage(tab.id, {
      type: 'toggleImmersiveTranslation'
    });
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

console.log('Simple Service Worker loaded successfully');
