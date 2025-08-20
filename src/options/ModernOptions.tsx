/**
 * 现代化的选项页面组件
 */

import React, { useState, useEffect } from 'react';

// SVG图标组件
const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const XMarkIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const Cog6ToothIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const GlobeAltIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3s-4.5 4.03-4.5 9 2.015 9 4.5 9zm0 0c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3s4.5 4.03 4.5 9-2.015 9-4.5 9z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2 12h20" />
  </svg>
);

const CpuChipIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-16.5 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" />
  </svg>
);

const KeyIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159-.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
  </svg>
);

const ShieldCheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.623 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);

const BookOpenIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  </svg>
);

interface ModernOptionsProps {
  onClose?: () => void;
}

const ModernOptions: React.FC<ModernOptionsProps> = ({ onClose }) => {
  // 状态管理
  const [activeTab, setActiveTab] = useState<'general' | 'translation' | 'vocabulary' | 'appearance' | 'privacy' | 'advanced'>('general');
  const [settings, setSettings] = useState({
    // 通用设置
    defaultSourceLang: 'auto',
    defaultTargetLang: 'zh',
    autoDetectLanguage: true,
    
    // 翻译设置
    selectedModel: 'qwen-turbo-latest',
    enableOfflineTranslation: true,
    enablePersonalMemory: true,
    enableContextualTranslation: true,
    translationCache: true,
    maxHistoryItems: 100,
    
    // 外观设置
    theme: 'system',
    popupSize: 'medium',
    fontSize: 'medium',
    animationsEnabled: true,
    compactMode: false,
    
    // 隐私设置
    saveTranslationHistory: true,
    allowAnalytics: false,
    shareImprovements: false,
    
    // 高级设置
    requestTimeout: 10000,
    maxRetries: 3,
    batchSize: 5,
    enableDebugMode: false,
    customApiEndpoint: '',
    proxyEnabled: false
  });
  const [saved, setSaved] = useState(false);

  // 语言选项
  const LANGUAGES = [
    { code: 'auto', name: '自动检测', flag: '🔍' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' }
  ];

  // AI模型选项
  const AI_MODELS = [
    { value: 'qwen-turbo-latest', name: '阿里云千问', description: '快速准确，成本低廉', icon: '🚀' },
    { value: 'deepseek-chat', name: 'DeepSeek', description: '深度理解，上下文感知', icon: '🧠' },
    { value: 'gpt-4o', name: 'GPT-4', description: '顶级质量，多语言支持', icon: '⭐' },
    { value: 'moonshot-kimi', name: 'Moonshot Kimi', description: '长文本处理专家', icon: '🌙' }
  ];

  // 加载设置
  useEffect(() => {
    chrome.storage.sync.get(Object.keys(settings), (result) => {
      setSettings(prev => ({ ...prev, ...result }));
    });
  }, []);

  // 更新设置
  const updateSetting = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    chrome.storage.sync.set({ [key]: value });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // 导出设置
  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'translation-extension-settings.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  // 导入设置
  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target?.result as string);
        setSettings(prev => ({ ...prev, ...importedSettings }));
        chrome.storage.sync.set(importedSettings);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch (error) {
        alert('导入失败：文件格式不正确');
      }
    };
    reader.readAsText(file);
  };

  // 重置设置
  const resetSettings = () => {
    if (confirm('确定要重置所有设置吗？此操作不可撤销。')) {
      chrome.storage.sync.clear();
      window.location.reload();
    }
  };

  // 标签页组件
  const TabButton: React.FC<{ id: string; icon: React.ReactNode; label: string }> = ({ id, icon, label }) => (
    <button
      onClick={() => setActiveTab(id as any)}
      className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-all duration-200 ${
        activeTab === id
          ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
      }`}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );

  // 设置项组件
  const SettingItem: React.FC<{
    title: string;
    description: string;
    children: React.ReactNode;
  }> = ({ title, description, children }) => (
    <div className="py-4 border-b border-gray-100 last:border-b-0">
      <div className="flex items-start justify-between">
        <div className="flex-1 mr-4">
          <h3 className="text-sm font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
        <div className="flex-shrink-0">{children}</div>
      </div>
    </div>
  );

  // 切换开关组件
  const Toggle: React.FC<{ 
    checked: boolean; 
    onChange: (checked: boolean) => void;
    disabled?: boolean;
  }> = ({ checked, onChange, disabled = false }) => (
    <button
      onClick={() => !disabled && onChange(!checked)}
      className={`relative w-12 h-6 rounded-full transition-colors ${
        checked ? 'bg-blue-600' : 'bg-gray-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      disabled={disabled}
    >
      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-0'
      }`} />
    </button>
  );

  // 通用设置页面
  const GeneralSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <GlobeAltIcon className="w-5 h-5 mr-2 text-blue-600" />
          语言设置
        </h2>
        
        <SettingItem
          title="默认源语言"
          description="选择翻译时的默认源语言"
        >
          <select
            value={settings.defaultSourceLang}
            onChange={(e) => updateSetting('defaultSourceLang', e.target.value)}
            className="px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </SettingItem>

        <SettingItem
          title="默认目标语言"
          description="选择翻译时的默认目标语言"
        >
          <select
            value={settings.defaultTargetLang}
            onChange={(e) => updateSetting('defaultTargetLang', e.target.value)}
            className="px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {LANGUAGES.filter(lang => lang.code !== 'auto').map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </SettingItem>

        <SettingItem
          title="自动检测语言"
          description="启用后会自动检测输入文本的语言"
        >
          <Toggle
            checked={settings.autoDetectLanguage}
            onChange={(checked) => updateSetting('autoDetectLanguage', checked)}
          />
        </SettingItem>
      </div>
    </div>
  );

  // 翻译设置页面
  const TranslationSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <CpuChipIcon className="w-5 h-5 mr-2 text-blue-600" />
          AI 模型设置
        </h2>
        
        <SettingItem
          title="默认翻译模型"
          description="选择用于翻译的AI模型"
        >
          <select
            value={settings.selectedModel}
            onChange={(e) => updateSetting('selectedModel', e.target.value)}
            className="px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[200px]"
          >
            {AI_MODELS.map(model => (
              <option key={model.value} value={model.value}>
                {model.icon} {model.name}
              </option>
            ))}
          </select>
        </SettingItem>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">高级翻译功能</h2>
        
        <SettingItem
          title="离线翻译"
          description="启用离线翻译功能，无网络时也能翻译常用词汇"
        >
          <Toggle
            checked={settings.enableOfflineTranslation}
            onChange={(checked) => updateSetting('enableOfflineTranslation', checked)}
          />
        </SettingItem>

        <SettingItem
          title="个人翻译记忆"
          description="学习您的翻译偏好，提供个性化的翻译建议"
        >
          <Toggle
            checked={settings.enablePersonalMemory}
            onChange={(checked) => updateSetting('enablePersonalMemory', checked)}
          />
        </SettingItem>

        <SettingItem
          title="上下文感知翻译"
          description="根据上下文提供更准确的翻译结果"
        >
          <Toggle
            checked={settings.enableContextualTranslation}
            onChange={(checked) => updateSetting('enableContextualTranslation', checked)}
          />
        </SettingItem>

        <SettingItem
          title="翻译缓存"
          description="缓存翻译结果以提高速度和减少API调用"
        >
          <Toggle
            checked={settings.translationCache}
            onChange={(checked) => updateSetting('translationCache', checked)}
          />
        </SettingItem>

        <SettingItem
          title="历史记录数量"
          description="保存的翻译历史记录最大条数"
        >
          <select
            value={settings.maxHistoryItems}
            onChange={(e) => updateSetting('maxHistoryItems', parseInt(e.target.value))}
            className="px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={50}>50 条</option>
            <option value={100}>100 条</option>
            <option value={200}>200 条</option>
            <option value={500}>500 条</option>
            <option value={1000}>1000 条</option>
          </select>
        </SettingItem>
      </div>
    </div>
  );

  // 外观设置页面
  const AppearanceSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">外观主题</h2>
        
        <SettingItem
          title="界面主题"
          description="选择扩展的外观主题"
        >
          <select
            value={settings.theme}
            onChange={(e) => updateSetting('theme', e.target.value)}
            className="px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="light">浅色主题</option>
            <option value="dark">深色主题</option>
            <option value="system">跟随系统</option>
          </select>
        </SettingItem>

        <SettingItem
          title="弹窗大小"
          description="设置翻译弹窗的默认大小"
        >
          <select
            value={settings.popupSize}
            onChange={(e) => updateSetting('popupSize', e.target.value)}
            className="px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="small">小</option>
            <option value="medium">中</option>
            <option value="large">大</option>
          </select>
        </SettingItem>

        <SettingItem
          title="字体大小"
          description="设置界面文字的大小"
        >
          <select
            value={settings.fontSize}
            onChange={(e) => updateSetting('fontSize', e.target.value)}
            className="px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="small">小</option>
            <option value="medium">中</option>
            <option value="large">大</option>
          </select>
        </SettingItem>

        <SettingItem
          title="动画效果"
          description="启用界面动画效果"
        >
          <Toggle
            checked={settings.animationsEnabled}
            onChange={(checked) => updateSetting('animationsEnabled', checked)}
          />
        </SettingItem>

        <SettingItem
          title="紧凑模式"
          description="使用更紧凑的界面布局"
        >
          <Toggle
            checked={settings.compactMode}
            onChange={(checked) => updateSetting('compactMode', checked)}
          />
        </SettingItem>
      </div>
    </div>
  );

  // 隐私设置页面
  const PrivacySettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ShieldCheckIcon className="w-5 h-5 mr-2 text-blue-600" />
          数据隐私
        </h2>
        
        <SettingItem
          title="保存翻译历史"
          description="在本地保存翻译历史记录"
        >
          <Toggle
            checked={settings.saveTranslationHistory}
            onChange={(checked) => updateSetting('saveTranslationHistory', checked)}
          />
        </SettingItem>

        <SettingItem
          title="允许匿名分析"
          description="帮助我们改进产品，不会收集个人信息"
        >
          <Toggle
            checked={settings.allowAnalytics}
            onChange={(checked) => updateSetting('allowAnalytics', checked)}
          />
        </SettingItem>

        <SettingItem
          title="共享改进建议"
          description="与开发者分享使用体验和改进建议"
        >
          <Toggle
            checked={settings.shareImprovements}
            onChange={(checked) => updateSetting('shareImprovements', checked)}
          />
        </SettingItem>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h3 className="text-amber-800 font-medium mb-2">隐私说明</h3>
        <p className="text-amber-700 text-sm">
          我们承诺保护您的隐私。翻译内容仅用于提供翻译服务，不会存储或分享给第三方。
          您可以随时清除本地存储的数据。
        </p>
      </div>
    </div>
  );

  // 高级设置页面
  const AdvancedSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Cog6ToothIcon className="w-5 h-5 mr-2 text-blue-600" />
          性能设置
        </h2>
        
        <SettingItem
          title="请求超时时间"
          description="API请求的超时时间（毫秒）"
        >
          <select
            value={settings.requestTimeout}
            onChange={(e) => updateSetting('requestTimeout', parseInt(e.target.value))}
            className="px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={5000}>5 秒</option>
            <option value={10000}>10 秒</option>
            <option value={15000}>15 秒</option>
            <option value={30000}>30 秒</option>
          </select>
        </SettingItem>

        <SettingItem
          title="最大重试次数"
          description="请求失败时的最大重试次数"
        >
          <select
            value={settings.maxRetries}
            onChange={(e) => updateSetting('maxRetries', parseInt(e.target.value))}
            className="px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={1}>1 次</option>
            <option value={2}>2 次</option>
            <option value={3}>3 次</option>
            <option value={5}>5 次</option>
          </select>
        </SettingItem>

        <SettingItem
          title="批处理大小"
          description="同时处理的翻译请求数量"
        >
          <select
            value={settings.batchSize}
            onChange={(e) => updateSetting('batchSize', parseInt(e.target.value))}
            className="px-3 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={1}>1 个</option>
            <option value={3}>3 个</option>
            <option value={5}>5 个</option>
            <option value={10}>10 个</option>
          </select>
        </SettingItem>

        <SettingItem
          title="调试模式"
          description="启用调试模式，在控制台输出详细日志"
        >
          <Toggle
            checked={settings.enableDebugMode}
            onChange={(checked) => updateSetting('enableDebugMode', checked)}
          />
        </SettingItem>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">设置管理</h2>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={exportSettings}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              导出设置
            </button>
            
            <label className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors cursor-pointer">
              导入设置
              <input
                type="file"
                accept=".json"
                onChange={importSettings}
                className="hidden"
              />
            </label>
            
            <button
              onClick={resetSettings}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              重置设置
            </button>
          </div>
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-red-800 font-medium mb-2">危险操作</h3>
        <p className="text-red-700 text-sm mb-3">
          以下操作将永久删除数据，请谨慎操作：
        </p>
        <div className="space-x-3">
          <button
            onClick={() => {
              if (confirm('确定要清除所有翻译历史吗？')) {
                chrome.storage.local.set({ translationHistory: [] });
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
              }
            }}
            className="px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
          >
            清除翻译历史
          </button>
          
          <button
            onClick={() => {
              if (confirm('确定要清除所有缓存数据吗？')) {
                chrome.storage.local.clear();
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
              }
            }}
            className="px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
          >
            清除所有缓存
          </button>
        </div>
      </div>
    </div>
  );

  // 词汇管理页面
  const VocabularySettings = () => {
    const [vocabularyList, setVocabularyList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
      loadVocabulary();
    }, []);

    const loadVocabulary = async () => {
      setIsLoading(true);
      try {
        // 从本地存储获取词汇
        const result = await chrome.storage.local.get('vocabulary');
        setVocabularyList(result.vocabulary || []);
      } catch (error) {
        console.error('加载词汇失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const deleteVocabulary = async (index: number) => {
      if (confirm('确定要删除这个词汇吗？')) {
        const newList = vocabularyList.filter((_, i) => i !== index);
        setVocabularyList(newList);
        await chrome.storage.local.set({ vocabulary: newList });
      }
    };

    const exportVocabulary = () => {
      const dataStr = JSON.stringify(vocabularyList, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'vocabulary.json';
      link.click();
      URL.revokeObjectURL(url);
    };

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <BookOpenIcon className="w-5 h-5 mr-2 text-blue-600" />
              词汇记录管理
            </h2>
            <div className="flex space-x-3">
              <button
                onClick={loadVocabulary}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                刷新
              </button>
              <button
                onClick={exportVocabulary}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                disabled={vocabularyList.length === 0}
              >
                导出词汇
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-gray-500">
              加载中...
            </div>
          ) : vocabularyList.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              暂无词汇记录
              <p className="mt-2 text-sm">在翻译文本时点击"添加到词汇本"开始积累词汇</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      原文
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      翻译
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      语境
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      时间
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vocabularyList.map((vocab, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {vocab.original || vocab.text}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {vocab.translation}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {vocab.context || '无'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {vocab.timestamp ? new Date(vocab.timestamp).toLocaleDateString() : '未知'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => deleteVocabulary(index)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-6 text-sm text-gray-500">
            <p>总计词汇数量: {vocabularyList.length}</p>
            <p className="mt-2">提示：词汇记录会自动保存到本地存储，支持导出到JSON文件</p>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralSettings />;
      case 'translation':
        return <TranslationSettings />;
      case 'vocabulary':
        return <VocabularySettings />;
      case 'appearance':
        return <AppearanceSettings />;
      case 'privacy':
        return <PrivacySettings />;
      case 'advanced':
        return <AdvancedSettings />;
      default:
        return <GeneralSettings />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">翻译扩展设置</h1>
              <p className="text-gray-600 mt-1">配置您的翻译体验</p>
            </div>
            
            <div className="flex items-center space-x-3">
              {saved && (
                <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-800 rounded-md">
                  <CheckIcon className="w-4 h-4" />
                  <span className="text-sm">已保存</span>
                </div>
              )}
              
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  title="关闭"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-600" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 侧边栏导航 */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              <TabButton
                id="general"
                icon={<GlobeAltIcon className="w-5 h-5" />}
                label="通用设置"
              />
              <TabButton
                id="translation"
                icon={<CpuChipIcon className="w-5 h-5" />}
                label="翻译设置"
              />
              <TabButton
                id="vocabulary"
                icon={<BookOpenIcon className="w-5 h-5" />}
                label="词汇管理"
              />
              <TabButton
                id="appearance"
                icon={<Cog6ToothIcon className="w-5 h-5" />}
                label="外观设置"
              />
              <TabButton
                id="privacy"
                icon={<ShieldCheckIcon className="w-5 h-5" />}
                label="隐私设置"
              />
              <TabButton
                id="advanced"
                icon={<KeyIcon className="w-5 h-5" />}
                label="高级设置"
              />
            </nav>
          </div>

          {/* 主内容区 */}
          <div className="lg:col-span-3">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernOptions;
