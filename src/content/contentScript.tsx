/**
 * Content Script - 注入到页面的脚本
 * 
 * 功能：
 * - 监听文本选择和双击事件
 * - 创建独立的 Shadow DOM 容器避免样式冲突
 * - 显示翻译气泡和沉浸式覆盖层
 * - 与 Service Worker 通信获取翻译结果
 * 
 * 样式隔离：使用 Shadow DOM 确保扩展样式不影响宿主页面
 * 通信约束：所有网络请求通过 Service Worker 处理，Content Script 不直接访问外部API
 */

// 扩展Window接口以避免TypeScript错误
interface Window {
  __IMMERSIVE_TRANSLATE_LOADED__?: boolean;
}

// 防止重复注入
const initContentScript = () => {
  if (window.__IMMERSIVE_TRANSLATE_LOADED__) {
    console.log('Immersive Translate content script already loaded, skipping initialization');
    return false;
  }
  window.__IMMERSIVE_TRANSLATE_LOADED__ = true;
  return true;
};

// 如果脚本已经加载，则直接退出函数
if (!initContentScript()) {
  // 退出整个脚本执行
  throw new Error('Immersive Translate content script already loaded, skipping initialization');
}

// 类型定义
interface TranslationBubble {
  show: (selection: Selection, text: string, rect: DOMRect) => void;
  hide: () => void;
  isVisible: () => boolean;
}

interface TranslationResult {
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

// 全局状态
let shadowRoot: ShadowRoot | null = null;
let bubbleContainer: HTMLDivElement | null = null;
let isImmersiveMode = false;
let currentSelection: Selection | null = null;
// 拖动相关变量
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;
let currentBubble: HTMLDivElement | null = null;
// 扩展状态
let extensionInitialized = false;
let retryCount = 0;
const MAX_RETRY_COUNT = 3;

// 初始化扩展
async function initializeExtension(): Promise<boolean> {
  try {
    if (extensionInitialized) return true;

    console.log('Initializing extension...');

    // 检查扩展状态
    const isReady = await checkExtensionStatus();
    if (isReady) {
      extensionInitialized = true;
      retryCount = 0;
      console.log('Extension initialized successfully');
      return true;
    } else {
      throw new Error('Extension not ready');
    }
  } catch (error) {
    console.warn('Extension initialization failed:', error);
    retryCount++;

    if (retryCount < MAX_RETRY_COUNT) {
      // 等待一段时间后重试
      console.log(`Will retry in 2 seconds... (attempt ${retryCount}/${MAX_RETRY_COUNT})`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return initializeExtension();
    } else {
      console.error('Extension initialization failed after max retries');
      // 重置状态，允许下次重试
      extensionInitialized = false;
      retryCount = 0;
      return false;
    }
  }
}

// 重置扩展状态
function resetExtensionState() {
  extensionInitialized = false;
  retryCount = 0;
  console.log('Extension state reset');
}

// 监听页面可见性变化，在页面重新激活时重置状态
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    resetExtensionState();
  }
});

// 监听页面卸载，清理状态
window.addEventListener('beforeunload', () => {
  resetExtensionState();
  // 清理防重复注入标记
  // @ts-ignore TypeScript不识别自定义属性，但这是有效的JavaScript
  delete window.__IMMERSIVE_TRANSLATE_LOADED__;
});

// 页面加载完成后自动初始化扩展
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Page loaded, initializing extension...');
  try {
    await initializeExtension();
  } catch (error) {
    console.warn('Auto-initialization failed:', error);
  }
});

// 如果页面已经加载完成，立即初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', async () => {
    console.log('Page loaded, initializing extension...');
    try {
      await initializeExtension();
    } catch (error) {
      console.warn('Auto-initialization failed:', error);
    }
  });
} else {
  // 页面已经加载完成，立即初始化
  console.log('Page already loaded, initializing extension...');
  initializeExtension().catch(error => {
    console.warn('Auto-initialization failed:', error);
  });
}

// 创建 Shadow DOM 容器
function createShadowContainer(): ShadowRoot {
  if (shadowRoot) return shadowRoot;

  const container = document.createElement('div');
  container.id = 'immersive-translate-container';
  container.style.cssText = `
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    z-index: 2147483647 !important;
    pointer-events: none !important;
  `;

  shadowRoot = container.attachShadow({ mode: 'open' });

  // 加载样式
  const styleLink = document.createElement('link');
  styleLink.rel = 'stylesheet';
  styleLink.href = chrome.runtime.getURL('contentStyle.css');
  shadowRoot.appendChild(styleLink);

  document.documentElement.appendChild(container);
  return shadowRoot;
}

// 与 Service Worker 通信
async function sendMessage(type: string, payload: any): Promise<TranslationResult> {
  return new Promise((resolve) => {
    try {
      // 检查扩展上下文是否有效
      if (!chrome.runtime?.sendMessage) {
        console.warn("Chrome runtime not available");
        resolve({
          ok: false,
          error: {
            code: 'RUNTIME_UNAVAILABLE',
            message: '运行时不可用'
          }
        });
        return;
      }

      chrome.runtime.sendMessage({ type, payload }, (response) => {
        if (chrome.runtime.lastError) {
          console.warn("Error sending message to service worker:", chrome.runtime.lastError.message);

          // 检查是否是扩展上下文失效错误
          if (chrome.runtime.lastError.message?.includes('Extension context invalidated')) {
            resolve({
              ok: false,
              error: {
                code: 'EXTENSION_CONTEXT_INVALIDATED',
                message: '扩展上下文已失效，请刷新页面重试'
              }
            });
          } else {
            resolve({
              ok: false,
              error: {
                code: 'RUNTIME_ERROR',
                message: chrome.runtime.lastError.message || 'Runtime error'
              }
            });
          }
        } else {
          resolve(response);
        }
      });
    } catch (error: any) {
      console.error("Failed to send message:", error);
      resolve({
        ok: false,
        error: {
          code: 'MESSAGE_SEND_ERROR',
          message: error.message || '消息发送失败'
        }
      });
    }
  });
}

// 检查扩展状态
async function checkExtensionStatus(): Promise<boolean> {
  try {
    // 检查chrome.runtime是否可用
    if (!chrome.runtime || !chrome.runtime.sendMessage) {
      console.warn('Chrome runtime not available');
      return false;
    }

    // 尝试发送一个简单的ping消息
    console.log('Sending ping to service worker...');
    const result = await sendMessage('ping', {});
    console.log('Ping result:', result);
    return result.ok;
  } catch (error) {
    console.warn('Extension status check failed:', error);
    return false;
  }
}

// 翻译文本
async function translateText(text: string, source: string = 'auto', target: string = 'zh'): Promise<TranslationResult> {
  try {
    // 首先初始化扩展
    const isInitialized = await initializeExtension();
    if (!isInitialized) {
      return {
        ok: false,
        error: {
          code: 'EXTENSION_NOT_READY',
          message: '扩展未就绪，请点击重试按钮或刷新页面'
        }
      };
    }

    const payload = {
      id: Date.now().toString(),
      text: text.trim(),
      source,
      target,
      format: 'text'
    };

    const result = await sendMessage('translate', payload);

    // 如果遇到扩展上下文失效错误，尝试重新初始化
    if (!result.ok && result.error?.code === 'EXTENSION_CONTEXT_INVALIDATED') {
      console.log('Extension context invalidated, attempting to reinitialize...');
      resetExtensionState();
      const reinitResult = await initializeExtension();
      if (reinitResult) {
        // 重新尝试翻译
        return await sendMessage('translate', payload);
      }
    }

    return result;
  } catch (error: any) {
    console.error('Translation failed:', error);
    return {
      ok: false,
      error: {
        code: 'TRANSLATION_ERROR',
        message: error.message || '翻译失败'
      }
    };
  }
}

// 添加词汇到本地存储和后端
async function addToVocabulary(originalText: string, translatedText: string, context?: string): Promise<void> {
  try {
    // 创建词汇项
    const vocabularyItem = {
      original: originalText,
      translation: translatedText,
      context: context || window.location.href,
      timestamp: Date.now(),
      url: window.location.href,
      title: document.title
    };

    // 保存到本地存储
    const result = await chrome.storage.local.get('vocabulary');
    const vocabularyList = result.vocabulary || [];
    vocabularyList.push(vocabularyItem);
    
    // 限制词汇数量，保留最新的1000条
    if (vocabularyList.length > 1000) {
      vocabularyList.splice(0, vocabularyList.length - 1000);
    }
    
    await chrome.storage.local.set({ vocabulary: vocabularyList });

    // 同时发送到后端记录
    await recordWords(originalText);
    
    console.log('Vocabulary added successfully:', vocabularyItem);
  } catch (error) {
    console.error('Failed to add vocabulary:', error);
    throw error;
  }
}

// 记录单词到后端
async function recordWords(text: string, userId: number = 1): Promise<void> {
  try {
    const result = await sendMessage('recordWords', { text, userId });
    
    if (!result.ok) {
      throw new Error(result.error?.message || '记录单词失败');
    }
    
    console.log('Words recorded successfully:', result.data);
  } catch (error) {
    console.error('Failed to record words:', error);
    // 记录单词失败不应该影响用户体验，所以这里只打印错误
  }
}

// 创建翻译气泡
function createTranslationBubble(): TranslationBubble {
  let bubble: HTMLDivElement | null = null;
  let isVisible = false;

  const show = async (selection: Selection, text: string, rect: DOMRect) => {
    if (text.length < 1 || text.length > 1000) return;

    const shadow = createShadowContainer();

    // 移除旧气泡
    if (bubble) {
      bubble.remove();
    }

    // 创建气泡容器
    bubble = document.createElement('div');
    bubble.className = 'translation-bubble';
    bubble.style.cssText = `
      position: fixed;
      left: ${rect.left + rect.width / 2}px;
      top: ${rect.bottom + 8}px;
      transform: translateX(-50%);
      pointer-events: auto;
      z-index: 10000;
    `;

    // 气泡内容
    bubble.innerHTML = `
      <div class="bubble-content">
        <div class="bubble-header">
          <div class="original-text">${escapeHtml(text)}</div>
          <button class="btn-close" title="关闭翻译框">✕</button>
        </div>
        <div class="translation-loading">
          <div class="loading-spinner"></div>
          <span>翻译中...</span>
        </div>
        <div class="translation-result" style="display: none;">
          <div class="translated-text"></div>
          <div class="bubble-actions">
            <button class="btn-copy" title="复制翻译">📋</button>
            <button class="btn-replace" title="替换原文">🔄</button>
            <button class="btn-vocabulary" title="添加到词汇本">📚</button>
            <button class="btn-more" title="更多选项">⚙️</button>
          </div>
        </div>
        <div class="bubble-error" style="display: none;">
          <span class="error-message">翻译失败</span>
          <button class="btn-retry">重试</button>
        </div>
      </div>
      <div class="bubble-arrow"></div>
    `;

    shadow.appendChild(bubble);
    isVisible = true;
    currentBubble = bubble;

    // 绑定事件
    bindBubbleEvents(bubble, selection, text);
    bindDragEvents(bubble);

    // 开始翻译
    try {
      const result = await translateText(text);
      updateBubbleContent(bubble, result);
    } catch (error: any) {
      showBubbleError(bubble, error.message || '未知错误');
    }

    // 点击外部关闭
    setTimeout(() => {
      document.addEventListener('click', handleOutsideClick, true);
    }, 100);
  };

  const hide = () => {
    if (bubble) {
      bubble.remove();
      bubble = null;
      isVisible = false;
      currentBubble = null;
      document.removeEventListener('click', handleOutsideClick, true);
    }
  };

  const handleOutsideClick = (event: MouseEvent) => {
    if (bubble && event.target && !bubble.contains(event.target as Node)) {
      hide();
    }
  };

  return { show, hide, isVisible: () => isVisible };
}

// 绑定拖动事件
function bindDragEvents(bubble: HTMLDivElement) {
  let isDragging = false;
  let offsetX = 0, offsetY = 0;

  const bubbleHeader = bubble.querySelector('.bubble-header') as HTMLElement;
  if (!bubbleHeader) return;

  bubbleHeader.addEventListener('mousedown', (e) => {
    // 只有在标题栏上按下才触发拖动
    isDragging = true;
    const rect = bubble.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    // 防止文本选择
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const x = e.clientX - offsetX;
    const y = e.clientY - offsetY;

    bubble.style.left = `${x}px`;
    bubble.style.top = `${y}px`;
    bubble.style.transform = 'none'; // 移除原有的变换

    // 隐藏箭头
    const arrow = bubble.querySelector('.bubble-arrow') as HTMLElement;
    if (arrow) {
      arrow.style.display = 'none';
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });
}

// 绑定气泡事件
function bindBubbleEvents(bubble: HTMLDivElement, selection: Selection, originalText: string) {
  const closeBtn = bubble.querySelector('.btn-close') as HTMLButtonElement;
  const copyBtn = bubble.querySelector('.btn-copy') as HTMLButtonElement;
  const replaceBtn = bubble.querySelector('.btn-replace') as HTMLButtonElement;
  const vocabularyBtn = bubble.querySelector('.btn-vocabulary') as HTMLButtonElement;
  const moreBtn = bubble.querySelector('.btn-more') as HTMLButtonElement;
  const retryBtn = bubble.querySelector('.btn-retry') as HTMLButtonElement;

  // 关闭按钮事件
  closeBtn?.addEventListener('click', () => {
    translationBubble.hide();
  });

  copyBtn?.addEventListener('click', () => {
    const translatedText = bubble.querySelector('.translated-text')?.textContent;
    if (translatedText) {
      navigator.clipboard.writeText(translatedText).then(() => {
        showToast('已复制到剪贴板');
      });
    }
  });

  replaceBtn?.addEventListener('click', () => {
    const translatedText = bubble.querySelector('.translated-text')?.textContent;
    if (translatedText && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(translatedText));
      selection.removeAllRanges();
      translationBubble.hide();
      showToast('已替换原文');
    }
  });

  vocabularyBtn?.addEventListener('click', async () => {
    const translatedText = bubble.querySelector('.translated-text')?.textContent;
    if (translatedText && originalText) {
      try {
        await addToVocabulary(originalText, translatedText);
        showToast('已添加到词汇本');
      } catch (error) {
        showToast('添加到词汇本失败');
        console.error('Add to vocabulary failed:', error);
      }
    }
  });

  moreBtn?.addEventListener('click', () => {
    openImmersiveMode(originalText);
  });

  retryBtn?.addEventListener('click', async () => {
    // 检查bubble是否仍然存在
    if (!bubble || !document.contains(bubble)) {
      console.warn('Bubble no longer exists, skipping retry');
      return;
    }
    
    showBubbleLoading(bubble);
    try {
      const result = await translateText(originalText);
      updateBubbleContent(bubble, result);
    } catch (error: any) {
      showBubbleError(bubble, error.message || '未知错误');
    }
  });
}

// 更新气泡内容
function updateBubbleContent(bubble: HTMLDivElement | null, result: TranslationResult) {
  // 检查bubble是否存在
  if (!bubble) {
    console.warn('Bubble is null, cannot update content');
    return;
  }

  const loadingEl = bubble.querySelector('.translation-loading') as HTMLDivElement;
  const resultEl = bubble.querySelector('.translation-result') as HTMLDivElement;
  const errorEl = bubble.querySelector('.bubble-error') as HTMLDivElement;
  const translatedTextEl = bubble.querySelector('.translated-text') as HTMLDivElement;

  // 检查所有必需的元素是否存在
  if (!loadingEl || !resultEl || !errorEl || !translatedTextEl) {
    console.warn('Required bubble elements not found for content update');
    return;
  }

  loadingEl.style.display = 'none';
  errorEl.style.display = 'none';

  if (result.ok && result.data) {
    // 创建带内联样式的翻译气泡容器
    const bubbleDiv = document.createElement('div');
    bubbleDiv.textContent = result.data.translatedText;
    Object.assign(bubbleDiv.style, {
      backgroundColor: '#f9f9f9',
      color: '#000',
      borderRadius: '8px',
      padding: '8px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      fontSize: '14px',
      lineHeight: '1.6',
      maxWidth: '300px',
      wordWrap: 'break-word',
      whiteSpace: 'pre-wrap',
      zIndex: '999999',
      display: 'inline-block',
      pointerEvents: 'none',
      backdropFilter: 'blur(1px)',
      border: '1px solid rgba(0, 0, 0, 0.1)',
    });

    // 检测暗色模式
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      bubbleDiv.style.backgroundColor = 'rgba(30, 30, 30, 0.95)';
      bubbleDiv.style.color = '#fff';
      bubbleDiv.style.border = '1px solid rgba(255, 255, 255, 0.1)';
    }

    // 清空原来的translatedTextEl并添加新的包装元素
    translatedTextEl.innerHTML = '';
    translatedTextEl.appendChild(bubbleDiv);
    resultEl.style.display = 'block';
  } else {
    showBubbleError(bubble, result.error?.message || '翻译失败');
  }
}

// 显示气泡加载状态
function showBubbleLoading(bubble: HTMLDivElement | null) {
  // 检查bubble是否存在
  if (!bubble) {
    console.warn('Bubble is null, cannot show loading');
    return;
  }

  // 检查bubble是否仍在DOM中
  if (!document.contains(bubble)) {
    console.warn('Bubble is no longer in DOM, cannot show loading');
    return;
  }

  // 使用可选链操作符安全地查询元素
  const loadingEl = bubble.querySelector('.translation-loading') as HTMLDivElement | null;
  const resultEl = bubble.querySelector('.translation-result') as HTMLDivElement | null;
  const errorEl = bubble.querySelector('.bubble-error') as HTMLDivElement | null;

  // 检查所有必需的元素是否存在
  if (!loadingEl || !resultEl || !errorEl) {
    console.warn('Required bubble elements not found for loading');
    return;
  }

  // 安全地设置样式
  if (loadingEl) loadingEl.style.display = 'block';
  if (resultEl) resultEl.style.display = 'none';
  if (errorEl) errorEl.style.display = 'none';
}

// 显示气泡错误
function showBubbleError(bubble: HTMLDivElement | null, message: string) {
  // 检查bubble是否存在
  if (!bubble) {
    console.warn('Bubble is null, cannot show error:', message);
    return;
  }

  const loadingEl = bubble.querySelector('.translation-loading') as HTMLDivElement;
  const resultEl = bubble.querySelector('.translation-result') as HTMLDivElement;
  const errorEl = bubble.querySelector('.bubble-error') as HTMLDivElement;
  const errorMessageEl = bubble.querySelector('.error-message') as HTMLSpanElement;

  // 检查所有必需的元素是否存在
  if (!loadingEl || !resultEl || !errorEl || !errorMessageEl) {
    console.warn('Required bubble elements not found');
    return;
  }

  loadingEl.style.display = 'none';
  resultEl.style.display = 'none';
  errorMessageEl.textContent = message;
  errorEl.style.display = 'block';
}

// 打开沉浸式模式
function openImmersiveMode(text: string) {
  if (isImmersiveMode) return;

  isImmersiveMode = true;
  translationBubble.hide();

  // 创建沉浸式覆盖层
  const overlay = document.createElement('div');
  overlay.className = 'immersive-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.8);
    z-index: 2147483646;
    pointer-events: auto;
  `;

  overlay.innerHTML = `
    <div class="immersive-content">
      <div class="immersive-header">
        <h3>沉浸式翻译</h3>
        <button class="btn-close">✕</button>
      </div>
      <div class="immersive-body">
        <div class="original-panel">
          <h4>原文</h4>
          <div class="text-content">${escapeHtml(text)}</div>
        </div>
        <div class="translation-panel">
          <h4>译文</h4>
          <div class="text-content loading">翻译中...</div>
        </div>
      </div>
      <div class="immersive-footer">
        <button class="btn-copy-all">复制译文</button>
        <button class="btn-replace-all">替换页面文本</button>
      </div>
    </div>
  `;

  const shadow = createShadowContainer();
  shadow.appendChild(overlay);

  // 绑定事件
  const closeBtn = overlay.querySelector('.btn-close') as HTMLButtonElement;
  const copyAllBtn = overlay.querySelector('.btn-copy-all') as HTMLButtonElement;
  const replaceAllBtn = overlay.querySelector('.btn-replace-all') as HTMLButtonElement;

  closeBtn.addEventListener('click', () => {
    overlay.remove();
    isImmersiveMode = false;
  });

  // 开始翻译
  translateText(text).then(result => {
    const translationPanel = overlay.querySelector('.translation-panel .text-content') as HTMLDivElement;
    if (result.ok && result.data) {
      translationPanel.textContent = result.data.translatedText;
      translationPanel.classList.remove('loading');

      // 绑定复制和替换事件
      copyAllBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(result.data!.translatedText).then(() => {
          showToast('已复制到剪贴板');
        });
      });

      replaceAllBtn.addEventListener('click', () => {
        if (currentSelection && currentSelection.rangeCount > 0) {
          const range = currentSelection.getRangeAt(0);
          range.deleteContents();
          range.insertNode(document.createTextNode(result.data!.translatedText));
          currentSelection.removeAllRanges();
        }
        overlay.remove();
        isImmersiveMode = false;
        showToast('已替换原文');
      });
    } else {
      translationPanel.textContent = '翻译失败：' + (result.error?.message || '未知错误');
      translationPanel.classList.remove('loading');
    }
  });

  // ESC 键关闭
  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      overlay.remove();
      isImmersiveMode = false;
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}

// 显示提示消息
function showToast(message: string) {
  const shadow = createShadowContainer();
  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #333;
    color: white;
    padding: 12px 20px;
    border-radius: 6px;
    z-index: 10001;
    pointer-events: auto;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;

  shadow.appendChild(toast);

  // 动画显示
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
  });

  // 3秒后自动消失
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// HTML 转义
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 获取选中文本和位置
function getSelectionInfo(): { text: string; rect: DOMRect } | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const text = selection.toString().trim();
  if (!text || text.length < 1 || text.length > 1000) return null;

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  return { text, rect };
}

// 创建翻译气泡实例
const translationBubble = createTranslationBubble();

// 事件监听器
document.addEventListener('mouseup', () => {
  // 延迟检查选择，确保选择已完成
  setTimeout(() => {
    const selectionInfo = getSelectionInfo();
    if (selectionInfo) {
      currentSelection = window.getSelection();
      translationBubble.show(currentSelection!, selectionInfo.text, selectionInfo.rect);
    } else if (!translationBubble.isVisible()) {
      translationBubble.hide();
    }
  }, 100);
});

// 双击翻译
document.addEventListener('dblclick', () => {
  setTimeout(() => {
    const selectionInfo = getSelectionInfo();
    if (selectionInfo) {
      currentSelection = window.getSelection();
      translationBubble.show(currentSelection!, selectionInfo.text, selectionInfo.rect);
    }
  }, 100);
});

// 键盘快捷键
document.addEventListener('keydown', (event) => {
  // Esc 关闭气泡
  if (event.key === 'Escape') {
    translationBubble.hide();
  }

  // Ctrl+Shift+Y 开启沉浸式模式
  if (event.ctrlKey && event.shiftKey && event.key === 'Y') {
    event.preventDefault();
    const selectionInfo = getSelectionInfo();
    if (selectionInfo) {
      currentSelection = window.getSelection();
      openImmersiveMode(selectionInfo.text);
    }
  }
});

// 监听来自 Service Worker 的消息
chrome.runtime.onMessage.addListener((message, _sender) => {
  if (message.type === 'toggleImmersive') {
    const selectionInfo = getSelectionInfo();
    if (selectionInfo) {
      currentSelection = window.getSelection();
      openImmersiveMode(selectionInfo.text);
    }
  }
});

console.log('Immersive Translate Content Script loaded');