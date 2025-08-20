/**
 * 个人翻译记忆系统 - 学习用户翻译偏好和建立个性化翻译记忆库
 */

interface TranslationMemoryEntry {
  id: string;
  source: string;
  target: string;
  sourceText: string;
  targetText: string;
  createdAt: number;
  lastUsed: number;
  useCount: number;
  confidence: number;
  context?: string;
  domain?: string;
  userRating?: number; // 1-5 星评级
  tags: string[];
}

interface UserPreference {
  userId: string;
  languagePairs: string[];
  domains: string[];
  style: 'formal' | 'casual' | 'technical' | 'creative';
  preferredModels: string[];
  customTerms: Map<string, string>;
  learningEnabled: boolean;
  lastSync: number;
}

interface DomainTemplate {
  domain: string;
  patterns: string[];
  terminology: Map<string, string>;
  style: string;
}

class PersonalTranslationMemory {
  private memoryDB: IDBDatabase | null = null;
  private userPreferences: UserPreference | null = null;
  private domainTemplates = new Map<string, DomainTemplate>();
  private initialized = false;
  
  private readonly DB_NAME = 'PersonalTranslationMemory';
  private readonly DB_VERSION = 1;
  private readonly MEMORY_STORE = 'translations';
  private readonly PREFERENCES_STORE = 'preferences';
  private readonly LEARNING_THRESHOLD = 0.7; // 学习阈值
  private readonly MAX_MEMORY_SIZE = 10000; // 最大记忆条目数

  /**
   * 初始化翻译记忆系统
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    await this.initializeDatabase();
    await this.loadUserPreferences();
    await this.initializeDomainTemplates();

    this.initialized = true;
    console.log('Personal Translation Memory initialized');
  }

  /**
   * 初始化数据库
   */
  private async initializeDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        this.memoryDB = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 创建翻译记忆存储
        if (!db.objectStoreNames.contains(this.MEMORY_STORE)) {
          const memoryStore = db.createObjectStore(this.MEMORY_STORE, { keyPath: 'id' });
          memoryStore.createIndex('sourceText', 'sourceText', { unique: false });
          memoryStore.createIndex('targetText', 'targetText', { unique: false });
          memoryStore.createIndex('languagePair', ['source', 'target'], { unique: false });
          memoryStore.createIndex('domain', 'domain', { unique: false });
          memoryStore.createIndex('lastUsed', 'lastUsed', { unique: false });
          memoryStore.createIndex('confidence', 'confidence', { unique: false });
        }

        // 创建用户偏好存储
        if (!db.objectStoreNames.contains(this.PREFERENCES_STORE)) {
          db.createObjectStore(this.PREFERENCES_STORE, { keyPath: 'userId' });
        }
      };
    });
  }

  /**
   * 加载用户偏好
   */
  private async loadUserPreferences(): Promise<void> {
    const userId = await this.getUserId();
    
    return new Promise((resolve, reject) => {
      if (!this.memoryDB) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.memoryDB.transaction([this.PREFERENCES_STORE], 'readonly');
      const store = transaction.objectStore(this.PREFERENCES_STORE);
      const request = store.get(userId);

      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        if (request.result) {
          this.userPreferences = request.result;
        } else {
          // 创建默认偏好
          this.userPreferences = {
            userId,
            languagePairs: ['en-zh', 'zh-en'],
            domains: ['general'],
            style: 'casual',
            preferredModels: ['qwen-turbo-latest'],
            customTerms: new Map(),
            learningEnabled: true,
            lastSync: Date.now()
          };
          this.saveUserPreferences();
        }
        resolve();
      };
    });
  }

  /**
   * 初始化领域模板
   */
  private async initializeDomainTemplates(): Promise<void> {
    // 技术领域
    this.domainTemplates.set('tech', {
      domain: 'tech',
      patterns: [
        'API', 'SDK', 'framework', 'library', 'database',
        'algorithm', 'programming', 'software', 'hardware',
        'cloud computing', 'artificial intelligence'
      ],
      terminology: new Map([
        ['API', 'API接口'],
        ['SDK', '软件开发套件'],
        ['framework', '框架'],
        ['library', '库'],
        ['database', '数据库'],
        ['algorithm', '算法'],
        ['programming', '编程'],
        ['software', '软件'],
        ['hardware', '硬件'],
        ['cloud computing', '云计算'],
        ['artificial intelligence', '人工智能']
      ]),
      style: 'technical'
    });

    // 商务领域
    this.domainTemplates.set('business', {
      domain: 'business',
      patterns: [
        'meeting', 'proposal', 'contract', 'revenue',
        'profit', 'investment', 'market', 'strategy',
        'management', 'leadership'
      ],
      terminology: new Map([
        ['meeting', '会议'],
        ['proposal', '提案'],
        ['contract', '合同'],
        ['revenue', '营收'],
        ['profit', '利润'],
        ['investment', '投资'],
        ['market', '市场'],
        ['strategy', '战略'],
        ['management', '管理'],
        ['leadership', '领导力']
      ]),
      style: 'formal'
    });

    // 学术领域
    this.domainTemplates.set('academic', {
      domain: 'academic',
      patterns: [
        'research', 'methodology', 'hypothesis', 'experiment',
        'analysis', 'conclusion', 'literature', 'theory',
        'empirical', 'statistical'
      ],
      terminology: new Map([
        ['research', '研究'],
        ['methodology', '方法论'],
        ['hypothesis', '假设'],
        ['experiment', '实验'],
        ['analysis', '分析'],
        ['conclusion', '结论'],
        ['literature', '文献'],
        ['theory', '理论'],
        ['empirical', '实证的'],
        ['statistical', '统计的']
      ]),
      style: 'formal'
    });
  }

  /**
   * 添加翻译记忆
   */
  async addMemory(
    sourceText: string,
    targetText: string,
    source: string,
    target: string,
    context?: string
  ): Promise<string> {
    if (!this.memoryDB) {
      throw new Error('Database not initialized');
    }

    const domain = await this.detectDomain(sourceText);
    const id = await this.generateId(sourceText, source, target);

    const entry: TranslationMemoryEntry = {
      id,
      source,
      target,
      sourceText: sourceText.trim(),
      targetText: targetText.trim(),
      createdAt: Date.now(),
      lastUsed: Date.now(),
      useCount: 1,
      confidence: 1.0,
      context,
      domain,
      tags: await this.extractTags(sourceText, targetText)
    };

    return new Promise((resolve, reject) => {
      const transaction = this.memoryDB!.transaction([this.MEMORY_STORE], 'readwrite');
      const store = transaction.objectStore(this.MEMORY_STORE);

      // 检查是否已存在
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        if (getRequest.result) {
          // 更新现有记录
          const existing = getRequest.result as TranslationMemoryEntry;
          existing.useCount++;
          existing.lastUsed = Date.now();
          existing.confidence = Math.min(1.0, existing.confidence + 0.1);
          
          store.put(existing);
        } else {
          // 添加新记录
          store.add(entry);
        }
        resolve(id);
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  /**
   * 搜索翻译记忆
   */
  async searchMemory(
    sourceText: string,
    source: string,
    target: string,
    options: {
      fuzzy?: boolean;
      contextWeight?: number;
      domainFilter?: string;
      minConfidence?: number;
      limit?: number;
    } = {}
  ): Promise<TranslationMemoryEntry[]> {
    if (!this.memoryDB) return [];

    const {
      fuzzy = true,
      contextWeight = 0.3,
      domainFilter,
      minConfidence = 0.5,
      limit = 10
    } = options;

    return new Promise((resolve, reject) => {
      const transaction = this.memoryDB!.transaction([this.MEMORY_STORE], 'readonly');
      const store = transaction.objectStore(this.MEMORY_STORE);
      const index = store.index('languagePair');
      const request = index.getAll([source, target]);

      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        let results = request.result as TranslationMemoryEntry[];

        // 过滤最小置信度
        results = results.filter(entry => entry.confidence >= minConfidence);

        // 领域过滤
        if (domainFilter) {
          results = results.filter(entry => entry.domain === domainFilter);
        }

        // 相似度计算和排序
        const scoredResults = results.map(entry => ({
          entry,
          score: this.calculateSimilarity(sourceText, entry.sourceText, fuzzy, contextWeight)
        }));

        // 排序并返回
        scoredResults.sort((a, b) => b.score - a.score);
        
        const finalResults = scoredResults
          .filter(item => item.score > 0.3) // 最小相似度阈值
          .slice(0, limit)
          .map(item => item.entry);

        resolve(finalResults);
      };
    });
  }

  /**
   * 学习用户偏好
   */
  async learnFromFeedback(
    translationId: string,
    rating: number,
    userCorrection?: string
  ): Promise<void> {
    if (!this.userPreferences?.learningEnabled) return;

    if (!this.memoryDB) {
      throw new Error('Database not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.memoryDB!.transaction([this.MEMORY_STORE], 'readwrite');
      const store = transaction.objectStore(this.MEMORY_STORE);
      const request = store.get(translationId);

      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const entry = request.result as TranslationMemoryEntry;
        if (!entry) {
          reject(new Error('Translation memory entry not found'));
          return;
        }

        // 更新评级
        entry.userRating = rating;
        entry.confidence = this.adjustConfidence(entry.confidence, rating);

        // 如果用户提供了修正
        if (userCorrection) {
          entry.targetText = userCorrection.trim();
          entry.confidence = Math.max(entry.confidence, 0.8);
        }

        // 学习用户偏好
        this.updateUserPreferences(entry, rating);

        store.put(entry).onsuccess = () => resolve();
      };
    });
  }

  /**
   * 获取个性化翻译建议
   */
  async getPersonalizedSuggestion(
    sourceText: string,
    source: string,
    target: string,
    context?: string
  ): Promise<{
    suggestion: string;
    confidence: number;
    source: 'memory' | 'preference' | 'domain';
    alternatives: string[];
  }> {
    // 1. 首先搜索翻译记忆
    const memoryResults = await this.searchMemory(sourceText, source, target, {
      fuzzy: true,
      contextWeight: context ? 0.4 : 0.2,
      limit: 5
    });

    if (memoryResults.length > 0) {
      const bestMatch = memoryResults[0];
      return {
        suggestion: bestMatch.targetText,
        confidence: bestMatch.confidence,
        source: 'memory',
        alternatives: memoryResults.slice(1, 4).map(entry => entry.targetText)
      };
    }

    // 2. 基于用户偏好生成建议
    const preferenceBasedSuggestion = await this.generatePreferenceBasedSuggestion(
      sourceText, source, target
    );

    if (preferenceBasedSuggestion) {
      return preferenceBasedSuggestion;
    }

    // 3. 基于领域模板生成建议
    const domainBasedSuggestion = await this.generateDomainBasedSuggestion(
      sourceText, source, target
    );

    return domainBasedSuggestion || {
      suggestion: sourceText,
      confidence: 0,
      source: 'domain',
      alternatives: []
    };
  }

  /**
   * 检测文本领域
   */
  private async detectDomain(text: string): Promise<string> {
    const lowerText = text.toLowerCase();
    let maxScore = 0;
    let detectedDomain = 'general';

    for (const [domain, template] of this.domainTemplates.entries()) {
      let score = 0;
      
      for (const pattern of template.patterns) {
        if (lowerText.includes(pattern.toLowerCase())) {
          score++;
        }
      }

      const normalizedScore = score / template.patterns.length;
      
      if (normalizedScore > maxScore) {
        maxScore = normalizedScore;
        detectedDomain = domain;
      }
    }

    return maxScore > 0.2 ? detectedDomain : 'general';
  }

  /**
   * 提取标签
   */
  private async extractTags(sourceText: string, targetText: string): Promise<string[]> {
    const tags = new Set<string>();

    // 从文本中提取关键词作为标签
    const words = [...sourceText.split(/\s+/), ...targetText.split(/\s+/)];
    
    words.forEach(word => {
      const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
      if (cleanWord.length > 2) {
        tags.add(cleanWord);
      }
    });

    return Array.from(tags).slice(0, 10); // 限制标签数量
  }

  /**
   * 计算文本相似度
   */
  private calculateSimilarity(
    text1: string,
    text2: string,
    fuzzy: boolean,
    contextWeight: number
  ): number {
    if (text1 === text2) return 1.0;

    // 基本字符串相似度
    let similarity = this.calculateLevenshteinSimilarity(text1, text2);

    // 模糊匹配增强
    if (fuzzy) {
      const words1 = new Set(text1.toLowerCase().split(/\s+/));
      const words2 = new Set(text2.toLowerCase().split(/\s+/));
      const intersection = new Set([...words1].filter(x => words2.has(x)));
      const union = new Set([...words1, ...words2]);
      
      const jaccardSimilarity = intersection.size / union.size;
      similarity = Math.max(similarity, jaccardSimilarity * 0.8);
    }

    // 上下文权重调整
    similarity = similarity * (1 - contextWeight) + similarity * contextWeight;

    return similarity;
  }

  /**
   * 计算 Levenshtein 相似度
   */
  private calculateLevenshteinSimilarity(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    
    if (len1 === 0) return len2 === 0 ? 1 : 0;
    if (len2 === 0) return 0;

    const matrix = Array(len2 + 1).fill(null).map(() => Array(len1 + 1).fill(null));

    for (let i = 0; i <= len1; i++) {
      matrix[0][i] = i;
    }

    for (let j = 0; j <= len2; j++) {
      matrix[j][0] = j;
    }

    for (let j = 1; j <= len2; j++) {
      for (let i = 1; i <= len1; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    const maxLength = Math.max(len1, len2);
    return (maxLength - matrix[len2][len1]) / maxLength;
  }

  /**
   * 调整置信度
   */
  private adjustConfidence(currentConfidence: number, rating: number): number {
    const adjustment = (rating - 3) * 0.1; // 3星为中性
    return Math.max(0, Math.min(1, currentConfidence + adjustment));
  }

  /**
   * 更新用户偏好
   */
  private updateUserPreferences(entry: TranslationMemoryEntry, rating: number): void {
    if (!this.userPreferences) return;

    // 更新领域偏好
    if (entry.domain && rating >= 4) {
      if (!this.userPreferences.domains.includes(entry.domain)) {
        this.userPreferences.domains.push(entry.domain);
      }
    }

    // 更新自定义术语
    if (rating >= 4 && entry.sourceText.split(' ').length <= 3) {
      this.userPreferences.customTerms.set(entry.sourceText, entry.targetText);
    }

    // 保存偏好
    this.saveUserPreferences();
  }

  /**
   * 基于偏好生成建议
   */
  private async generatePreferenceBasedSuggestion(
    sourceText: string,
    source: string,
    target: string
  ): Promise<{
    suggestion: string;
    confidence: number;
    source: 'preference';
    alternatives: string[];
  } | null> {
    if (!this.userPreferences) return null;

    // 检查自定义术语
    const customTranslation = this.userPreferences.customTerms.get(sourceText);
    if (customTranslation) {
      return {
        suggestion: customTranslation,
        confidence: 0.9,
        source: 'preference',
        alternatives: []
      };
    }

    return null;
  }

  /**
   * 基于领域生成建议
   */
  private async generateDomainBasedSuggestion(
    sourceText: string,
    source: string,
    target: string
  ): Promise<{
    suggestion: string;
    confidence: number;
    source: 'domain';
    alternatives: string[];
  } | null> {
    const domain = await this.detectDomain(sourceText);
    const template = this.domainTemplates.get(domain);

    if (!template) return null;

    // 检查领域术语
    const domainTranslation = template.terminology.get(sourceText.toLowerCase());
    if (domainTranslation) {
      return {
        suggestion: domainTranslation,
        confidence: 0.8,
        source: 'domain',
        alternatives: []
      };
    }

    return null;
  }

  /**
   * 生成ID
   */
  private async generateId(text: string, source: string, target: string): Promise<string> {
    const data = `${text}|${source}|${target}`;
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * 获取用户ID
   */
  private async getUserId(): Promise<string> {
    return new Promise(resolve => {
      chrome.storage.local.get(['userId'], (result) => {
        if (result.userId) {
          resolve(result.userId);
        } else {
          const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
          chrome.storage.local.set({ userId });
          resolve(userId);
        }
      });
    });
  }

  /**
   * 保存用户偏好
   */
  private async saveUserPreferences(): Promise<void> {
    if (!this.memoryDB || !this.userPreferences) return;

    return new Promise((resolve, reject) => {
      const transaction = this.memoryDB!.transaction([this.PREFERENCES_STORE], 'readwrite');
      const store = transaction.objectStore(this.PREFERENCES_STORE);
      
      // 转换 Map 为普通对象以便存储
      const preferencesToSave = {
        ...this.userPreferences!,
        customTerms: Array.from(this.userPreferences!.customTerms.entries()),
        lastSync: Date.now()
      };

      const request = store.put(preferencesToSave);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * 清理过期记忆
   */
  async cleanupExpiredMemories(): Promise<number> {
    if (!this.memoryDB) return 0;

    return new Promise((resolve, reject) => {
      const transaction = this.memoryDB!.transaction([this.MEMORY_STORE], 'readwrite');
      const store = transaction.objectStore(this.MEMORY_STORE);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const entries = request.result as TranslationMemoryEntry[];
        const cutoffTime = Date.now() - (365 * 24 * 60 * 60 * 1000); // 1年前
        let deletedCount = 0;

        // 删除超过1年且使用次数少于3次的记忆
        entries.forEach(entry => {
          if (entry.createdAt < cutoffTime && entry.useCount < 3) {
            store.delete(entry.id);
            deletedCount++;
          }
        });

        resolve(deletedCount);
      };
    });
  }

  /**
   * 导出翻译记忆
   */
  async exportMemory(): Promise<string> {
    if (!this.memoryDB) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.memoryDB!.transaction([this.MEMORY_STORE, this.PREFERENCES_STORE], 'readonly');
      const memoryStore = transaction.objectStore(this.MEMORY_STORE);
      const preferencesStore = transaction.objectStore(this.PREFERENCES_STORE);

      const memoryRequest = memoryStore.getAll();
      const preferencesRequest = preferencesStore.getAll();

      Promise.all([
        new Promise(resolve => { memoryRequest.onsuccess = () => resolve(memoryRequest.result); }),
        new Promise(resolve => { preferencesRequest.onsuccess = () => resolve(preferencesRequest.result); })
      ]).then(([memories, preferences]) => {
        const exportData = {
          version: 1,
          exportDate: new Date().toISOString(),
          memories,
          preferences
        };
        resolve(JSON.stringify(exportData, null, 2));
      }).catch(reject);
    });
  }

  /**
   * 获取统计信息
   */
  async getStats() {
    if (!this.memoryDB) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.memoryDB!.transaction([this.MEMORY_STORE], 'readonly');
      const store = transaction.objectStore(this.MEMORY_STORE);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const entries = request.result as TranslationMemoryEntry[];
        
        const stats = {
          totalEntries: entries.length,
          languagePairs: new Set(entries.map(e => `${e.source}-${e.target}`)).size,
          domains: new Set(entries.map(e => e.domain)).size,
          averageConfidence: entries.reduce((sum, e) => sum + e.confidence, 0) / entries.length,
          mostUsedEntry: entries.reduce((max, e) => e.useCount > max.useCount ? e : max, entries[0]),
          recentActivity: entries.filter(e => e.lastUsed > Date.now() - 7 * 24 * 60 * 60 * 1000).length
        };

        resolve(stats);
      };
    });
  }
}

// 导出单例
export const personalTranslationMemory = new PersonalTranslationMemory();
export default PersonalTranslationMemory;
