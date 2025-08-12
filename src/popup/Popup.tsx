/**
 * Popup Component
 * 扩展弹窗主组件
 */

import React, { useState, useEffect, useCallback } from 'react';

// 类型定义
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

const Popup: React.FC = () => {
  // 状态管理
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('zh');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alternatives, setAlternatives] = useState<string[]>([]);

  // 从存储加载设置
  useEffect(() => {
    chrome.storage.local.get(['defaultSourceLang', 'defaultTargetLang'], (result) => {
      if (result.defaultSourceLang) setSourceLang(result.defaultSourceLang);
      if (result.defaultTargetLang) setTargetLang(result.defaultTargetLang);
    });
  }, []);

  // 保存语言设置
  const saveLanguageSettings = useCallback(() => {
    chrome.storage.local.set({
      defaultSourceLang: sourceLang,
      defaultTargetLang: targetLang
    });
  }, [sourceLang, targetLang]);

  // 翻译函数
  const handleTranslate = useCallback(async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setError(null);
    setTranslatedText('');
    setAlternatives([]);

    try {
      const response = await new Promise<TranslationResult>((resolve) => {
        chrome.runtime.sendMessage({
          type: 'translate',
          payload: {
            id: Date.now().toString(),
            text: inputText.trim(),
            source: sourceLang,
            target: targetLang,
            format: 'text'
          }
        }, resolve);
      });

      if (response.ok && response.data) {
        setTranslatedText(response.data.translatedText);
        setAlternatives(response.data.alternatives || []);
        
        // 保存到翻译历史
        chrome.storage.local.get(['translationHistory'], (result) => {
          const history = result.translationHistory || [];
          history.unshift({
            original: inputText.trim(),
            translated: response.data!.translatedText,
            sourceLang,
            targetLang,
            timestamp: Date.now()
          });
          
          // 只保留最近50条记录
          chrome.storage.local.set({
            translationHistory: history.slice(0, 50)
          });
        });
      } else {
        setError(response.error?.message || '翻译失败');
      }
    } catch (err) {
      setError('网络连接失败');
    } finally {
      setIsLoading(false);
    }
  }, [inputText, sourceLang, targetLang]);

  // 交换语言
  const handleSwapLanguages = useCallback(() => {
    if (sourceLang === 'auto') {
      setSourceLang(targetLang);
      setTargetLang('en');
    } else {
      const temp = sourceLang;
      setSourceLang(targetLang);
      setTargetLang(temp);
    }
    saveLanguageSettings();
  }, [sourceLang, targetLang, saveLanguageSettings]);

  // 复制翻译结果
  const handleCopy = useCallback(() => {
    if (translatedText) {
      navigator.clipboard.writeText(translatedText);
    }
  }, [translatedText]);

  // 清空输入
  const handleClear = useCallback(() => {
    setInputText('');
    setTranslatedText('');
    setError(null);
    setAlternatives([]);
  }, []);

  // 打开设置页面
  const handleOpenSettings = useCallback(() => {
    chrome.runtime.openOptionsPage();
  }, []);

  // 键盘快捷键
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.ctrlKey && event.key === 'Enter') {
      event.preventDefault();
      handleTranslate();
    }
  }, [handleTranslate]);

  // 语言变化处理
  useEffect(() => {
    saveLanguageSettings();
  }, [saveLanguageSettings]);

  return (
    <div className="w-96 min-h-[500px] bg-white">
      {/* 头部 */}
      <header className="bg-blue-600 text-white p-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">沉浸式翻译</h1>
        <button
          onClick={handleOpenSettings}
          className="p-2 hover:bg-blue-700 rounded transition-colors"
          title="打开设置页面"
          aria-label="打开设置页面"
          type="button"
        >
          ⚙️
        </button>
      </header>

      {/* 主内容 */}
      <main className="p-4 space-y-4">
        {/* 语言选择 */}
        <div className="flex items-center space-x-2">
          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="源语言"
          >
            {LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
          
          <button
            onClick={handleSwapLanguages}
            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
            title="交换语言"
            type="button"
          >
            ⇄
          </button>
          
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="目标语言"
          >
            {LANGUAGES.filter(lang => lang.code !== 'auto').map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* 输入区域 */}
        <div className="relative">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入要翻译的文本..."
            className="w-full h-32 p-3 border border-gray-300 rounded resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={1000}
          />
          <div className="absolute bottom-2 right-2 flex items-center space-x-2">
            <span className="text-xs text-gray-500">
              {inputText.length}/1000
            </span>
            {inputText && (
              <button
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="清空输入"
                type="button"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* 翻译按钮 */}
        <button
          onClick={handleTranslate}
          disabled={!inputText.trim() || isLoading}
          className="w-full py-3 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          type="button"
        >
          {isLoading ? '翻译中...' : '翻译'}
        </button>

        {/* 错误信息 */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">
            ❌ {error}
          </div>
        )}

        {/* 翻译结果 */}
        {translatedText && (
          <div className="space-y-3">
            <div className="relative p-3 bg-gray-50 border border-gray-200 rounded">
              <div className="text-gray-800 leading-relaxed">
                {translatedText}
              </div>
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="复制翻译结果"
                type="button"
              >
                📋
              </button>
            </div>

            {/* 候选翻译 */}
            {alternatives.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">其他翻译:</h4>
                {alternatives.map((alt, index) => (
                  <div
                    key={index}
                    className="p-2 bg-white border border-gray-200 rounded text-sm text-gray-600 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setTranslatedText(alt)}
                  >
                    {alt}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* 底部提示 */}
      <footer className="p-4 border-t border-gray-200 text-xs text-gray-500 text-center">
        快捷键: Ctrl+Enter 翻译
      </footer>
    </div>
  );
};

export default Popup;