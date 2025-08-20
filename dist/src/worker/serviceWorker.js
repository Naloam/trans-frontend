console.log("Service Worker starting...");
class SimpleTranslationService {
  async translate(text, source, target) {
    try {
      const response = await fetch("http://localhost:8000/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          segments: [{
            id: Date.now().toString(),
            text
          }],
          target_language: target === "zh" ? "中文" : "英文",
          model_name: "qwen-turbo-latest",
          identity: "通用专家",
          extra_instructions: "请提供准确的翻译"
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
          source: "online"
        }
      };
    } catch (error) {
      console.error("Translation failed:", error);
      return {
        ok: false,
        error: {
          code: "TRANSLATION_FAILED",
          message: error.message
        }
      };
    }
  }
  async recordWords(text, userId = 1) {
    try {
      const response = await fetch("http://localhost:8000/record-words", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text,
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
    } catch (error) {
      console.error("Record words failed:", error);
      return {
        ok: false,
        error: {
          code: "RECORD_WORDS_FAILED",
          message: error.message
        }
      };
    }
  }
}
const simpleTranslationService = new SimpleTranslationService();
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log("Service Worker received message:", message.type);
  if (message.type === "ping") {
    console.log("Ping received from content script");
    sendResponse({
      ok: true,
      data: {
        status: "ready",
        timestamp: Date.now()
      }
    });
    return true;
  }
  if (message.type === "translate") {
    simpleTranslationService.translate(
      message.payload.text,
      message.payload.source,
      message.payload.target
    ).then((result) => {
      sendResponse(result);
    }).catch((error) => {
      sendResponse({
        ok: false,
        error: {
          code: "HANDLER_ERROR",
          message: error.message
        }
      });
    });
    return true;
  }
  if (message.type === "recordWords") {
    simpleTranslationService.recordWords(
      message.payload.text,
      message.payload.userId || 1
    ).then((result) => {
      sendResponse(result);
    }).catch((error) => {
      sendResponse({
        ok: false,
        error: {
          code: "HANDLER_ERROR",
          message: error.message
        }
      });
    });
    return true;
  }
  switch (message.type) {
    case "languages":
      sendResponse({
        ok: true,
        data: {
          languages: [
            { code: "auto", name: "自动检测" },
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
    default:
      sendResponse({
        ok: false,
        error: {
          code: "UNKNOWN_MESSAGE_TYPE",
          message: `Unknown message type: ${message.type}`
        }
      });
  }
});
chrome.runtime.onInstalled.addListener(() => {
  console.log("Service Worker installed");
  try {
    chrome.contextMenus.create({
      id: "translateSelection",
      title: "翻译选中文本",
      contexts: ["selection"]
    });
    chrome.contextMenus.create({
      id: "immersiveTranslate",
      title: "沉浸式翻译",
      contexts: ["page"]
    });
    console.log("Context menus created");
  } catch (error) {
    console.error("Failed to create context menus:", error);
  }
});
chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log("Context menu clicked:", info.menuItemId);
  if (!tab?.id) {
    console.error("Tab ID is undefined");
    return;
  }
  if (info.menuItemId === "translateSelection" && info.selectionText) {
    chrome.tabs.sendMessage(tab.id, {
      type: "translateSelection",
      text: info.selectionText
    });
  } else if (info.menuItemId === "immersiveTranslate") {
    chrome.tabs.sendMessage(tab.id, {
      type: "toggleImmersiveTranslation"
    });
  }
});
chrome.commands.onCommand.addListener((command, tab) => {
  console.log("Command triggered:", command);
  if (command === "toggle-immersive" && tab?.id) {
    chrome.tabs.sendMessage(tab.id, {
      type: "toggleImmersiveTranslation"
    });
  }
});
console.log("Simple Service Worker loaded successfully");
//# sourceMappingURL=serviceWorker.js.map
