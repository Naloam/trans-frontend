/**
 * 离线翻译管理器 - 支持多种离线翻译源和fallback机制
 */

interface OfflineTranslationProvider {
  name: string;
  priority: number;
  available: boolean;
  translate: (text: string, source: string, target: string) => Promise<string>;
  detect?: (text: string) => Promise<string>;
}

interface TranslationRule {
  pattern: RegExp;
  replacement: string;
  languages: string[];
}

interface LocalDictionary {
  [key: string]: {
    [target: string]: string;
  };
}

class OfflineTranslationManager {
  private providers: OfflineTranslationProvider[] = [];
  private dictionaries = new Map<string, LocalDictionary>(); // 语言对字典
  private rules: TranslationRule[] = []; // 翻译规则
  private patterns = new Map<string, RegExp[]>(); // 语言模式
  private initialized = false;

  /**
   * 初始化离线翻译系统
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    // 初始化内建翻译提供器
    await this.initializeProviders();
    
    // 加载本地字典
    await this.loadDictionaries();
    
    // 加载翻译规则
    await this.loadTranslationRules();
    
    // 加载语言检测模式
    await this.loadLanguagePatterns();

    this.initialized = true;
    console.log('Offline translation system initialized');
  }

  /**
   * 初始化翻译提供器
   */
  private async initializeProviders(): Promise<void> {
    // 1. 基础词典翻译器
    this.providers.push({
      name: 'dictionary',
      priority: 3,
      available: true,
      translate: this.dictionaryTranslate.bind(this)
    });

    // 2. 规则翻译器
    this.providers.push({
      name: 'rules',
      priority: 2,
      available: true,
      translate: this.ruleBasedTranslate.bind(this)
    });

    // 3. 模式匹配翻译器
    this.providers.push({
      name: 'pattern',
      priority: 1,
      available: true,
      translate: this.patternTranslate.bind(this)
    });

    // 4. Web Workers 机器学习翻译器 (未来扩展)
    if (typeof Worker !== 'undefined') {
      this.providers.push({
        name: 'ml-worker',
        priority: 4,
        available: false, // 需要模型文件
        translate: this.mlTranslate.bind(this),
        detect: this.mlDetect.bind(this)
      });
    }

    // 按优先级排序
    this.providers.sort((a, b) => b.priority - a.priority);
  }

  /**
   * 加载本地字典
   */
  private async loadDictionaries(): Promise<void> {
    // 常用词汇字典 (英中)
    const enZhDict: LocalDictionary = {
      "hello": { "zh": "你好" },
      "world": { "zh": "世界" },
      "computer": { "zh": "计算机" },
      "internet": { "zh": "互联网" },
      "software": { "zh": "软件" },
      "hardware": { "zh": "硬件" },
      "technology": { "zh": "技术" },
      "artificial intelligence": { "zh": "人工智能" },
      "machine learning": { "zh": "机器学习" },
      "deep learning": { "zh": "深度学习" },
      "neural network": { "zh": "神经网络" },
      "database": { "zh": "数据库" },
      "algorithm": { "zh": "算法" },
      "programming": { "zh": "编程" },
      "development": { "zh": "开发" },
      "application": { "zh": "应用" },
      "system": { "zh": "系统" },
      "network": { "zh": "网络" },
      "security": { "zh": "安全" },
      "encryption": { "zh": "加密" },
      "authentication": { "zh": "认证" },
      "authorization": { "zh": "授权" },
      "cloud computing": { "zh": "云计算" },
      "big data": { "zh": "大数据" },
      "blockchain": { "zh": "区块链" },
      "cryptocurrency": { "zh": "加密货币" },
      "bitcoin": { "zh": "比特币" },
      "ethereum": { "zh": "以太坊" },
      "smart contract": { "zh": "智能合约" },
      "user interface": { "zh": "用户界面" },
      "user experience": { "zh": "用户体验" },
      "responsive design": { "zh": "响应式设计" },
      "mobile application": { "zh": "移动应用" },
      "web development": { "zh": "网站开发" },
      "frontend": { "zh": "前端" },
      "backend": { "zh": "后端" },
      "full stack": { "zh": "全栈" },
      "framework": { "zh": "框架" },
      "library": { "zh": "库" },
      "api": { "zh": "接口" },
      "rest api": { "zh": "REST接口" },
      "graphql": { "zh": "GraphQL" },
      "microservices": { "zh": "微服务" },
      "container": { "zh": "容器" },
      "docker": { "zh": "Docker" },
      "kubernetes": { "zh": "Kubernetes" },
      "devops": { "zh": "开发运维" },
      "continuous integration": { "zh": "持续集成" },
      "continuous deployment": { "zh": "持续部署" },
      "version control": { "zh": "版本控制" },
      "git": { "zh": "Git" },
      "github": { "zh": "GitHub" },
      "open source": { "zh": "开源" }
    };

    // 技术术语字典 (中英)
    const zhEnDict: LocalDictionary = {
      "你好": { "en": "hello" },
      "世界": { "en": "world" },
      "计算机": { "en": "computer" },
      "人工智能": { "en": "artificial intelligence" },
      "机器学习": { "en": "machine learning" },
      "深度学习": { "en": "deep learning" },
      "神经网络": { "en": "neural network" },
      "数据库": { "en": "database" },
      "算法": { "en": "algorithm" },
      "编程": { "en": "programming" },
      "开发": { "en": "development" },
      "应用": { "en": "application" },
      "系统": { "en": "system" },
      "网络": { "en": "network" },
      "安全": { "en": "security" },
      "云计算": { "en": "cloud computing" },
      "大数据": { "en": "big data" },
      "区块链": { "en": "blockchain" },
      "用户界面": { "en": "user interface" },
      "用户体验": { "en": "user experience" },
      "响应式设计": { "en": "responsive design" },
      "前端": { "en": "frontend" },
      "后端": { "en": "backend" },
      "全栈": { "en": "full stack" },
      "框架": { "en": "framework" },
      "接口": { "en": "api" },
      "微服务": { "en": "microservices" },
      "容器": { "en": "container" },
      "开发运维": { "en": "devops" },
      "版本控制": { "en": "version control" },
      "开源": { "en": "open source" }
    };

    this.dictionaries.set('en-zh', enZhDict);
    this.dictionaries.set('zh-en', zhEnDict);
  }

  /**
   * 加载翻译规则
   */
  private async loadTranslationRules(): Promise<void> {
    this.rules = [
      // 英语复数规则
      {
        pattern: /(\w+)s$/i,
        replacement: '$1',
        languages: ['en']
      },
      // 英语过去式规则
      {
        pattern: /(\w+)ed$/i,
        replacement: '$1',
        languages: ['en']
      },
      // 英语进行时规则
      {
        pattern: /(\w+)ing$/i,
        replacement: '$1',
        languages: ['en']
      },
      // URL 保持不变
      {
        pattern: /https?:\/\/[^\s]+/gi,
        replacement: '$&',
        languages: ['*']
      },
      // 邮箱保持不变
      {
        pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi,
        replacement: '$&',
        languages: ['*']
      },
      // 数字保持不变
      {
        pattern: /\b\d+(\.\d+)?\b/g,
        replacement: '$&',
        languages: ['*']
      }
    ];
  }

  /**
   * 加载语言检测模式
   */
  private async loadLanguagePatterns(): Promise<void> {
    // 中文字符模式
    this.patterns.set('zh', [
      /[\u4e00-\u9fff]/g, // 中文汉字
      /[\u3000-\u303f]/g, // 中文标点
    ]);

    // 英文模式
    this.patterns.set('en', [
      /[a-zA-Z]/g,
      /\b(the|and|or|but|in|on|at|to|for|of|with|by)\b/gi
    ]);

    // 日文模式
    this.patterns.set('ja', [
      /[\u3040-\u309f]/g, // 平假名
      /[\u30a0-\u30ff]/g, // 片假名
      /[\u4e00-\u9fff]/g  // 汉字
    ]);

    // 韩文模式
    this.patterns.set('ko', [
      /[\uac00-\ud7af]/g, // 韩文字符
      /[\u1100-\u11ff]/g  // 韩文字母
    ]);
  }

  /**
   * 离线翻译
   */
  async translate(text: string, source: string, target: string): Promise<{
    translated: string;
    confidence: number;
    provider: string;
    fallback: boolean;
  }> {
    if (!this.initialized) {
      await this.initialize();
    }

    const availableProviders = this.providers.filter(p => p.available);

    for (const provider of availableProviders) {
      try {
        const translated = await provider.translate(text, source, target);
        if (translated && translated !== text) {
          return {
            translated,
            confidence: this.calculateConfidence(text, translated, provider.name),
            provider: provider.name,
            fallback: true
          };
        }
      } catch (error) {
        console.warn(`Provider ${provider.name} failed:`, error);
        continue;
      }
    }

    // 如果所有提供器都失败，返回原文
    return {
      translated: text,
      confidence: 0,
      provider: 'none',
      fallback: true
    };
  }

  /**
   * 字典翻译
   */
  private async dictionaryTranslate(text: string, source: string, target: string): Promise<string> {
    const dictKey = `${source}-${target}`;
    const dict = this.dictionaries.get(dictKey);
    
    if (!dict) {
      throw new Error(`Dictionary not found for ${dictKey}`);
    }

    const cleanText = text.toLowerCase().trim();
    
    // 精确匹配
    if (dict[cleanText] && dict[cleanText][target]) {
      return dict[cleanText][target];
    }

    // 分词翻译
    const words = cleanText.split(/\s+/);
    const translations: string[] = [];
    let hasTranslation = false;

    for (const word of words) {
      if (dict[word] && dict[word][target]) {
        translations.push(dict[word][target]);
        hasTranslation = true;
      } else {
        translations.push(word);
      }
    }

    if (hasTranslation) {
      return translations.join(' ');
    }

    throw new Error('No dictionary translation found');
  }

  /**
   * 规则翻译
   */
  private async ruleBasedTranslate(text: string, source: string, _target: string): Promise<string> {
    let translatedText = text;
    
    for (const rule of this.rules) {
      if (rule.languages.includes('*') || rule.languages.includes(source)) {
        translatedText = translatedText.replace(rule.pattern, rule.replacement);
      }
    }

    // 如果有变化，可能是有效的翻译
    if (translatedText !== text) {
      return translatedText;
    }

    throw new Error('No rule-based translation applied');
  }

  /**
   * 模式翻译
   */
  private async patternTranslate(text: string, source: string, target: string): Promise<string> {
    // 检查是否包含特定语言的字符
    const sourcePatterns = this.patterns.get(source);

    if (!sourcePatterns) {
      throw new Error(`No patterns found for source language: ${source}`);
    }

    // 计算源语言字符密度
    let sourceCharCount = 0;
    for (const pattern of sourcePatterns) {
      const matches = text.match(pattern);
      if (matches) {
        sourceCharCount += matches.length;
      }
    }

    const density = sourceCharCount / text.length;
    
    // 如果源语言字符密度低，可能不需要翻译
    if (density < 0.3) {
      throw new Error('Low source language character density');
    }

    // 简单的字符映射翻译 (仅作演示)
    if (source === 'en' && target === 'zh') {
      // 这里可以实现更复杂的模式匹配逻辑
      return text.replace(/\b(hello|hi)\b/gi, '你好')
                .replace(/\bworld\b/gi, '世界')
                .replace(/\bcomputer\b/gi, '计算机');
    }

    throw new Error('No pattern translation available');
  }

  /**
   * 机器学习翻译 (Web Workers)
   */
  private async mlTranslate(_text: string, _source: string, _target: string): Promise<string> {
    // TODO: 实现基于 Web Workers 的机器学习翻译
    // 可以加载 TensorFlow.js 模型进行本地翻译
    throw new Error('ML translation not implemented yet');
  }

  /**
   * 机器学习语言检测
   */
  private async mlDetect(_text: string): Promise<string> {
    // TODO: 实现基于机器学习的语言检测
    throw new Error('ML detection not implemented yet');
  }

  /**
   * 检测语言
   */
  async detectLanguage(text: string): Promise<string> {
    if (!this.initialized) {
      await this.initialize();
    }

    let maxScore = 0;
    let detectedLang = 'auto';

    for (const [lang, patterns] of this.patterns.entries()) {
      let score = 0;
      
      for (const pattern of patterns) {
        const matches = text.match(pattern);
        if (matches) {
          score += matches.length;
        }
      }

      const normalizedScore = score / text.length;
      
      if (normalizedScore > maxScore) {
        maxScore = normalizedScore;
        detectedLang = lang;
      }
    }

    return maxScore > 0.1 ? detectedLang : 'auto';
  }

  /**
   * 计算翻译置信度
   */
  private calculateConfidence(original: string, translated: string, provider: string): number {
    if (original === translated) return 0;

    let confidence = 0.5;

    // 根据提供器调整基础置信度
    switch (provider) {
      case 'dictionary':
        confidence = 0.9;
        break;
      case 'rules':
        confidence = 0.6;
        break;
      case 'pattern':
        confidence = 0.4;
        break;
      case 'ml-worker':
        confidence = 0.8;
        break;
    }

    // 根据长度差异调整置信度
    const lengthRatio = translated.length / original.length;
    if (lengthRatio < 0.5 || lengthRatio > 2.0) {
      confidence *= 0.8;
    }

    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * 添加自定义字典条目
   */
  async addDictionaryEntry(source: string, target: string, sourceText: string, targetText: string): Promise<void> {
    const dictKey = `${source}-${target}`;
    
    if (!this.dictionaries.has(dictKey)) {
      this.dictionaries.set(dictKey, {});
    }

    const dict = this.dictionaries.get(dictKey)!;
    
    if (!dict[sourceText]) {
      dict[sourceText] = {};
    }
    
    dict[sourceText][target] = targetText;

    // 保存到本地存储
    await this.saveDictionary(dictKey, dict);
  }

  /**
   * 保存字典到本地存储
   */
  private async saveDictionary(dictKey: string, dict: LocalDictionary): Promise<void> {
    try {
      chrome.storage.local.set({
        [`offline_dict_${dictKey}`]: dict
      });
    } catch (error) {
      console.warn('Failed to save dictionary:', error);
    }
  }

  /**
   * 获取支持的离线语言对
   */
  getSupportedLanguagePairs(): string[] {
    return Array.from(this.dictionaries.keys());
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      providers: this.providers.length,
      availableProviders: this.providers.filter(p => p.available).length,
      dictionaries: this.dictionaries.size,
      rules: this.rules.length,
      patterns: this.patterns.size,
      initialized: this.initialized
    };
  }
}

// 导出单例
export const offlineTranslationManager = new OfflineTranslationManager();
export default OfflineTranslationManager;
