/**
 * 优化的Popup界面组件 - 现代化设计与增强功能
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';

// SVG图标组件
const ArrowPathIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

const SpeakerWaveIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.59-.79-1.59-1.59V9.75c0-.8.71-1.59 1.59-1.59h2.24z" />
  </svg>
);

const DocumentDuplicateIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
  </svg>
);

const Cog6ToothIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const StarIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// 翻译结果接口
interface TranslationResult {
  ok: boolean;
  data?: {
    translatedText: string;
    detectedLanguage?: string;
    alternatives?: string[];
    confidence?: number;
    source?: 'online' | 'offline' | 'memory' | 'contextual';
    contextualAdjustments?: any[];
  };
  error?: {
    code: string;
    message: string;
  };
}

// 生词接口
interface VocabularyWord {
  id?: string;
  word: string;
  translation: string;
  sourceLanguage: string;
  targetLanguage: string;
  context?: string;
  phonetic?: string;
  createdAt: Date;
  reviewCount?: number;
  masteryLevel?: number; // 0-5，掌握程度
  lastReviewed?: Date;
  source?: string; // 来源页面URL
  tags?: string[];
  isStarred?: boolean;
}

// 同步统计接口
interface SyncStats {
  totalWords: number;
  totalTranslations: number;
  lastSyncTime: Date;
  syncStatus: 'idle' | 'syncing' | 'error';
  pendingUploads: number;
  newFromMobile: number;
}

// 语言选项
const LANGUAGES = [
  { code: 'auto', name: '自动检测', flag: '🔍' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
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
  { value: 'qwen-turbo-latest', name: '阿里云千问', description: '快速准确', icon: '🚀' },
  { value: 'deepseek-chat', name: 'DeepSeek', description: '深度理解', icon: '🧠' },
  { value: 'gpt-4o', name: 'GPT-4', description: '顶级质量', icon: '⭐' },
  { value: 'moonshot-kimi', name: 'Moonshot Kimi', description: '长文本', icon: '🌙' }
];

const OptimizedPopup: React.FC = () => {
  // 状态管理
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('zh');
  const [selectedModel, setSelectedModel] = useState('qwen-turbo-latest');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alternatives, setAlternatives] = useState<string[]>([]);
  const [translationHistory, setTranslationHistory] = useState<any[]>([]);
  const [currentTab, setCurrentTab] = useState<'translate' | 'history' | 'vocabulary' | 'settings'>('translate');
  const [confidence, setConfidence] = useState<number>(0);
  const [translationSource, setTranslationSource] = useState<string>('');
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
  // 词汇管理状态
  const [vocabularyWords, setVocabularyWords] = useState<VocabularyWord[]>([]);
  const [syncStats, setSyncStats] = useState<SyncStats>({
    totalWords: 0,
    totalTranslations: 0,
    lastSyncTime: new Date(),
    syncStatus: 'idle',
    pendingUploads: 0,
    newFromMobile: 0
  });
  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  // 加载设置和历史记录
  useEffect(() => {
    chrome.storage.local.get([
      'defaultSourceLang',
      'defaultTargetLang',
      'selectedModel',
      'translationHistory',
      'favorites'
    ], (result) => {
      if (result.defaultSourceLang) setSourceLang(result.defaultSourceLang);
      if (result.defaultTargetLang) setTargetLang(result.defaultTargetLang);
      if (result.selectedModel) setSelectedModel(result.selectedModel);
      if (result.translationHistory) setTranslationHistory(result.translationHistory);
      if (result.favorites) setFavorites(new Set(result.favorites));
    });
  }, []);

  // 保存设置
  const saveSettings = useCallback(() => {
    chrome.storage.local.set({
      defaultSourceLang: sourceLang,
      defaultTargetLang: targetLang,
      selectedModel
    });
  }, [sourceLang, targetLang, selectedModel]);

  useEffect(() => {
    saveSettings();
  }, [saveSettings]);

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
            format: 'text',
            priority: 2 // 高优先级
          }
        }, resolve);
      });

      if (response.ok && response.data) {
        setTranslatedText(response.data.translatedText);
        setAlternatives(response.data.alternatives || []);
        setConfidence(response.data.confidence || 0);
        setTranslationSource(response.data.source || 'online');
        
        // 保存到翻译历史
        const historyEntry = {
          id: Date.now(),
          source: inputText.trim(),
          target: response.data.translatedText,
          sourceLang,
          targetLang,
          model: selectedModel,
          confidence: response.data.confidence,
          timestamp: Date.now(),
          translationSource: response.data.source
        };

        const updatedHistory = [historyEntry, ...translationHistory.slice(0, 99)];
        setTranslationHistory(updatedHistory);
        chrome.storage.local.set({ translationHistory: updatedHistory });
        
        // 自动添加生词（如果单词长度合适且不是中文翻译成中文）
        const sourceText = inputText.trim();
        const isWord = sourceText.split(' ').length <= 3 && sourceText.length >= 2 && sourceText.length <= 30;
        const isNotChineseToChinese = !(sourceLang === 'zh' && targetLang === 'zh');
        
        if (isWord && isNotChineseToChinese && !vocabularyWords.some(word => word.word.toLowerCase() === sourceText.toLowerCase())) {
          await addToVocabulary(sourceText, response.data.translatedText);
        }
        
      } else {
        setError(response.error?.message || '翻译失败');
      }
    } catch (error) {
      setError('网络错误，请检查连接');
      console.error('Translation error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [inputText, sourceLang, targetLang, selectedModel, translationHistory]);

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
    
    // 如果有翻译结果，也交换内容
    if (translatedText) {
      const temp = inputText;
      setInputText(translatedText);
      setTranslatedText(temp);
    }
  }, [sourceLang, targetLang, inputText, translatedText]);

  // 复制到剪贴板
  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // 可以添加复制成功的提示
    } catch (error) {
      console.error('Copy failed:', error);
    }
  }, []);

  // 词汇管理方法
  const loadVocabularyWords = useCallback(async () => {
    try {
      const result = await chrome.storage.local.get(['vocabularyWords']);
      if (result.vocabularyWords) {
        setVocabularyWords(result.vocabularyWords);
      }
    } catch (error) {
      console.error('Failed to load vocabulary:', error);
    }
  }, []);

  const addToVocabulary = useCallback(async (word: string, translation: string) => {
    const vocabularyWord: VocabularyWord = {
      id: Date.now().toString(),
      word: word,
      translation: translation,
      sourceLanguage: sourceLang,
      targetLanguage: targetLang,
      createdAt: new Date(),
      reviewCount: 0,
      masteryLevel: 0,
      isStarred: false,
      tags: []
    };

    const updatedWords = [vocabularyWord, ...vocabularyWords];
    setVocabularyWords(updatedWords);
    await chrome.storage.local.set({ vocabularyWords: updatedWords });
    
    // 更新同步统计
    setSyncStats(prev => ({
      ...prev,
      totalWords: prev.totalWords + 1,
      pendingUploads: prev.pendingUploads + 1
    }));
  }, [vocabularyWords, sourceLang, targetLang]);

  const removeFromVocabulary = useCallback(async (wordId: string) => {
    const updatedWords = vocabularyWords.filter(word => word.id !== wordId);
    setVocabularyWords(updatedWords);
    await chrome.storage.local.set({ vocabularyWords: updatedWords });
    
    setSyncStats(prev => ({
      ...prev,
      totalWords: prev.totalWords - 1
    }));
  }, [vocabularyWords]);

  const updateWordMastery = useCallback(async (wordId: string, masteryLevel: number) => {
    const updatedWords = vocabularyWords.map(word => 
      word.id === wordId 
        ? { ...word, masteryLevel, lastReviewed: new Date(), reviewCount: (word.reviewCount || 0) + 1 }
        : word
    );
    setVocabularyWords(updatedWords);
    await chrome.storage.local.set({ vocabularyWords: updatedWords });
  }, [vocabularyWords]);

  const toggleWordStar = useCallback(async (wordId: string) => {
    const updatedWords = vocabularyWords.map(word => 
      word.id === wordId ? { ...word, isStarred: !word.isStarred } : word
    );
    setVocabularyWords(updatedWords);
    await chrome.storage.local.set({ vocabularyWords: updatedWords });
  }, [vocabularyWords]);

  const syncWithMobile = useCallback(async () => {
    setSyncStats(prev => ({ ...prev, syncStatus: 'syncing' }));
    
    try {
      // 导入移动端同步服务
      const { mobileSyncService } = await import('../lib/mobileSyncService');
      
      // 同步词汇到移动端
      for (const word of vocabularyWords) {
        await mobileSyncService.addVocabularyWord({
          word: word.word,
          translation: word.translation,
          phonetic: word.phonetic || '',
          definition: word.translation,
          examples: [],
          difficulty: 'medium',
          tags: word.tags || []
        });
      }
      
      // 触发同步队列处理
      const stats = await mobileSyncService.getSyncStats();
      
      setSyncStats(prev => ({
        ...prev,
        syncStatus: 'idle',
        lastSyncTime: new Date(),
        pendingUploads: 0,
        totalWords: stats.totalWords,
        totalTranslations: stats.totalTranslations
      }));
      
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStats(prev => ({ ...prev, syncStatus: 'error' }));
    }
  }, [vocabularyWords]);

  // 加载词汇数据
  useEffect(() => {
    loadVocabularyWords();
  }, [loadVocabularyWords]);

  // 朗读文本
  const speakText = useCallback((text: string, lang: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'zh' ? 'zh-CN' : lang;
      speechSynthesis.speak(utterance);
    }
  }, []);

  // 添加到收藏
  const toggleFavorite = useCallback((historyId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(historyId)) {
      newFavorites.delete(historyId);
    } else {
      newFavorites.add(historyId);
    }
    setFavorites(newFavorites);
    chrome.storage.local.set({ favorites: Array.from(newFavorites) });
  }, [favorites]);

  // 清空历史记录
  const clearHistory = useCallback(() => {
    setTranslationHistory([]);
    chrome.storage.local.set({ translationHistory: [] });
  }, []);

  // 获取翻译源显示信息
  const getSourceInfo = useMemo(() => {
    const sourceMap = {
      online: { text: '在线翻译', color: 'text-green-600', icon: '🌐' },
      offline: { text: '离线翻译', color: 'text-blue-600', icon: '📱' },
      memory: { text: '个人记忆', color: 'text-purple-600', icon: '🧠' },
      contextual: { text: '上下文感知', color: 'text-orange-600', icon: '🎯' }
    };
    return sourceMap[translationSource as keyof typeof sourceMap] || sourceMap.online;
  }, [translationSource]);

  // 翻译界面
  const TranslateTab = () => (
    <div className="space-y-4">
      {/* 语言选择栏 */}
      <div className="flex items-center space-x-2">
        <select
          value={sourceLang}
          onChange={(e) => setSourceLang(e.target.value)}
          className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          title="选择源语言"
          aria-label="选择源语言"
        >
          {LANGUAGES.map(lang => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
        
        <button
          onClick={handleSwapLanguages}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="交换语言"
        >
          <ArrowPathIcon className="w-4 h-4 text-gray-600" />
        </button>
        
        <select
          value={targetLang}
          onChange={(e) => setTargetLang(e.target.value)}
          className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          title="选择目标语言"
          aria-label="选择目标语言"
        >
          {LANGUAGES.filter(lang => lang.code !== 'auto').map(lang => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
      </div>

      {/* 输入区域 */}
      <div className="relative">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="输入要翻译的文本..."
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          rows={4}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              handleTranslate();
            }
          }}
        />
        <div className="absolute bottom-2 right-2 text-xs text-gray-400">
          {inputText.length}/500
        </div>
      </div>

      {/* AI模型选择 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          AI翻译模型
        </label>
        <div className="grid grid-cols-2 gap-2">
          {AI_MODELS.map(model => (
            <button
              key={model.value}
              onClick={() => setSelectedModel(model.value)}
              className={`p-2 rounded-lg border text-sm transition-colors ${
                selectedModel === model.value
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span>{model.icon}</span>
                <div className="text-left">
                  <div className="font-medium">{model.name}</div>
                  <div className="text-xs opacity-60">{model.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 翻译按钮 */}
      <button
        onClick={handleTranslate}
        disabled={!inputText.trim() || isLoading}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
      >
        {isLoading ? (
          <ArrowPathIcon className="w-4 h-4 animate-spin" />
        ) : (
          <span>翻译</span>
        )}
      </button>

      {/* 错误信息 */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* 翻译结果 */}
      {translatedText && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-800">翻译结果</h3>
            <div className="flex items-center space-x-1 text-xs">
              <span className={getSourceInfo.color}>{getSourceInfo.icon}</span>
              <span className={getSourceInfo.color}>{getSourceInfo.text}</span>
              {confidence > 0 && (
                <span className="text-gray-500">
                  ({Math.round(confidence * 100)}%)
                </span>
              )}
            </div>
          </div>
          
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-gray-800 leading-relaxed">{translatedText}</p>
            
            {/* 操作按钮 */}
            <div className="flex items-center space-x-2 mt-3">
              <button
                onClick={() => copyToClipboard(translatedText)}
                className="p-1.5 hover:bg-green-100 rounded text-green-600 transition-colors"
                title="复制"
              >
                <DocumentDuplicateIcon className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => speakText(translatedText, targetLang)}
                className="p-1.5 hover:bg-green-100 rounded text-green-600 transition-colors"
                title="朗读"
              >
                <SpeakerWaveIcon className="w-4 h-4" />
              </button>

              <button
                onClick={() => addToVocabulary(inputText.trim(), translatedText)}
                className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                title="添加到生词本"
              >
                📚 收藏
              </button>

              {alternatives.length > 0 && (
                <button
                  onClick={() => setShowAlternatives(!showAlternatives)}
                  className="p-1.5 hover:bg-green-100 rounded text-green-600 transition-colors text-xs"
                  title="备选翻译"
                >
                  {alternatives.length} 个备选
                </button>
              )}
            </div>
          </div>

          {/* 备选翻译 */}
          {showAlternatives && alternatives.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">备选翻译</h4>
              {alternatives.map((alt, index) => (
                <div
                  key={index}
                  className="p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => setTranslatedText(alt)}
                >
                  <p className="text-sm text-gray-700">{alt}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  // 历史记录界面
  const HistoryTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-800">翻译历史</h3>
        <button
          onClick={clearHistory}
          className="text-sm text-red-600 hover:text-red-700"
        >
          清空历史
        </button>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto">
        {translationHistory.map((item) => (
          <div
            key={item.id}
            className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 truncate">{item.source}</p>
                <p className="text-sm text-blue-600 mt-1">{item.target}</p>
                <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                  <span>{LANGUAGES.find(l => l.code === item.sourceLang)?.flag}</span>
                  <ArrowPathIcon className="w-3 h-3" />
                  <span>{LANGUAGES.find(l => l.code === item.targetLang)?.flag}</span>
                  <span>•</span>
                  <ClockIcon className="w-3 h-3" />
                  <span>{new Date(item.timestamp).toLocaleString()}</span>
                  {item.confidence && (
                    <>
                      <span>•</span>
                      <span>{Math.round(item.confidence * 100)}%</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-1 ml-2">
                <button
                  onClick={() => toggleFavorite(item.id.toString())}
                  className={`p-1 rounded transition-colors ${
                    favorites.has(item.id.toString())
                      ? 'text-yellow-500 hover:text-yellow-600'
                      : 'text-gray-400 hover:text-yellow-500'
                  }`}
                  title={favorites.has(item.id.toString()) ? '取消收藏' : '添加收藏'}
                  aria-label={favorites.has(item.id.toString()) ? '取消收藏' : '添加收藏'}
                >
                  <StarIcon className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => copyToClipboard(item.target)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                  title="复制翻译结果"
                  aria-label="复制翻译结果"
                >
                  <DocumentDuplicateIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {translationHistory.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <ClockIcon className="w-12 h-12 mx-auto opacity-30 mb-2" />
            <p className="text-sm">暂无翻译历史</p>
          </div>
        )}
      </div>
    </div>
  );

  // 设置界面
  const SettingsTab = () => (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-800">设置</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            默认源语言
          </label>
          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
            className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            title="默认源语言"
            aria-label="默认源语言"
          >
            {LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            默认目标语言
          </label>
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            title="默认目标语言"
            aria-label="默认目标语言"
          >
            {LANGUAGES.filter(lang => lang.code !== 'auto').map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            默认翻译模型
          </label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            title="默认翻译模型"
            aria-label="默认翻译模型"
          >
            {AI_MODELS.map(model => (
              <option key={model.value} value={model.value}>
                {model.icon} {model.name} - {model.description}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => chrome.runtime.openOptionsPage()}
          className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm"
        >
          打开高级设置
        </button>
      </div>
    </div>
  );

  // 词汇管理界面
  const VocabularyTab = () => (
    <div className="space-y-4">
      {/* 同步状态栏 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              syncStats.syncStatus === 'idle' ? 'bg-green-500' :
              syncStats.syncStatus === 'syncing' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="text-sm font-medium">
              {syncStats.syncStatus === 'idle' && '同步正常'}
              {syncStats.syncStatus === 'syncing' && '正在同步...'}
              {syncStats.syncStatus === 'error' && '同步出错'}
            </span>
          </div>
          <button
            onClick={syncWithMobile}
            disabled={syncStats.syncStatus === 'syncing'}
            className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full hover:bg-blue-600 disabled:opacity-50"
          >
            {syncStats.syncStatus === 'syncing' ? '同步中...' : '立即同步'}
          </button>
        </div>
        
        <div className="mt-2 grid grid-cols-3 gap-4 text-xs text-gray-600">
          <div className="text-center">
            <div className="font-semibold text-blue-600">{syncStats.totalWords}</div>
            <div>生词总数</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-green-600">{syncStats.totalTranslations}</div>
            <div>翻译记录</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-purple-600">{syncStats.pendingUploads}</div>
            <div>待上传</div>
          </div>
        </div>
      </div>

      {/* 搜索框 */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索生词..."
          className="w-full pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
        <div className="absolute right-3 top-2.5 text-gray-400">
          🔍
        </div>
      </div>

      {/* 生词列表 */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {vocabularyWords
          .filter(word => 
            searchQuery === '' || 
            word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
            word.translation.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map(word => (
            <div key={word.id} className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900">{word.word}</h3>
                    <button
                      onClick={() => word.id && toggleWordStar(word.id)}
                      className={`${word.isStarred ? 'text-yellow-500' : 'text-gray-300'} hover:text-yellow-400`}
                      title={word.isStarred ? '取消收藏' : '收藏'}
                    >
                      <StarIcon className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-1">{word.translation}</p>
                  
                  {word.phonetic && (
                    <p className="text-xs text-blue-600 mt-1">[{word.phonetic}]</p>
                  )}
                  
                  {word.context && (
                    <p className="text-xs text-gray-500 mt-2 italic">"{word.context}"</p>
                  )}
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex space-x-1" title="掌握程度">
                      {[...Array(5)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => word.id && updateWordMastery(word.id, i + 1)}
                          className={`w-3 h-3 rounded-full ${
                            i < (word.masteryLevel || 0) ? 'bg-green-500' : 'bg-gray-200'
                          }`}
                          title={`设置掌握程度为 ${i + 1}`}
                        />
                      ))}
                    </div>
                    
                    <div className="text-xs text-gray-400">
                      复习 {word.reviewCount || 0} 次
                    </div>
                  </div>
                  
                  {word.tags && word.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {word.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => word.id && removeFromVocabulary(word.id)}
                  className="ml-2 text-gray-400 hover:text-red-500 text-sm"
                  title="删除生词"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
      </div>

      {vocabularyWords.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📚</div>
          <p>还没有生词记录</p>
          <p className="text-sm mt-1">翻译时会自动添加生词到这里</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-96 bg-white shadow-lg rounded-lg overflow-hidden">
      {/* 头部导航 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-white">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">智能翻译</h1>
          <div className="flex space-x-1">
            <button
              onClick={() => setCurrentTab('translate')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                currentTab === 'translate'
                  ? 'bg-white bg-opacity-20'
                  : 'hover:bg-white hover:bg-opacity-10'
              }`}
            >
              翻译
            </button>
            <button
              onClick={() => setCurrentTab('vocabulary')}
              className={`px-3 py-1 rounded-full text-sm transition-colors relative ${
                currentTab === 'vocabulary'
                  ? 'bg-white bg-opacity-20'
                  : 'hover:bg-white hover:bg-opacity-10'
              }`}
            >
              生词本
              {vocabularyWords.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">
                  {Math.min(vocabularyWords.length, 99)}
                </span>
              )}
            </button>
            <button
              onClick={() => setCurrentTab('history')}
              className={`px-3 py-1 rounded-full text-sm transition-colors relative ${
                currentTab === 'history'
                  ? 'bg-white bg-opacity-20'
                  : 'hover:bg-white hover:bg-opacity-10'
              }`}
            >
              历史
              {translationHistory.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {Math.min(translationHistory.length, 99)}
                </span>
              )}
            </button>
            <button
              onClick={() => setCurrentTab('settings')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                currentTab === 'settings'
                  ? 'bg-white bg-opacity-20'
                  : 'hover:bg-white hover:bg-opacity-10'
              }`}
              title="设置"
              aria-label="设置"
            >
              <Cog6ToothIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="p-4">
        {currentTab === 'translate' && <TranslateTab />}
        {currentTab === 'vocabulary' && <VocabularyTab />}
        {currentTab === 'history' && <HistoryTab />}
        {currentTab === 'settings' && <SettingsTab />}
      </div>

      {/* 底部快捷操作 */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>快捷键：Ctrl+Shift+Y</span>
          <button
            onClick={() => chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
              if (tabs[0]?.id) {
                chrome.tabs.sendMessage(tabs[0].id, {
                  type: 'toggleImmersiveTranslation'
                });
                window.close();
              }
            })}
            className="text-blue-600 hover:text-blue-700"
          >
            沉浸式翻译
          </button>
        </div>
      </div>
    </div>
  );
};

export default OptimizedPopup;
