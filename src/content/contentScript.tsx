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
  styleLink.href = chrome.runtime.getURL('src/content/contentStyle.css');
  shadowRoot.appendChild(styleLink);

  document.documentElement.appendChild(container);
  return shadowRoot;
}

// 与 Service Worker 通信
async function sendMessage(type: string, payload: any): Promise<TranslationResult> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type, payload }, (response) => {
      if (chrome.runtime.lastError) {
        resolve({
          ok: false,
          error: {
            code: 'RUNTIME_ERROR',
            message: chrome.runtime.lastError.message || 'Runtime error'
          }
        });
      } else {
        resolve(response);
      }
    });
  });
}

// 翻译文本
async function translateText(text: string, source: string = 'auto', target: string = 'zh'): Promise<TranslationResult> {
  const payload = {
    id: Date.now().toString(),
    text: text.trim(),
    source,
    target,
    format: 'text'
  };

  return await sendMessage('translate', payload);
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

    // 绑定事件
    bindBubbleEvents(bubble, selection, text);

    // 开始翻译
    try {
      const result = await translateText(text);
      updateBubbleContent(bubble, result);
    } catch (error) {
      showBubbleError(bubble, error.message);
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
      document.removeEventListener('click', handleOutsideClick, true);
    }
  };

  const handleOutsideClick = (event: Event) => {
    if (bubble && event.target && !bubble.contains(event.target as Node)) {
      hide();
    }
  };

  return { show, hide, isVisible: () => isVisible };
}

// 绑定气泡事件
function bindBubbleEvents(bubble: HTMLDivElement, selection: Selection, originalText: string) {
  const closeBtn = bubble.querySelector('.btn-close') as HTMLButtonElement;
  const copyBtn = bubble.querySelector('.btn-copy') as HTMLButtonElement;
  const replaceBtn = bubble.querySelector('.btn-replace') as HTMLButtonElement;
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

  moreBtn?.addEventListener('click', () => {
    openImmersiveMode(originalText);
  });

  retryBtn?.addEventListener('click', async () => {
    showBubbleLoading(bubble);
    try {
      const result = await translateText(originalText);
      updateBubbleContent(bubble, result);
    } catch (error) {
      showBubbleError(bubble, error.message);
    }
  });
}

// 更新气泡内容
function updateBubbleContent(bubble: HTMLDivElement, result: TranslationResult) {
  const loadingEl = bubble.querySelector('.translation-loading') as HTMLDivElement;
  const resultEl = bubble.querySelector('.translation-result') as HTMLDivElement;
  const errorEl = bubble.querySelector('.bubble-error') as HTMLDivElement;
  const translatedTextEl = bubble.querySelector('.translated-text') as HTMLDivElement;

  loadingEl.style.display = 'none';
  errorEl.style.display = 'none';

  if (result.ok && result.data) {
    translatedTextEl.textContent = result.data.translatedText;
    resultEl.style.display = 'block';
  } else {
    showBubbleError(bubble, result.error?.message || '翻译失败');
  }
}

// 显示气泡加载状态
function showBubbleLoading(bubble: HTMLDivElement) {
  const loadingEl = bubble.querySelector('.translation-loading') as HTMLDivElement;
  const resultEl = bubble.querySelector('.translation-result') as HTMLDivElement;
  const errorEl = bubble.querySelector('.bubble-error') as HTMLDivElement;

  loadingEl.style.display = 'block';
  resultEl.style.display = 'none';
  errorEl.style.display = 'none';
}

// 显示气泡错误
function showBubbleError(bubble: HTMLDivElement, message: string) {
  const loadingEl = bubble.querySelector('.translation-loading') as HTMLDivElement;
  const resultEl = bubble.querySelector('.translation-result') as HTMLDivElement;
  const errorEl = bubble.querySelector('.bubble-error') as HTMLDivElement;
  const errorMessageEl = bubble.querySelector('.error-message') as HTMLSpanElement;

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
document.addEventListener('mouseup', (event) => {
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
document.addEventListener('dblclick', (event) => {
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
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'toggleImmersive') {
    const selectionInfo = getSelectionInfo();
    if (selectionInfo) {
      currentSelection = window.getSelection();
      openImmersiveMode(selectionInfo.text);
    }
  }
});

console.log('Immersive Translate Content Script loaded');