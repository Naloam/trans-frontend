import { r as reactExports, j as jsxRuntimeExports, c as createRoot } from "./tailwind-Cqpfzv93.js";
const LoginComponent = () => {
  const [formData, setFormData] = reactExports.useState({
    username: "",
    password: ""
  });
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:8000/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "登录失败");
      }
      console.log("登录成功:", data);
    } catch (err) {
      setError(err.message || "登录过程中发生错误");
      console.error("登录错误:", err);
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sm:mx-auto sm:w-full sm:max-w-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white", children: "登录到您的账户" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-10 sm:mx-auto sm:w-full sm:max-w-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "space-y-6", onSubmit: handleSubmit, children: [
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md bg-red-50 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-red-700", children: error }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "username", className: "block text-sm font-medium leading-6 text-gray-900 dark:text-white", children: "用户名" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            id: "username",
            name: "username",
            type: "text",
            required: true,
            value: formData.username,
            onChange: handleChange,
            className: "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600 dark:focus:ring-indigo-500"
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "password", className: "block text-sm font-medium leading-6 text-gray-900 dark:text-white", children: "密码" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            id: "password",
            name: "password",
            type: "password",
            required: true,
            value: formData.password,
            onChange: handleChange,
            className: "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600 dark:focus:ring-indigo-500"
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "submit",
          disabled: loading,
          className: "flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 dark:bg-indigo-600 dark:hover:bg-indigo-500",
          children: loading ? "登录中..." : "登录"
        }
      ) })
    ] }) })
  ] });
};
const RegisterComponent = () => {
  const [formData, setFormData] = reactExports.useState({
    username: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("密码和确认密码不匹配");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:8000/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          confirm_password: formData.confirmPassword
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "注册失败");
      }
      console.log("注册成功:", data);
    } catch (err) {
      setError(err.message || "注册过程中发生错误");
      console.error("注册错误:", err);
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sm:mx-auto sm:w-full sm:max-w-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 dark:text-white", children: "创建新账户" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-10 sm:mx-auto sm:w-full sm:max-w-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "space-y-6", onSubmit: handleSubmit, children: [
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md bg-red-50 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-red-700", children: error }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "username", className: "block text-sm font-medium leading-6 text-gray-900 dark:text-white", children: "用户名" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            id: "username",
            name: "username",
            type: "text",
            required: true,
            value: formData.username,
            onChange: handleChange,
            className: "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600 dark:focus:ring-indigo-500"
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "password", className: "block text-sm font-medium leading-6 text-gray-900 dark:text-white", children: "密码" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            id: "password",
            name: "password",
            type: "password",
            required: true,
            value: formData.password,
            onChange: handleChange,
            className: "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600 dark:focus:ring-indigo-500"
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "confirmPassword", className: "block text-sm font-medium leading-6 text-gray-900 dark:text-white", children: "确认密码" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            id: "confirmPassword",
            name: "confirmPassword",
            type: "password",
            required: true,
            value: formData.confirmPassword,
            onChange: handleChange,
            className: "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600 dark:focus:ring-indigo-500"
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "submit",
          disabled: loading,
          className: "flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 dark:bg-indigo-600 dark:hover:bg-indigo-500",
          children: loading ? "注册中..." : "注册"
        }
      ) })
    ] }) })
  ] });
};
const AuthOptionsComponent = ({ onBackToSettings }) => {
  const [currentView, setCurrentView] = reactExports.useState("login");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-gray-50 dark:bg-gray-900", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "bg-white dark:bg-gray-800 shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between h-16", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-xl font-semibold text-gray-900 dark:text-white", children: [
        currentView === "login" && "用户登录",
        currentView === "register" && "用户注册"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setCurrentView("login"),
            className: `text-sm ${currentView === "login" ? "text-indigo-600 dark:text-indigo-400 font-medium" : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"}`,
            children: "登录"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setCurrentView("register"),
            className: `text-sm ${currentView === "register" ? "text-indigo-600 dark:text-indigo-400 font-medium" : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"}`,
            children: "注册"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: onBackToSettings,
            className: "text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white",
            children: "返回设置"
          }
        )
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [
      currentView === "login" && /* @__PURE__ */ jsxRuntimeExports.jsx(LoginComponent, {}),
      currentView === "register" && /* @__PURE__ */ jsxRuntimeExports.jsx(RegisterComponent, {})
    ] })
  ] });
};
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
  const [showAuth, setShowAuth] = reactExports.useState(false);
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
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: showAuth ? /* @__PURE__ */ jsxRuntimeExports.jsx(AuthOptionsComponent, { onBackToSettings: () => setShowAuth(false) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-gray-50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "bg-white shadow-sm border-b", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-4xl mx-auto px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "沉浸式翻译设置" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 mt-1", children: "配置您的翻译偏好和功能选项" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setShowAuth(true),
            className: "px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors",
            type: "button",
            children: "用户账户"
          }
        ),
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
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" })
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
  ] }) });
};
const container = document.getElementById("options-root");
if (container) {
  const root = createRoot(container);
  root.render(/* @__PURE__ */ jsxRuntimeExports.jsx(OptionsComponent, {}));
} else {
  console.error("Options root element not found");
}
//# sourceMappingURL=options-qc9lcHrh.js.map
