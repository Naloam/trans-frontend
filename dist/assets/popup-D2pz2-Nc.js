import { r as reactExports, j as jsxRuntimeExports, c as createRoot } from "./tailwind-BFkkMHBD.js";
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
const Popup = () => {
  const [inputText, setInputText] = reactExports.useState("");
  const [translatedText, setTranslatedText] = reactExports.useState("");
  const [sourceLang, setSourceLang] = reactExports.useState("auto");
  const [targetLang, setTargetLang] = reactExports.useState("zh");
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const [alternatives, setAlternatives] = reactExports.useState([]);
  reactExports.useEffect(() => {
    chrome.storage.local.get(["defaultSourceLang", "defaultTargetLang"], (result) => {
      if (result.defaultSourceLang) setSourceLang(result.defaultSourceLang);
      if (result.defaultTargetLang) setTargetLang(result.defaultTargetLang);
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
//# sourceMappingURL=popup-D2pz2-Nc.js.map
