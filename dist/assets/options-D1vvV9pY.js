import { r as reactExports, j as jsxRuntimeExports, c as createRoot } from "./tailwind-RQ8VxBFH.js";
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
const TRANSLATION_SERVICES = [
  { value: "google", name: "Google 翻译" },
  { value: "deepl", name: "DeepL" },
  { value: "microsoft", name: "Microsoft 翻译" },
  { value: "baidu", name: "百度翻译" }
];
const DEFAULT_SETTINGS = {
  defaultSourceLang: "auto",
  defaultTargetLang: "zh",
  enableAutoTranslate: true,
  enableHotkey: true,
  hotkey: "Ctrl+Shift+Y",
  translationService: "google",
  apiKey: "",
  theme: "auto",
  fontSize: 14,
  showOriginalText: true,
  enableSoundEffect: false,
  enableImageTranslation: true,
  // 默认启用图片翻译
  enableDocumentTranslation: true
  // 默认启用文件翻译
};
const OptionsComponent = () => {
  const [settings, setSettings] = reactExports.useState(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = reactExports.useState(true);
  const [isSaving, setIsSaving] = reactExports.useState(false);
  const [saveMessage, setSaveMessage] = reactExports.useState(null);
  reactExports.useEffect(() => {
    chrome.storage.local.get(Object.keys(DEFAULT_SETTINGS), (result) => {
      setSettings({ ...DEFAULT_SETTINGS, ...result });
      setIsLoading(false);
    });
  }, []);
  const handleSave = reactExports.useCallback(async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      await new Promise((resolve) => {
        chrome.storage.local.set(settings, () => {
          resolve();
        });
      });
      setSaveMessage("设置已保存");
      setTimeout(() => setSaveMessage(null), 3e3);
    } catch (error) {
      setSaveMessage("保存失败，请重试");
      setTimeout(() => setSaveMessage(null), 3e3);
    } finally {
      setIsSaving(false);
    }
  }, [settings]);
  const handleReset = reactExports.useCallback(() => {
    if (confirm("确定要重置所有设置吗？此操作不可撤销。")) {
      setSettings(DEFAULT_SETTINGS);
    }
  }, []);
  const updateSetting = reactExports.useCallback((key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);
  const handleExport = reactExports.useCallback(() => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "immersive-translate-settings.json";
    link.click();
    URL.revokeObjectURL(url);
  }, [settings]);
  const handleImport = reactExports.useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target?.result);
        setSettings({ ...DEFAULT_SETTINGS, ...importedSettings });
        setSaveMessage("设置已导入");
        setTimeout(() => setSaveMessage(null), 3e3);
      } catch (error) {
        setSaveMessage("导入失败，文件格式不正确");
        setTimeout(() => setSaveMessage(null), 3e3);
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  }, []);
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "加载设置中..." })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-gray-50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "bg-white shadow-sm border-b", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-4xl mx-auto px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "沉浸式翻译设置" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 mt-1", children: "配置您的翻译偏好和功能选项" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-3", children: [
        saveMessage && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-sm px-3 py-1 rounded ${saveMessage.includes("失败") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`, children: saveMessage }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: handleSave,
            disabled: isSaving,
            className: "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors",
            type: "button",
            children: isSaving ? "保存中..." : "保存设置"
          }
        )
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "max-w-4xl mx-auto px-6 py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "bg-white rounded-lg shadow-sm p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-gray-900 mb-4", children: "基本设置" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "默认源语言" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "select",
              {
                value: settings.defaultSourceLang,
                onChange: (e) => updateSetting("defaultSourceLang", e.target.value),
                className: "w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                children: LANGUAGES.map((lang) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: lang.code, children: lang.name }, lang.code))
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "默认目标语言" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "select",
              {
                value: settings.defaultTargetLang,
                onChange: (e) => updateSetting("defaultTargetLang", e.target.value),
                className: "w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                children: LANGUAGES.filter((lang) => lang.code !== "auto").map((lang) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: lang.code, children: lang.name }, lang.code))
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "翻译服务" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "select",
              {
                value: settings.translationService,
                onChange: (e) => updateSetting("translationService", e.target.value),
                className: "w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                children: TRANSLATION_SERVICES.map((service) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: service.value, children: service.name }, service.value))
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "API 密钥 (可选)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "password",
                value: settings.apiKey,
                onChange: (e) => updateSetting("apiKey", e.target.value),
                placeholder: "输入 API 密钥以提高翻译质量",
                className: "w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "bg-white rounded-lg shadow-sm p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-gray-900 mb-4", children: "功能设置" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-medium text-gray-900", children: "自动翻译" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "选中文本时自动显示翻译" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "checkbox",
                  checked: settings.enableAutoTranslate,
                  onChange: (e) => updateSetting("enableAutoTranslate", e.target.checked),
                  className: "sr-only peer"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-medium text-gray-900", children: "快捷键" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "启用键盘快捷键功能" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "checkbox",
                  checked: settings.enableHotkey,
                  onChange: (e) => updateSetting("enableHotkey", e.target.checked),
                  className: "sr-only peer"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-medium text-gray-900", children: "显示原文" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "在翻译结果中显示原文" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "checkbox",
                  checked: settings.showOriginalText,
                  onChange: (e) => updateSetting("showOriginalText", e.target.checked),
                  className: "sr-only peer"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-medium text-gray-900", children: "音效" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "启用翻译完成音效" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => updateSetting("enableSoundEffect", !settings.enableSoundEffect),
                className: `relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${settings.enableSoundEffect ? "bg-blue-600" : "bg-gray-200"}`,
                type: "button",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: `inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.enableSoundEffect ? "translate-x-6" : "translate-x-1"}`
                  }
                )
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-medium text-gray-900", children: "图片翻译" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "启用图片翻译功能" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => updateSetting("enableImageTranslation", !settings.enableImageTranslation),
                className: `relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${settings.enableImageTranslation ? "bg-blue-600" : "bg-gray-200"}`,
                type: "button",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: `inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.enableImageTranslation ? "translate-x-6" : "translate-x-1"}`
                  }
                )
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-medium text-gray-900", children: "文件翻译" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "启用文档翻译功能（PDF/TXT/Docx）" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => updateSetting("enableDocumentTranslation", !settings.enableDocumentTranslation),
                className: `relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${settings.enableDocumentTranslation ? "bg-blue-600" : "bg-gray-200"}`,
                type: "button",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: `inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.enableDocumentTranslation ? "translate-x-6" : "translate-x-1"}`
                  }
                )
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "bg-white rounded-lg shadow-sm p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-gray-900 mb-4", children: "外观设置" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "主题" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: settings.theme,
                onChange: (e) => updateSetting("theme", e.target.value),
                className: "w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "auto", children: "跟随系统" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "light", children: "浅色" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "dark", children: "深色" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: [
              "字体大小: ",
              settings.fontSize,
              "px"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "range",
                min: "12",
                max: "20",
                value: settings.fontSize,
                onChange: (e) => updateSetting("fontSize", parseInt(e.target.value)),
                className: "w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "bg-white rounded-lg shadow-sm p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-gray-900 mb-4", children: "数据管理" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: handleExport,
              className: "px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors",
              type: "button",
              children: "导出设置"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors cursor-pointer", children: [
            "导入设置",
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "file",
                accept: ".json",
                onChange: handleImport,
                className: "hidden"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: handleReset,
              className: "px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors",
              type: "button",
              children: "重置设置"
            }
          )
        ] })
      ] })
    ] }) })
  ] });
};
const container = document.getElementById("options-root");
if (container) {
  const root = createRoot(container);
  root.render(/* @__PURE__ */ jsxRuntimeExports.jsx(OptionsComponent, {}));
} else {
  console.error("Options root element not found");
}
//# sourceMappingURL=options-D1vvV9pY.js.map
