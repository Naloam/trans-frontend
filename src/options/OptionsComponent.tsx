/**
 * Options Component
 * 扩展设置页面主组件
 */

import React, { useState, useEffect, useCallback } from 'react';

// 类型定义
interface Settings {
  defaultSourceLang: string;
  defaultTargetLang: string;
  enableAutoTranslate: boolean;
  enableHotkey: boolean;
  hotkey: string;
  translationService: string;
  apiKey: string;
  theme: 'light' | 'dark' | 'auto';
  fontSize: number;
  showOriginalText: boolean;
  enableSoundEffect: boolean;
  enableImageTranslation: boolean; // 新增图片翻译设置项
  enableDocumentTranslation: boolean; // 新增文件翻译设置项
}

interface LanguageOption {
  code: string;
  name: string;
}

// 支持的语言列表
const LANGUAGES: LanguageOption[] = [
  { code: 'auto', name: '自动检测' },
  { code: 'zh', name: '中文' },
  { code: 'en', name: 'English' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'es', name: 'Español' },
  { code: 'ru', name: 'Русский' },
  { code: 'ar', name: 'العربية' }
];

// 翻译服务选项
const TRANSLATION_SERVICES = [
  { value: 'google', name: 'Google 翻译' },
  { value: 'deepl', name: 'DeepL' },
  { value: 'microsoft', name: 'Microsoft 翻译' },
  { value: 'baidu', name: '百度翻译' }
];

// 默认设置
const DEFAULT_SETTINGS: Settings = {
  defaultSourceLang: 'auto',
  defaultTargetLang: 'zh',
  enableAutoTranslate: true,
  enableHotkey: true,
  hotkey: 'Ctrl+Shift+Y',
  translationService: 'google',
  apiKey: '',
  theme: 'auto',
  fontSize: 14,
  showOriginalText: true,
  enableSoundEffect: false,
  enableImageTranslation: true, // 默认启用图片翻译
  enableDocumentTranslation: true // 默认启用文件翻译
};

const OptionsComponent: React.FC = () => {
  // 状态管理
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // 加载设置
  useEffect(() => {
    chrome.storage.local.get(Object.keys(DEFAULT_SETTINGS), (result) => {
      setSettings({ ...DEFAULT_SETTINGS, ...result });
      setIsLoading(false);
    });
  }, []);

  // 保存设置
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      await new Promise<void>((resolve) => {
        chrome.storage.local.set(settings, () => {
          resolve();
        });
      });

      setSaveMessage('设置已保存');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage('保存失败，请重试');
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setIsSaving(false);
    }
  }, [settings]);

  // 重置设置
  const handleReset = useCallback(() => {
    if (confirm('确定要重置所有设置吗？此操作不可撤销。')) {
      setSettings(DEFAULT_SETTINGS);
    }
  }, []);

  // 更新设置
  const updateSetting = useCallback(<K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  // 导出设置
  const handleExport = useCallback(() => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'immersive-translate-settings.json';
    link.click();
    
    URL.revokeObjectURL(url);
  }, [settings]);

  // 导入设置
  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target?.result as string);
        setSettings({ ...DEFAULT_SETTINGS, ...importedSettings });
        setSaveMessage('设置已导入');
        setTimeout(() => setSaveMessage(null), 3000);
      } catch (error) {
        setSaveMessage('导入失败，文件格式不正确');
        setTimeout(() => setSaveMessage(null), 3000);
      }
    };
    reader.readAsText(file);
    
    // 清空文件输入
    event.target.value = '';
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载设置中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">沉浸式翻译设置</h1>
              <p className="text-gray-600 mt-1">配置您的翻译偏好和功能选项</p>
            </div>
            <div className="flex items-center space-x-3">
              {saveMessage && (
                <span className={`text-sm px-3 py-1 rounded ${
                  saveMessage.includes('失败') 
                    ? 'bg-red-100 text-red-700' 
                    : 'bg-green-100 text-green-700'
                }`}>
                  {saveMessage}
                </span>
              )}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                type="button"
              >
                {isSaving ? '保存中...' : '保存设置'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* 基本设置 */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">基本设置</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  默认源语言
                </label>
                <select
                  value={settings.defaultSourceLang}
                  onChange={(e) => updateSetting('defaultSourceLang', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  默认目标语言
                </label>
                <select
                  value={settings.defaultTargetLang}
                  onChange={(e) => updateSetting('defaultTargetLang', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {LANGUAGES.filter(lang => lang.code !== 'auto').map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  翻译服务
                </label>
                <select
                  value={settings.translationService}
                  onChange={(e) => updateSetting('translationService', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {TRANSLATION_SERVICES.map(service => (
                    <option key={service.value} value={service.value}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API 密钥 (可选)
                </label>
                <input
                  type="password"
                  value={settings.apiKey}
                  onChange={(e) => updateSetting('apiKey', e.target.value)}
                  placeholder="输入 API 密钥以提高翻译质量"
                  className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </section>

          {/* 功能设置 */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">功能设置</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">自动翻译</h3>
                  <p className="text-sm text-gray-500">选中文本时自动显示翻译</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enableAutoTranslate}
                    onChange={(e) => updateSetting('enableAutoTranslate', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">快捷键</h3>
                  <p className="text-sm text-gray-500">启用键盘快捷键功能</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enableHotkey}
                    onChange={(e) => updateSetting('enableHotkey', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">显示原文</h3>
                  <p className="text-sm text-gray-500">在翻译结果中显示原文</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.showOriginalText}
                    onChange={(e) => updateSetting('showOriginalText', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">音效</h3>
                  <p className="text-sm text-gray-500">启用翻译完成音效</p>
                </div>
                <button
                  onClick={() => updateSetting('enableSoundEffect', !settings.enableSoundEffect)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    settings.enableSoundEffect ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  type="button"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.enableSoundEffect ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">图片翻译</h3>
                  <p className="text-sm text-gray-500">启用图片翻译功能</p>
                </div>
                <button
                  onClick={() => updateSetting('enableImageTranslation', !settings.enableImageTranslation)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    settings.enableImageTranslation ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  type="button"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.enableImageTranslation ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">文件翻译</h3>
                  <p className="text-sm text-gray-500">启用文档翻译功能（PDF/TXT/Docx）</p>
                </div>
                <button
                  onClick={() => updateSetting('enableDocumentTranslation', !settings.enableDocumentTranslation)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    settings.enableDocumentTranslation ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  type="button"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.enableDocumentTranslation ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

            </div>
          </section>

          {/* 外观设置 */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">外观设置</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  主题
                </label>
                <select
                  value={settings.theme}
                  onChange={(e) => updateSetting('theme', e.target.value as 'light' | 'dark' | 'auto')}
                  className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="auto">跟随系统</option>
                  <option value="light">浅色</option>
                  <option value="dark">深色</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  字体大小: {settings.fontSize}px
                </label>
                <input
                  type="range"
                  min="12"
                  max="20"
                  value={settings.fontSize}
                  onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </section>

          {/* 数据管理 */}
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">数据管理</h2>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                type="button"
              >
                导出设置
              </button>
              
              <label className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors cursor-pointer">
                导入设置
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
              
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                type="button"
              >
                重置设置
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default OptionsComponent;