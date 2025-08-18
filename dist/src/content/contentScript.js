let shadowRoot = null;
let isImmersiveMode = false;
let currentSelection = null;
let extensionInitialized = false;
let retryCount = 0;
const MAX_RETRY_COUNT = 3;
async function initializeExtension() {
  try {
    if (extensionInitialized) return true;
    const isReady = await checkExtensionStatus();
    if (isReady) {
      extensionInitialized = true;
      retryCount = 0;
      console.log("Extension initialized successfully");
      return true;
    } else {
      throw new Error("Extension not ready");
    }
  } catch (error) {
    console.warn("Extension initialization failed:", error);
    retryCount++;
    if (retryCount < MAX_RETRY_COUNT) {
      await new Promise((resolve) => setTimeout(resolve, 1e3));
      return initializeExtension();
    } else {
      console.error("Extension initialization failed after max retries");
      extensionInitialized = false;
      retryCount = 0;
      return false;
    }
  }
}
function resetExtensionState() {
  extensionInitialized = false;
  retryCount = 0;
  console.log("Extension state reset");
}
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    resetExtensionState();
  }
});
window.addEventListener("beforeunload", () => {
  resetExtensionState();
});
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Page loaded, initializing extension...");
  try {
    await initializeExtension();
  } catch (error) {
    console.warn("Auto-initialization failed:", error);
  }
});
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", async () => {
    console.log("Page loaded, initializing extension...");
    try {
      await initializeExtension();
    } catch (error) {
      console.warn("Auto-initialization failed:", error);
    }
  });
} else {
  console.log("Page already loaded, initializing extension...");
  initializeExtension().catch((error) => {
    console.warn("Auto-initialization failed:", error);
  });
}
function createShadowContainer() {
  if (shadowRoot) return shadowRoot;
  const container = document.createElement("div");
  container.id = "immersive-translate-container";
  container.style.cssText = `
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    z-index: 2147483647 !important;
    pointer-events: none !important;
  `;
  shadowRoot = container.attachShadow({ mode: "open" });
  const styleLink = document.createElement("link");
  styleLink.rel = "stylesheet";
  styleLink.href = chrome.runtime.getURL("contentStyle.css");
  shadowRoot.appendChild(styleLink);
  document.documentElement.appendChild(container);
  return shadowRoot;
}
async function sendMessage(type, payload) {
  return new Promise((resolve) => {
    try {
      chrome.runtime.sendMessage({ type, payload }, (response) => {
        if (chrome.runtime.lastError) {
          console.warn("Error sending message to service worker:", chrome.runtime.lastError.message);
          if (chrome.runtime.lastError.message?.includes("Extension context invalidated")) {
            resolve({
              ok: false,
              error: {
                code: "EXTENSION_CONTEXT_INVALIDATED",
                message: "扩展上下文已失效，请刷新页面重试"
              }
            });
          } else {
            resolve({
              ok: false,
              error: {
                code: "RUNTIME_ERROR",
                message: chrome.runtime.lastError.message || "Runtime error"
              }
            });
          }
        } else {
          resolve(response);
        }
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      resolve({
        ok: false,
        error: {
          code: "MESSAGE_SEND_ERROR",
          message: error.message || "消息发送失败"
        }
      });
    }
  });
}
async function checkExtensionStatus() {
  try {
    if (!chrome.runtime || !chrome.runtime.sendMessage) {
      console.warn("Chrome runtime not available");
      return false;
    }
    const result = await sendMessage("ping", {});
    return result.ok;
  } catch (error) {
    console.warn("Extension status check failed:", error);
    return false;
  }
}
async function translateText(text, source = "auto", target = "zh") {
  try {
    const isInitialized = await initializeExtension();
    if (!isInitialized) {
      return {
        ok: false,
        error: {
          code: "EXTENSION_NOT_READY",
          message: "扩展未就绪，请点击重试按钮或刷新页面"
        }
      };
    }
    const payload = {
      id: Date.now().toString(),
      text: text.trim(),
      source,
      target,
      format: "text"
    };
    const result = await sendMessage("translate", payload);
    if (!result.ok && result.error?.code === "EXTENSION_CONTEXT_INVALIDATED") {
      console.log("Extension context invalidated, attempting to reinitialize...");
      resetExtensionState();
      const reinitResult = await initializeExtension();
      if (reinitResult) {
        return await sendMessage("translate", payload);
      }
    }
    return result;
  } catch (error) {
    console.error("Translation failed:", error);
    return {
      ok: false,
      error: {
        code: "TRANSLATION_ERROR",
        message: error.message || "翻译失败"
      }
    };
  }
}
function createTranslationBubble() {
  let bubble = null;
  let isVisible = false;
  const show = async (selection, text, rect) => {
    if (text.length < 1 || text.length > 1e3) return;
    const shadow = createShadowContainer();
    if (bubble) {
      bubble.remove();
    }
    bubble = document.createElement("div");
    bubble.className = "translation-bubble";
    bubble.style.cssText = `
      position: fixed;
      left: ${rect.left + rect.width / 2}px;
      top: ${rect.bottom + 8}px;
      transform: translateX(-50%);
      pointer-events: auto;
      z-index: 10000;
    `;
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
    bindBubbleEvents(bubble, selection, text);
    bindDragEvents(bubble);
    try {
      const result = await translateText(text);
      updateBubbleContent(bubble, result);
    } catch (error) {
      showBubbleError(bubble, error.message || "未知错误");
    }
    setTimeout(() => {
      document.addEventListener("click", handleOutsideClick, true);
    }, 100);
  };
  const hide = () => {
    if (bubble) {
      bubble.remove();
      bubble = null;
      isVisible = false;
      document.removeEventListener("click", handleOutsideClick, true);
    }
  };
  const handleOutsideClick = (event) => {
    if (bubble && event.target && !bubble.contains(event.target)) {
      hide();
    }
  };
  return { show, hide, isVisible: () => isVisible };
}
function bindDragEvents(bubble) {
  let isDragging2 = false;
  let offsetX = 0, offsetY = 0;
  const bubbleHeader = bubble.querySelector(".bubble-header");
  if (!bubbleHeader) return;
  bubbleHeader.addEventListener("mousedown", (e) => {
    isDragging2 = true;
    const rect = bubble.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    e.preventDefault();
  });
  document.addEventListener("mousemove", (e) => {
    if (!isDragging2) return;
    const x = e.clientX - offsetX;
    const y = e.clientY - offsetY;
    bubble.style.left = `${x}px`;
    bubble.style.top = `${y}px`;
    bubble.style.transform = "none";
    const arrow = bubble.querySelector(".bubble-arrow");
    if (arrow) {
      arrow.style.display = "none";
    }
  });
  document.addEventListener("mouseup", () => {
    isDragging2 = false;
  });
}
function bindBubbleEvents(bubble, selection, originalText) {
  const closeBtn = bubble.querySelector(".btn-close");
  const copyBtn = bubble.querySelector(".btn-copy");
  const replaceBtn = bubble.querySelector(".btn-replace");
  const moreBtn = bubble.querySelector(".btn-more");
  const retryBtn = bubble.querySelector(".btn-retry");
  closeBtn?.addEventListener("click", () => {
    translationBubble.hide();
  });
  copyBtn?.addEventListener("click", () => {
    const translatedText = bubble.querySelector(".translated-text")?.textContent;
    if (translatedText) {
      navigator.clipboard.writeText(translatedText).then(() => {
        showToast("已复制到剪贴板");
      });
    }
  });
  replaceBtn?.addEventListener("click", () => {
    const translatedText = bubble.querySelector(".translated-text")?.textContent;
    if (translatedText && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(translatedText));
      selection.removeAllRanges();
      translationBubble.hide();
      showToast("已替换原文");
    }
  });
  moreBtn?.addEventListener("click", () => {
    openImmersiveMode(originalText);
  });
  retryBtn?.addEventListener("click", async () => {
    showBubbleLoading(bubble);
    try {
      const result = await translateText(originalText);
      updateBubbleContent(bubble, result);
    } catch (error) {
      showBubbleError(bubble, error.message || "未知错误");
    }
  });
}
function updateBubbleContent(bubble, result) {
  const loadingEl = bubble.querySelector(".translation-loading");
  const resultEl = bubble.querySelector(".translation-result");
  const errorEl = bubble.querySelector(".bubble-error");
  const translatedTextEl = bubble.querySelector(".translated-text");
  loadingEl.style.display = "none";
  errorEl.style.display = "none";
  if (result.ok && result.data) {
    const bubbleDiv = document.createElement("div");
    bubbleDiv.textContent = result.data.translatedText;
    Object.assign(bubbleDiv.style, {
      backgroundColor: "#f9f9f9",
      color: "#000",
      borderRadius: "8px",
      padding: "8px",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      fontSize: "14px",
      lineHeight: "1.6",
      maxWidth: "300px",
      wordWrap: "break-word",
      whiteSpace: "pre-wrap",
      zIndex: "999999",
      display: "inline-block",
      pointerEvents: "none",
      backdropFilter: "blur(1px)",
      border: "1px solid rgba(0, 0, 0, 0.1)"
    });
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      bubbleDiv.style.backgroundColor = "rgba(30, 30, 30, 0.95)";
      bubbleDiv.style.color = "#fff";
      bubbleDiv.style.border = "1px solid rgba(255, 255, 255, 0.1)";
    }
    translatedTextEl.innerHTML = "";
    translatedTextEl.appendChild(bubbleDiv);
    resultEl.style.display = "block";
  } else {
    showBubbleError(bubble, result.error?.message || "翻译失败");
  }
}
function showBubbleLoading(bubble) {
  const loadingEl = bubble.querySelector(".translation-loading");
  const resultEl = bubble.querySelector(".translation-result");
  const errorEl = bubble.querySelector(".bubble-error");
  loadingEl.style.display = "block";
  resultEl.style.display = "none";
  errorEl.style.display = "none";
}
function showBubbleError(bubble, message) {
  const loadingEl = bubble.querySelector(".translation-loading");
  const resultEl = bubble.querySelector(".translation-result");
  const errorEl = bubble.querySelector(".bubble-error");
  const errorMessageEl = bubble.querySelector(".error-message");
  loadingEl.style.display = "none";
  resultEl.style.display = "none";
  errorMessageEl.textContent = message;
  errorEl.style.display = "block";
}
function openImmersiveMode(text) {
  if (isImmersiveMode) return;
  isImmersiveMode = true;
  translationBubble.hide();
  const overlay = document.createElement("div");
  overlay.className = "immersive-overlay";
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
  const closeBtn = overlay.querySelector(".btn-close");
  const copyAllBtn = overlay.querySelector(".btn-copy-all");
  const replaceAllBtn = overlay.querySelector(".btn-replace-all");
  closeBtn.addEventListener("click", () => {
    overlay.remove();
    isImmersiveMode = false;
  });
  translateText(text).then((result) => {
    const translationPanel = overlay.querySelector(".translation-panel .text-content");
    if (result.ok && result.data) {
      translationPanel.textContent = result.data.translatedText;
      translationPanel.classList.remove("loading");
      copyAllBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(result.data.translatedText).then(() => {
          showToast("已复制到剪贴板");
        });
      });
      replaceAllBtn.addEventListener("click", () => {
        if (currentSelection && currentSelection.rangeCount > 0) {
          const range = currentSelection.getRangeAt(0);
          range.deleteContents();
          range.insertNode(document.createTextNode(result.data.translatedText));
          currentSelection.removeAllRanges();
        }
        overlay.remove();
        isImmersiveMode = false;
        showToast("已替换原文");
      });
    } else {
      translationPanel.textContent = "翻译失败：" + (result.error?.message || "未知错误");
      translationPanel.classList.remove("loading");
    }
  });
  const handleEscape = (event) => {
    if (event.key === "Escape") {
      overlay.remove();
      isImmersiveMode = false;
      document.removeEventListener("keydown", handleEscape);
    }
  };
  document.addEventListener("keydown", handleEscape);
}
function showToast(message) {
  const shadow = createShadowContainer();
  const toast = document.createElement("div");
  toast.className = "toast-message";
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
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
  });
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 3e3);
}
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
function getSelectionInfo() {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;
  const text = selection.toString().trim();
  if (!text || text.length < 1 || text.length > 1e3) return null;
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  return { text, rect };
}
const translationBubble = createTranslationBubble();
document.addEventListener("mouseup", () => {
  setTimeout(() => {
    const selectionInfo = getSelectionInfo();
    if (selectionInfo) {
      currentSelection = window.getSelection();
      translationBubble.show(currentSelection, selectionInfo.text, selectionInfo.rect);
    } else if (!translationBubble.isVisible()) {
      translationBubble.hide();
    }
  }, 100);
});
document.addEventListener("dblclick", () => {
  setTimeout(() => {
    const selectionInfo = getSelectionInfo();
    if (selectionInfo) {
      currentSelection = window.getSelection();
      translationBubble.show(currentSelection, selectionInfo.text, selectionInfo.rect);
    }
  }, 100);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    translationBubble.hide();
  }
  if (event.ctrlKey && event.shiftKey && event.key === "Y") {
    event.preventDefault();
    const selectionInfo = getSelectionInfo();
    if (selectionInfo) {
      currentSelection = window.getSelection();
      openImmersiveMode(selectionInfo.text);
    }
  }
});
chrome.runtime.onMessage.addListener((message, _sender) => {
  if (message.type === "toggleImmersive") {
    const selectionInfo = getSelectionInfo();
    if (selectionInfo) {
      currentSelection = window.getSelection();
      openImmersiveMode(selectionInfo.text);
    }
  }
});
console.log("Immersive Translate Content Script loaded");
//# sourceMappingURL=contentScript.js.map
