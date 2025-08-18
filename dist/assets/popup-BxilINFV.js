import { r as reactExports, j as jsxRuntimeExports, c as createRoot } from "./tailwind-Cqpfzv93.js";
const LANGUAGES = [
  { code: "auto", name: "自动检测" },
  { code: "zh", name: "中文" },
  { code: "en", name: "English" },
  { code: "ja", name: "日本語" },
  { code: "ko", name: "한국어" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "es", name: "Español" },
  { code: "ru", name: "Русский" },
  { code: "ar", name: "العربية" }
];
const MODELS = [
  { value: "deepseek-chat", name: "DeepSeek（deepseek-chat）" },
  { value: "qwen-turbo-latest", name: "阿里云百炼（qwen-turbo-latest）" },
  { value: "gpt-4o", name: "OpenAI（gpt-4o）" },
  { value: "kimi-k2-0711-preview", name: "Moonshot Kimi（kimi-k2-0711-preview）" }
];
const IDENTITY_DESCRIPTIONS = {
  "通用专家": "你是一个通用领域的翻译专家，擅长各种类型的文本翻译。",
  "学术论文翻译师": "你是一个专业的学术论文翻译师，擅长将学术术语的文本准确翻译成目标语言，保持学术术语的准确性和语言的严谨性。",
  "意译长官": "你是一个专业的意译长官，擅长在翻译过程中保持原文的语境和风味，使译文更符合目标语言的文化背景和表达习惯。",
  "程序专家": "你是一个专业的程序专家，擅长翻译与编程、软件开发相关的技术文档，能够准确处理技术术语和代码注释。",
  "古今中外翻译师": "你是一个多语言自，阅读过古今中外名著的翻译专家，擅长将不同语言的文本翻译成目标语言，并熟悉中国汉语和中世纪英语或是拉丁语。"
};
const IDENTITY_OPTIONS = Object.keys(IDENTITY_DESCRIPTIONS).map((key) => ({
  value: key,
  label: key
}));
const Popup = () => {
  const [inputText, setInputText] = reactExports.useState("");
  const [translatedText, setTranslatedText] = reactExports.useState("");
  const [sourceLang, setSourceLang] = reactExports.useState("auto");
  const [targetLang, setTargetLang] = reactExports.useState("zh");
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const [alternatives, setAlternatives] = reactExports.useState([]);
  const [selectedModel, setSelectedModel] = reactExports.useState("gpt-4o");
  const [selectedIdentity, setSelectedIdentity] = reactExports.useState("通用专家");
  const [isImageTranslationEnabled, setIsImageTranslationEnabled] = reactExports.useState(true);
  const [isDocumentTranslationEnabled, setIsDocumentTranslationEnabled] = reactExports.useState(true);
  reactExports.useEffect(() => {
    chrome.storage.local.get(["defaultSourceLang", "defaultTargetLang", "enableImageTranslation", "enableDocumentTranslation"], (result) => {
      if (result.defaultSourceLang) setSourceLang(result.defaultSourceLang);
      if (result.defaultTargetLang) setTargetLang(result.defaultTargetLang);
      if (result.enableImageTranslation !== void 0) setIsImageTranslationEnabled(result.enableImageTranslation);
      if (result.enableDocumentTranslation !== void 0) setIsDocumentTranslationEnabled(result.enableDocumentTranslation);
    });
  }, []);
  const saveLanguageSettings = reactExports.useCallback(() => {
    chrome.storage.local.set({
      defaultSourceLang: sourceLang,
      defaultTargetLang: targetLang
    });
  }, [sourceLang, targetLang]);
  const handleTranslate = reactExports.useCallback(async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setError(null);
    setTranslatedText("");
    setAlternatives([]);
    try {
      const response = await new Promise((resolve) => {
        chrome.runtime.sendMessage({
          type: "translate",
          payload: {
            id: Date.now().toString(),
            text: inputText.trim(),
            source: sourceLang,
            target: targetLang,
            format: "text"
          }
        }, resolve);
      });
      if (response.ok && response.data) {
        setTranslatedText(response.data.translatedText);
        setAlternatives(response.data.alternatives || []);
        chrome.storage.local.get(["translationHistory"], (result) => {
          const history = result.translationHistory || [];
          history.unshift({
            original: inputText.trim(),
            translated: response.data.translatedText,
            sourceLang,
            targetLang,
            timestamp: Date.now()
          });
          chrome.storage.local.set({
            translationHistory: history.slice(0, 50)
          });
        });
      } else {
        setError(response.error?.message || "翻译失败");
      }
    } catch (err) {
      setError("网络连接失败");
    } finally {
      setIsLoading(false);
    }
  }, [inputText, sourceLang, targetLang]);
  const handleFileSelect = reactExports.useCallback((accept, type) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.onchange = (event) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          chrome.runtime.sendMessage({
            type: type === "image" ? "translateImage" : "translateDocument",
            payload: {
              file: reader.result,
              fileName: file.name,
              fileType: file.type
            }
          }, (response) => {
            if (chrome.runtime.lastError) {
              console.warn("Error sending message to service worker:", chrome.runtime.lastError.message);
              setError("发送消息到后台服务时出错");
              return;
            }
            if (response.ok) {
              setTranslatedText(response.data.translatedText);
            } else {
              setError(response.error?.message || "文件翻译失败");
            }
          });
        };
        reader.readAsArrayBuffer(file);
      }
    };
    input.click();
  }, []);
  const handleSwapLanguages = reactExports.useCallback(() => {
    if (sourceLang === "auto") {
      setSourceLang(targetLang);
      setTargetLang("en");
    } else {
      const temp = sourceLang;
      setSourceLang(targetLang);
      setTargetLang(temp);
    }
    saveLanguageSettings();
  }, [sourceLang, targetLang, saveLanguageSettings]);
  const handleCopy = reactExports.useCallback(() => {
    if (translatedText) {
      navigator.clipboard.writeText(translatedText);
    }
  }, [translatedText]);
  const handleClear = reactExports.useCallback(() => {
    setInputText("");
    setTranslatedText("");
    setError(null);
    setAlternatives([]);
  }, []);
  const handleOpenSettings = reactExports.useCallback(() => {
    chrome.runtime.openOptionsPage();
  }, []);
  const handleKeyDown = reactExports.useCallback((event) => {
    if (event.ctrlKey && event.key === "Enter") {
      event.preventDefault();
      handleTranslate();
    }
  }, [handleTranslate]);
  reactExports.useEffect(() => {
    saveLanguageSettings();
  }, [saveLanguageSettings]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-96 min-h-[500px] bg-white", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "bg-blue-600 text-white p-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-lg font-semibold", children: "沉浸式翻译" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: handleOpenSettings,
          className: "p-2 hover:bg-blue-700 rounded transition-colors",
          title: "打开设置页面",
          "aria-label": "打开设置页面",
          type: "button",
          children: "⚙️"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "p-4 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "翻译模型" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "select",
          {
            value: selectedModel,
            onChange: (e) => setSelectedModel(e.target.value),
            className: "w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            "aria-label": "翻译模型",
            children: MODELS.map((model) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: model.value, children: model.name }, model.value))
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "AI身份" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "select",
          {
            value: selectedIdentity,
            onChange: (e) => setSelectedIdentity(e.target.value),
            className: "w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            "aria-label": "AI身份",
            children: IDENTITY_OPTIONS.map((option) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: option.value, children: option.label }, option.value))
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "select",
          {
            value: sourceLang,
            onChange: (e) => setSourceLang(e.target.value),
            className: "flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            "aria-label": "源语言",
            children: LANGUAGES.map((lang) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: lang.code, children: lang.name }, lang.code))
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: handleSwapLanguages,
            className: "p-2 text-gray-600 hover:text-blue-600 transition-colors",
            title: "交换语言",
            type: "button",
            children: "⇄"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "select",
          {
            value: targetLang,
            onChange: (e) => setTargetLang(e.target.value),
            className: "flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            "aria-label": "目标语言",
            children: LANGUAGES.filter((lang) => lang.code !== "auto").map((lang) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: lang.code, children: lang.name }, lang.code))
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "textarea",
          {
            value: inputText,
            onChange: (e) => setInputText(e.target.value),
            onKeyDown: handleKeyDown,
            placeholder: "输入要翻译的文本...",
            className: "w-full h-32 p-3 border border-gray-300 rounded resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            maxLength: 1e3
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-2 right-2 flex items-center space-x-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-500", children: [
            inputText.length,
            "/1000"
          ] }),
          inputText && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: handleClear,
              className: "text-gray-400 hover:text-gray-600 transition-colors",
              title: "清空输入",
              type: "button",
              children: "✕"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: handleTranslate,
          disabled: !inputText.trim() || isLoading,
          className: "w-full py-3 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors",
          type: "button",
          children: isLoading ? "翻译中..." : "翻译"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex space-x-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => handleFileSelect("image/*", "image"),
            disabled: !isImageTranslationEnabled,
            className: `flex-1 py-2 px-4 rounded font-medium transition-colors ${isImageTranslationEnabled ? "bg-purple-600 text-white hover:bg-purple-700" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`,
            type: "button",
            children: "图片翻译"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => handleFileSelect(".txt,.docx,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document", "document"),
            disabled: !isDocumentTranslationEnabled,
            className: `flex-1 py-2 px-4 rounded font-medium transition-colors ${isDocumentTranslationEnabled ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`,
            type: "button",
            children: "文件翻译"
          }
        )
      ] }),
      error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 bg-red-50 border border-red-200 rounded text-red-700", children: [
        "❌ ",
        error
      ] }),
      translatedText && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative p-3 bg-gray-50 border border-gray-200 rounded", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-gray-800 leading-relaxed", children: translatedText }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: handleCopy,
              className: "absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 transition-colors",
              title: "复制翻译结果",
              type: "button",
              children: "📋"
            }
          )
        ] }),
        alternatives.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-medium text-gray-700", children: "其他翻译:" }),
          alternatives.map((alt, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "p-2 bg-white border border-gray-200 rounded text-sm text-gray-600 cursor-pointer hover:bg-gray-50 transition-colors",
              onClick: () => setTranslatedText(alt),
              children: alt
            },
            index
          ))
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("footer", { className: "p-4 border-t border-gray-200 text-xs text-gray-500 text-center", children: "快捷键: Ctrl+Enter 翻译" })
  ] });
};
const container = document.getElementById("popup-root");
if (container) {
  const root = createRoot(container);
  root.render(/* @__PURE__ */ jsxRuntimeExports.jsx(Popup, {}));
} else {
  console.error("Popup root element not found");
}
//# sourceMappingURL=popup-BxilINFV.js.map
