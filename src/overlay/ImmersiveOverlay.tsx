/**
 * 增强的沉浸式翻译覆盖组件
 * 页面级翻译覆盖，支持智能翻译气泡和多种交互模式
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';

// SVG图标组件
const XMarkIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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

const ArrowPathIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

const AdjustmentsHorizontalIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m0 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
  </svg>
);

interface TranslationBubble {
  id: string;
  originalText: string;
  translatedText: string;
  position: { x: number; y: number };
  element: HTMLElement;
  visible: boolean;
  confidence?: number;
  source?: string;
}

// 类型定义
interface ImmersiveOverlayProps {
  original: string;
  detected?: string;
  onClose: () => void;
  onApply: (htmlOrText: string) => void;
}

interface TranslationCandidate {
  text: string;
  confidence: number;
  source?: string;
}

interface SentenceTranslation {
  original: string;
  translated: string;
  candidates: TranslationCandidate[];
  isExpanded: boolean;
}

type DisplayMode = 'side-by-side' | 'overlay' | 'inline';

// Mock 翻译数据（离线开发使用）
const MOCK_TRANSLATIONS: { [key: string]: TranslationCandidate[] } = {
  'Hello world': [
    { text: '你好世界', confidence: 0.95, source: 'neural' },
    { text: '哈喽世界', confidence: 0.8, source: 'statistical' },
    { text: '您好世界', confidence: 0.85, source: 'neural' }
  ],
  'How are you': [
    { text: '你好吗', confidence: 0.9, source: 'neural' },
    { text: '你怎么样', confidence: 0.85, source: 'neural' },
    { text: '您好吗', confidence: 0.8, source: 'statistical' }
  ]
};

const ImmersiveOverlay: React.FC<ImmersiveOverlayProps> = ({
  original,
  detected = 'en',
  onClose,
  onApply
}) => {
  // 状态管理
  const [sentences, setSentences] = useState<SentenceTranslation[]>([]);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('side-by-side');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSentence, setSelectedSentence] = useState<number>(-1);
  
  // Refs
  const overlayRef = useRef<HTMLDivElement>(null);
  const originalPanelRef = useRef<HTMLDivElement>(null);
  const translationPanelRef = useRef<HTMLDivElement>(null);

  // 分句处理
  const splitIntoSentences = useCallback((text: string): string[] => {
    // 简单的分句逻辑，可以根据需要改进
    return text
      .split(/[.!?。！？]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }, []);

  // 获取翻译结果
  const translateSentence = useCallback(async (text: string): Promise<TranslationCandidate[]> => {
    try {
      // 尝试从 Service Worker 获取翻译
      const response = await new Promise<any>((resolve) => {
        chrome.runtime.sendMessage({
          type: 'translate',
          payload: {
            id: Date.now().toString(),
            text,
            source: detected,
            target: 'zh',
            format: 'text'
          }
        }, (result) => {
          if (chrome.runtime.lastError) {
            console.warn("Error sending message to service worker:", chrome.runtime.lastError.message);
            resolve(null);
            return;
          }
          resolve(result);
        });
      });

      if (response?.ok && response.data) {
        return [
          {
            text: response.data.translatedText,
            confidence: 0.9,
            source: 'api'
          },
          ...(response.data.alternatives || []).map((alt: string, index: number) => ({
            text: alt,
            confidence: 0.8 - index * 0.1,
            source: 'api'
          }))
        ];
      }
    } catch (error) {
      console.warn('API translation failed, using mock data:', error);
    }

    // 回退到 Mock 数据
    return MOCK_TRANSLATIONS[text] || [
      { text: `[模拟翻译] ${text}`, confidence: 0.7, source: 'mock' }
    ];
  }, [detected]);


  // 初始化翻译
  useEffect(() => {
    const initializeTranslation = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const sentenceList = splitIntoSentences(original);
        const translations: SentenceTranslation[] = [];

        // 逐句翻译
        for (const sentence of sentenceList) {
          const candidates = await translateSentence(sentence);
          
          // 应用术语映射（目前没有实际的术语映射逻辑）
          const mappedCandidates = candidates.map(candidate => ({
            ...candidate,
            text: candidate.text // 移除了 applyTermMappings 调用
          }));

          translations.push({
            original: sentence,
            translated: mappedCandidates[0]?.text || sentence,
            candidates: mappedCandidates,
            isExpanded: false
          });
        }

        setSentences(translations);
      } catch (err) {
        setError(err instanceof Error ? err.message : '翻译失败');
      } finally {
        setIsLoading(false);
      }
    };

    initializeTranslation();
  }, [original, splitIntoSentences, translateSentence]);

  // 键盘事件处理
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedSentence(prev => Math.max(0, prev - 1));
          break;
        case 'ArrowDown':
          event.preventDefault();
          setSelectedSentence(prev => Math.min(sentences.length - 1, prev + 1));
          break;
        case 'Enter':
          if (selectedSentence >= 0) {
            toggleSentenceExpansion(selectedSentence);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, selectedSentence, sentences.length]);

  // 切换句子展开状态
  const toggleSentenceExpansion = useCallback((index: number) => {
    setSentences(prev => prev.map((sentence, i) => 
      i === index ? { ...sentence, isExpanded: !sentence.isExpanded } : sentence
    ));
  }, []);

  // 选择候选翻译
  const selectCandidate = useCallback((sentenceIndex: number, candidateIndex: number) => {
    setSentences(prev => prev.map((sentence, i) => 
      i === sentenceIndex 
        ? { ...sentence, translated: sentence.candidates[candidateIndex].text }
        : sentence
    ));
  }, []);


  // 复制全部译文
  const copyAllTranslations = useCallback(() => {
    const allTranslations = sentences.map(s => s.translated).join(' ');
    navigator.clipboard.writeText(allTranslations).then(() => {
      // 可以添加成功提示
    });
  }, [sentences]);

  // 应用翻译到页面
  const applyTranslations = useCallback(() => {
    const allTranslations = sentences.map(s => s.translated).join(' ');
    onApply(allTranslations);
  }, [sentences, onApply]);

  // 渲染加载状态
  if (isLoading) {
    return (
      <div 
        ref={overlayRef}
        className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
        role="dialog"
        aria-modal="true"
        aria-labelledby="overlay-title"
      >
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-lg font-medium text-gray-900">正在翻译...</span>
          </div>
        </div>
      </div>
    );
  }

  // 渲染错误状态
  if (error) {
    return (
      <div 
        ref={overlayRef}
        className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
        role="dialog"
        aria-modal="true"
        aria-labelledby="error-title"
      >
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <h2 id="error-title" className="text-xl font-bold text-red-600 mb-4">翻译失败</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={overlayRef}
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-labelledby="overlay-title"
    >
      {/* 头部工具栏 */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 id="overlay-title" className="text-xl font-bold text-gray-900">
            沉浸式翻译
          </h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">显示模式:</span>
            <select
              value={displayMode}
              onChange={(e) => setDisplayMode(e.target.value as DisplayMode)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
              aria-label="选择显示模式"
            >
              <option value="side-by-side">左右对比</option>
              <option value="overlay">覆盖显示</option>
              <option value="inline">内联显示</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={copyAllTranslations}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            aria-label="复制全部译文"
          >
            📋 复制
          </button>
          <button
            onClick={applyTranslations}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            aria-label="应用翻译到页面"
          >
            ✓ 应用
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            aria-label="关闭覆盖层"
          >
            ✕ 关闭
          </button>
        </div>
      </header>

      {/* 主内容区域 */}
      <main className="flex-1 flex overflow-hidden">
        {displayMode === 'side-by-side' && (
          <>
            {/* 原文面板 */}
            <section 
              ref={originalPanelRef}
              className="w-1/2 bg-gray-50 border-r border-gray-200 overflow-y-auto"
              aria-labelledby="original-title"
            >
              <div className="p-6">
                <h2 id="original-title" className="text-lg font-semibold text-gray-900 mb-4">
                  原文 ({detected?.toUpperCase()})
                </h2>
                <div className="space-y-3">
                  {sentences.map((sentence, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded border cursor-pointer transition-colors ${
                        selectedSentence === index
                          ? 'bg-blue-100 border-blue-300'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedSentence(index)}
                      role="button"
                      tabIndex={0}
                      aria-label={`原文句子 ${index + 1}`}
                    >
                      <p className="text-gray-800 leading-relaxed">
                        {sentence.original}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 译文面板 */}
            <section 
              ref={translationPanelRef}
              className="w-1/2 bg-white overflow-y-auto"
              aria-labelledby="translation-title"
            >
              <div className="p-6">
                <h2 id="translation-title" className="text-lg font-semibold text-gray-900 mb-4">
                  译文 (ZH)
                </h2>
                <div className="space-y-3">
                  {sentences.map((sentence, index) => (
                    <div
                      key={index}
                      className={`border rounded transition-colors ${
                        selectedSentence === index
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div
                        className="p-3 cursor-pointer hover:bg-gray-50"
                        onClick={() => toggleSentenceExpansion(index)}
                        role="button"
                        tabIndex={0}
                        aria-expanded={!!sentence.isExpanded}
                        aria-label={`译文句子 ${index + 1}，点击展开候选`}
                      >
                        <p className="text-gray-800 leading-relaxed">
                          {sentence.translated}
                        </p>
                        {sentence.candidates.length > 1 && (
                          <div className="mt-2 text-sm text-gray-500">
                            {sentence.isExpanded ? '收起' : `${sentence.candidates.length} 个候选`}
                          </div>
                        )}
                      </div>

                      {/* 候选翻译 */}
                      {sentence.isExpanded && sentence.candidates.length > 1 && (
                        <div className="border-t border-gray-200 p-3 bg-gray-50">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">候选翻译:</h4>
                          <div className="space-y-2">
                            {sentence.candidates.map((candidate, candidateIndex) => (
                              <div
                                key={candidateIndex}
                                className={`p-2 rounded cursor-pointer transition-colors ${
                                  candidate.text === sentence.translated
                                    ? 'bg-blue-100 border border-blue-300'
                                    : 'bg-white border border-gray-200 hover:bg-gray-50'
                                }`}
                                onClick={() => selectCandidate(index, candidateIndex)}
                                role="button"
                                tabIndex={0}
                                aria-label={`候选翻译 ${candidateIndex + 1}，置信度 ${Math.round(candidate.confidence * 100)}%`}
                              >
                                <p className="text-sm text-gray-800">{candidate.text}</p>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="text-xs text-gray-500">
                                    {candidate.source}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {Math.round(candidate.confidence * 100)}%
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {/* 其他显示模式的实现可以在这里添加 */}
        {displayMode === 'overlay' && (
          <div className="w-full bg-white p-6 overflow-y-auto">
            <p className="text-gray-600 text-center">覆盖显示模式开发中...</p>
          </div>
        )}

        {displayMode === 'inline' && (
          <div className="w-full bg-white p-6 overflow-y-auto">
            <p className="text-gray-600 text-center">内联显示模式开发中...</p>
          </div>
        )}
      </main>

      {/* 底部状态栏 */}
      <footer className="bg-gray-100 border-t border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>共 {sentences.length} 句</span>
            <span>已翻译 {sentences.filter(s => s.translated).length} 句</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>使用 ↑↓ 键导航，Enter 展开，Esc 关闭</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ImmersiveOverlay;