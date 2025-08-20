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

interface ImmersiveOverlayProps {
  onClose: () => void;
}

const ImmersiveOverlay: React.FC<ImmersiveOverlayProps> = ({ onClose }) => {
  // 状态管理
  const [isEnabled, setIsEnabled] = useState(true);
  const [bubbles, setBubbles] = useState<TranslationBubble[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [translationMode, setTranslationMode] = useState<'hover' | 'select' | 'auto'>('hover');
  const [targetLanguage, setTargetLanguage] = useState('zh');
  const [showSettings, setShowSettings] = useState(false);
  const [autoTranslateDelay, setAutoTranslateDelay] = useState(1000);
  const [minTextLength, setMinTextLength] = useState(3);
  const overlayRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // 语言选项
  const LANGUAGES = [
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'es', name: 'Español', flag: '🇪🇸' }
  ];

  // 翻译文本
  const translateText = useCallback(async (text: string, element: HTMLElement) => {
    if (!text.trim() || text.length < minTextLength) return;
    
    setIsLoading(true);
    
    try {
      const response = await new Promise<any>((resolve) => {
        chrome.runtime.sendMessage({
          type: 'translate',
          payload: {
            id: Date.now().toString(),
            text: text.trim(),
            source: 'auto',
            target: targetLanguage,
            format: 'text',
            priority: 1
          }
        }, resolve);
      });

      if (response.ok && response.data) {
        const rect = element.getBoundingClientRect();
        const bubbleId = `bubble-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const newBubble: TranslationBubble = {
          id: bubbleId,
          originalText: text,
          translatedText: response.data.translatedText,
          position: {
            x: rect.left + rect.width / 2,
            y: rect.top - 10
          },
          element,
          visible: true,
          confidence: response.data.confidence,
          source: response.data.source
        };

        setBubbles(prev => [...prev.filter(b => b.element !== element), newBubble]);
        
        // 自动隐藏气泡
        setTimeout(() => {
          setBubbles(prev => prev.map(b => 
            b.id === bubbleId ? { ...b, visible: false } : b
          ));
        }, 5000);
      }
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [targetLanguage, minTextLength]);

  // 处理鼠标悬停
  const handleMouseEnter = useCallback((event: MouseEvent) => {
    if (!isEnabled || translationMode !== 'hover') return;
    
    const target = event.target as HTMLElement;
    if (!target || target.closest('.translation-overlay')) return;
    
    // 清除之前的延时
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // 获取文本内容
    const text = target.textContent?.trim();
    if (!text || text.length < minTextLength) return;
    
    // 延迟翻译
    timeoutRef.current = setTimeout(() => {
      translateText(text, target);
    }, autoTranslateDelay);
  }, [isEnabled, translationMode, translateText, autoTranslateDelay, minTextLength]);

  // 处理鼠标离开
  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  // 处理文本选择
  const handleTextSelection = useCallback(() => {
    if (!isEnabled || translationMode !== 'select') return;
    
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;
    
    const selectedText = selection.toString().trim();
    if (!selectedText || selectedText.length < minTextLength) return;
    
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    // 创建临时元素用于定位
    const tempElement = document.createElement('span');
    tempElement.style.position = 'absolute';
    tempElement.style.left = rect.left + 'px';
    tempElement.style.top = rect.top + 'px';
    document.body.appendChild(tempElement);
    
    translateText(selectedText, tempElement);
    
    // 清除选择
    selection.removeAllRanges();
    
    // 清理临时元素
    setTimeout(() => {
      if (tempElement.parentNode) {
        tempElement.parentNode.removeChild(tempElement);
      }
    }, 100);
  }, [isEnabled, translationMode, translateText, minTextLength]);

  // 复制到剪贴板
  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
  }, []);

  // 朗读文本
  const speakText = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = targetLanguage === 'zh' ? 'zh-CN' : targetLanguage;
      speechSynthesis.speak(utterance);
    }
  }, [targetLanguage]);

  // 删除气泡
  const removeBubble = useCallback((bubbleId: string) => {
    setBubbles(prev => prev.filter(b => b.id !== bubbleId));
  }, []);

  // 设置事件监听器
  useEffect(() => {
    if (!isEnabled) return;

    const handleMouseEvent = (e: MouseEvent) => {
      if (translationMode === 'hover') {
        if (e.type === 'mouseenter' || e.type === 'mouseover') {
          handleMouseEnter(e);
        } else if (e.type === 'mouseleave') {
          handleMouseLeave();
        }
      }
    };

    const handleSelection = () => {
      setTimeout(handleTextSelection, 100);
    };

    // 添加事件监听器
    if (translationMode === 'hover') {
      document.addEventListener('mouseover', handleMouseEvent);
      document.addEventListener('mouseleave', handleMouseEvent);
    } else if (translationMode === 'select') {
      document.addEventListener('mouseup', handleSelection);
    }

    return () => {
      document.removeEventListener('mouseover', handleMouseEvent);
      document.removeEventListener('mouseleave', handleMouseEvent);
      document.removeEventListener('mouseup', handleSelection);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isEnabled, translationMode, handleMouseEnter, handleMouseLeave, handleTextSelection]);

  // 自动翻译模式
  useEffect(() => {
    if (!isEnabled || translationMode !== 'auto') return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent?.trim();
            if (text && text.length >= minTextLength) {
              const parent = node.parentElement;
              if (parent && !parent.closest('.translation-overlay')) {
                translateText(text, parent);
              }
            }
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;
            const walker = document.createTreeWalker(
              element,
              NodeFilter.SHOW_TEXT
            );

            let textNode;
            while (textNode = walker.nextNode()) {
              const text = textNode.textContent?.trim();
              if (text && text.length >= minTextLength) {
                const parent = textNode.parentElement;
                if (parent && !parent.closest('.translation-overlay')) {
                  translateText(text, parent);
                }
              }
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => observer.disconnect();
  }, [isEnabled, translationMode, translateText, minTextLength]);

  // 渲染翻译气泡
  const TranslationBubble: React.FC<{ bubble: TranslationBubble }> = ({ bubble }) => (
    <div
      className={`fixed z-[999999] max-w-xs bg-white shadow-lg rounded-lg border border-gray-200 p-3 transition-all duration-300 ${
        bubble.visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
      }`}
      style={{
        left: `${Math.max(10, Math.min(bubble.position.x - 100, window.innerWidth - 310))}px`,
        top: `${Math.max(10, bubble.position.y - 80)}px`,
        transform: 'translateY(-100%)'
      }}
    >
      {/* 原文 */}
      <div className="text-xs text-gray-500 mb-1 line-clamp-2">
        {bubble.originalText}
      </div>
      
      {/* 翻译结果 */}
      <div className="text-sm text-gray-800 mb-2 font-medium">
        {bubble.translatedText}
      </div>
      
      {/* 元信息 */}
      <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
        <span>
          {bubble.source === 'offline' ? '📱' : '🌐'} 
          {bubble.confidence ? ` ${Math.round(bubble.confidence * 100)}%` : ''}
        </span>
        <span className="text-gray-300">•</span>
      </div>
      
      {/* 操作按钮 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => copyToClipboard(bubble.translatedText)}
            className="p-1 hover:bg-gray-100 rounded text-gray-600 transition-colors"
            title="复制翻译"
          >
            <DocumentDuplicateIcon className="w-3 h-3" />
          </button>
          
          <button
            onClick={() => speakText(bubble.translatedText)}
            className="p-1 hover:bg-gray-100 rounded text-gray-600 transition-colors"
            title="朗读翻译"
          >
            <SpeakerWaveIcon className="w-3 h-3" />
          </button>
        </div>
        
        <button
          onClick={() => removeBubble(bubble.id)}
          className="p-1 hover:bg-red-100 rounded text-red-500 transition-colors"
          title="关闭"
        >
          <XMarkIcon className="w-3 h-3" />
        </button>
      </div>
      
      {/* 箭头 */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2">
        <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white"></div>
        <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-200 -mt-1"></div>
      </div>
    </div>
  );

  return (
    <div ref={overlayRef} className="translation-overlay">
      {/* 控制面板 */}
      <div className="fixed top-4 right-4 z-[999998] bg-white shadow-lg rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">沉浸式翻译</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="设置"
            >
              <AdjustmentsHorizontalIcon className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-red-100 rounded text-red-500 transition-colors"
              title="关闭"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 主控制 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              启用翻译
            </label>
            <button
              onClick={() => setIsEnabled(!isEnabled)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                isEnabled ? 'bg-blue-600' : 'bg-gray-300'
              }`}
              title={isEnabled ? '禁用翻译' : '启用翻译'}
              aria-label={isEnabled ? '禁用翻译' : '启用翻译'}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                isEnabled ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              翻译模式
            </label>
            <select
              value={translationMode}
              onChange={(e) => setTranslationMode(e.target.value as any)}
              className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-blue-500"
              disabled={!isEnabled}
              title="选择翻译模式"
              aria-label="选择翻译模式"
            >
              <option value="hover">鼠标悬停</option>
              <option value="select">文本选择</option>
              <option value="auto">自动翻译</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              目标语言
            </label>
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-blue-500"
              disabled={!isEnabled}
              title="选择目标语言"
              aria-label="选择目标语言"
            >
              {LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* 高级设置 */}
          {showSettings && (
            <div className="space-y-3 pt-3 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  触发延迟 (ms): {autoTranslateDelay}
                </label>
                <input
                  type="range"
                  min="100"
                  max="3000"
                  step="100"
                  value={autoTranslateDelay}
                  onChange={(e) => setAutoTranslateDelay(Number(e.target.value))}
                  className="w-full"
                  disabled={!isEnabled}
                  title="触发延迟滑块"
                  aria-label={`触发延迟: ${autoTranslateDelay}毫秒`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  最小文本长度: {minTextLength}
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={minTextLength}
                  onChange={(e) => setMinTextLength(Number(e.target.value))}
                  className="w-full"
                  disabled={!isEnabled}
                  title="最小文本长度滑块"
                  aria-label={`最小文本长度: ${minTextLength}个字符`}
                />
              </div>

              <button
                onClick={() => setBubbles([])}
                className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded transition-colors text-sm"
                disabled={!isEnabled || bubbles.length === 0}
              >
                清除所有翻译气泡
              </button>
            </div>
          )}
        </div>

        {/* 状态信息 */}
        <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-500">
          <div className="flex items-center justify-between">
            <span>
              {isLoading ? '翻译中...' : `${bubbles.filter(b => b.visible).length} 个翻译气泡`}
            </span>
            {isLoading && (
              <ArrowPathIcon className="w-3 h-3 animate-spin" />
            )}
          </div>
        </div>
      </div>

      {/* 翻译气泡 */}
      {bubbles.map(bubble => (
        <TranslationBubble key={bubble.id} bubble={bubble} />
      ))}

      {/* 加载指示器 */}
      {isLoading && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[999999] bg-black bg-opacity-50 rounded-full p-3">
          <ArrowPathIcon className="w-6 h-6 text-white animate-spin" />
        </div>
      )}
    </div>
  );
};

export default ImmersiveOverlay;
