/**
 * 移动端同步服务
 * 处理插件与移动端APP的数据同步
 */

interface SyncData {
  translations: TranslationRecord[];
  vocabularyWords: VocabularyWord[];
  learningProgress: LearningProgress;
  userPreferences: UserPreferences;
}

interface TranslationRecord {
  id: string;
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  context?: string;
  url?: string;
  timestamp: number;
  confidence: number;
  source: 'extension' | 'mobile';
}

interface VocabularyWord {
  id: string;
  word: string;
  translation: string;
  phonetic?: string;
  definition: string;
  examples: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  mastery: number; // 0-1, 掌握程度
  reviewCount: number;
  lastReviewTime: number;
  addedTime: number;
  tags: string[];
  source: 'extension' | 'mobile';
}

interface LearningProgress {
  userId: string;
  totalTranslations: number;
  totalWords: number;
  dailyGoal: number;
  streakDays: number;
  lastActiveTime: number;
  weakWords: string[]; // 需要加强练习的单词
  strengths: string[]; // 掌握较好的领域
}

interface UserPreferences {
  primaryLanguage: string;
  targetLanguages: string[];
  learningMode: 'casual' | 'intensive' | 'exam-prep';
  notificationEnabled: boolean;
  syncEnabled: boolean;
  offlineMode: boolean;
}

class MobileSyncService {
  private readonly SYNC_API_BASE = import.meta.env.BACKEND_URL || 'http://localhost:8000';
  private readonly SYNC_ENDPOINTS = {
    translations: '/sync/translations',
    vocabulary: '/sync/vocabulary', 
    progress: '/sync/progress',
    preferences: '/sync/preferences'
  };

  private syncQueue: SyncData[] = [];
  private isOnline: boolean = navigator.onLine;
  private userId: string = '';

  constructor() {
    this.initializeSync();
    this.setupEventListeners();
  }

  private async initializeSync(): Promise<void> {
    try {
      // 获取用户ID和配置
      const config = await chrome.storage.sync.get(['userId', 'syncEnabled']);
      this.userId = config.userId || await this.generateUserId();
      
      if (config.syncEnabled !== false) {
        await this.performInitialSync();
      }
    } catch (error) {
      console.error('同步初始化失败:', error);
    }
  }

  private setupEventListeners(): void {
    // 监听网络状态变化
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processSyncQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // 监听存储变化，自动同步
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'local' && (changes.translations || changes.vocabulary)) {
        this.queueForSync();
      }
    });
  }

  /**
   * 添加翻译记录
   */
  async addTranslationRecord(record: Omit<TranslationRecord, 'id' | 'timestamp' | 'source'>): Promise<void> {
    const fullRecord: TranslationRecord = {
      ...record,
      id: this.generateId(),
      timestamp: Date.now(),
      source: 'extension'
    };

    // 保存到本地存储
    const stored = await chrome.storage.local.get('translations') || { translations: [] };
    stored.translations.push(fullRecord);
    await chrome.storage.local.set({ translations: stored.translations });

    // 队列同步
    this.queueForSync();

    console.log('翻译记录已添加:', fullRecord.originalText);
  }

  /**
   * 添加生词
   */
  async addVocabularyWord(wordData: Omit<VocabularyWord, 'id' | 'addedTime' | 'reviewCount' | 'lastReviewTime' | 'mastery' | 'source'>): Promise<void> {
    const word: VocabularyWord = {
      ...wordData,
      id: this.generateId(),
      addedTime: Date.now(),
      reviewCount: 0,
      lastReviewTime: 0,
      mastery: 0,
      source: 'extension'
    };

    // 检查是否已存在
    const stored = await chrome.storage.local.get('vocabulary') || { vocabulary: [] };
    const existing = stored.vocabulary.find((w: VocabularyWord) => w.word === word.word);
    
    if (existing) {
      // 更新现有单词信息
      existing.examples = [...new Set([...existing.examples, ...word.examples])];
      existing.tags = [...new Set([...existing.tags, ...word.tags])];
    } else {
      stored.vocabulary.push(word);
    }

    await chrome.storage.local.set({ vocabulary: stored.vocabulary });
    this.queueForSync();

    console.log('生词已添加:', word.word);
  }

  /**
   * 更新学习进度
   */
  async updateLearningProgress(updates: Partial<LearningProgress>): Promise<void> {
    const stored = await chrome.storage.local.get('learningProgress') || {};
    const progress: LearningProgress = {
      userId: this.userId,
      totalTranslations: 0,
      totalWords: 0,
      dailyGoal: 10,
      streakDays: 0,
      lastActiveTime: Date.now(),
      weakWords: [],
      strengths: [],
      ...stored.learningProgress,
      ...updates
    };

    await chrome.storage.local.set({ learningProgress: progress });
    this.queueForSync();
  }

  /**
   * 队列同步数据
   */
  private async queueForSync(): Promise<void> {
    if (!this.isOnline) return;

    try {
      const data = await this.collectSyncData();
      this.syncQueue.push(data);
      
      // 立即处理队列（防抖）
      setTimeout(() => this.processSyncQueue(), 1000);
    } catch (error) {
      console.error('数据收集失败:', error);
    }
  }

  /**
   * 收集需要同步的数据
   */
  private async collectSyncData(): Promise<SyncData> {
    const [translations, vocabulary, progress, preferences] = await Promise.all([
      chrome.storage.local.get('translations'),
      chrome.storage.local.get('vocabulary'), 
      chrome.storage.local.get('learningProgress'),
      chrome.storage.sync.get(['primaryLanguage', 'targetLanguages', 'learningMode', 'syncEnabled'])
    ]);

    return {
      translations: translations.translations || [],
      vocabularyWords: vocabulary.vocabulary || [],
      learningProgress: progress.learningProgress || {
        userId: this.userId,
        totalTranslations: 0,
        totalWords: 0,
        dailyGoal: 10,
        streakDays: 0,
        lastActiveTime: Date.now(),
        weakWords: [],
        strengths: []
      },
      userPreferences: {
        primaryLanguage: preferences.primaryLanguage || 'zh',
        targetLanguages: preferences.targetLanguages || ['en'],
        learningMode: preferences.learningMode || 'casual',
        notificationEnabled: true,
        syncEnabled: preferences.syncEnabled !== false,
        offlineMode: false
      }
    };
  }

  /**
   * 处理同步队列
   */
  private async processSyncQueue(): Promise<void> {
    if (!this.isOnline || this.syncQueue.length === 0) return;

    const data = this.syncQueue.shift();
    if (!data) return;

    try {
      await Promise.all([
        this.syncTranslations(data.translations),
        this.syncVocabulary(data.vocabularyWords),
        this.syncProgress(data.learningProgress),
        this.syncPreferences(data.userPreferences)
      ]);

      console.log('数据同步成功');
    } catch (error) {
      console.error('数据同步失败:', error);
      // 重新加入队列
      this.syncQueue.unshift(data);
    }
  }

  /**
   * 同步翻译记录到移动端
   */
  private async syncTranslations(translations: TranslationRecord[]): Promise<void> {
    if (translations.length === 0) return;

    const response = await fetch(`${this.SYNC_API_BASE}${this.SYNC_ENDPOINTS.translations}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-ID': this.userId
      },
      body: JSON.stringify({ translations })
    });

    if (!response.ok) {
      throw new Error(`翻译记录同步失败: ${response.status}`);
    }
  }

  /**
   * 同步生词本到移动端
   */
  private async syncVocabulary(vocabulary: VocabularyWord[]): Promise<void> {
    if (vocabulary.length === 0) return;

    const response = await fetch(`${this.SYNC_API_BASE}${this.SYNC_ENDPOINTS.vocabulary}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-ID': this.userId
      },
      body: JSON.stringify({ vocabulary })
    });

    if (!response.ok) {
      throw new Error(`生词本同步失败: ${response.status}`);
    }
  }

  /**
   * 同步学习进度
   */
  private async syncProgress(progress: LearningProgress): Promise<void> {
    const response = await fetch(`${this.SYNC_API_BASE}${this.SYNC_ENDPOINTS.progress}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-ID': this.userId
      },
      body: JSON.stringify(progress)
    });

    if (!response.ok) {
      throw new Error(`学习进度同步失败: ${response.status}`);
    }
  }

  /**
   * 同步用户偏好
   */
  private async syncPreferences(preferences: UserPreferences): Promise<void> {
    const response = await fetch(`${this.SYNC_API_BASE}${this.SYNC_ENDPOINTS.preferences}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-ID': this.userId
      },
      body: JSON.stringify(preferences)
    });

    if (!response.ok) {
      throw new Error(`用户偏好同步失败: ${response.status}`);
    }
  }

  /**
   * 执行初始同步
   */
  private async performInitialSync(): Promise<void> {
    try {
      // 从移动端获取数据
      const response = await fetch(`${this.SYNC_API_BASE}/sync/download`, {
        headers: { 'User-ID': this.userId }
      });

      if (response.ok) {
        const mobileData = await response.json();
        await this.mergeMobileData(mobileData);
      }
    } catch (error) {
      console.error('初始同步失败:', error);
    }
  }

  /**
   * 合并移动端数据
   */
  private async mergeMobileData(mobileData: SyncData): Promise<void> {
    // 合并翻译记录（去重）
    const localTranslations = (await chrome.storage.local.get('translations')).translations || [];
    const mergedTranslations = this.mergeArrays(localTranslations, mobileData.translations, 'id');
    await chrome.storage.local.set({ translations: mergedTranslations });

    // 合并生词本（去重）
    const localVocabulary = (await chrome.storage.local.get('vocabulary')).vocabulary || [];
    const mergedVocabulary = this.mergeArrays(localVocabulary, mobileData.vocabularyWords, 'word');
    await chrome.storage.local.set({ vocabulary: mergedVocabulary });

    // 更新学习进度
    await chrome.storage.local.set({ learningProgress: mobileData.learningProgress });

    console.log('移动端数据合并完成');
  }

  /**
   * 合并数组（去重）
   */
  private mergeArrays<T>(local: T[], remote: T[], key: keyof T): T[] {
    const merged = [...local];
    const localKeys = new Set(local.map(item => item[key]));
    
    remote.forEach(item => {
      if (!localKeys.has(item[key])) {
        merged.push(item);
      }
    });

    return merged;
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * 生成用户ID
   */
  private async generateUserId(): Promise<string> {
    const userId = 'user_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    await chrome.storage.sync.set({ userId });
    return userId;
  }

  /**
   * 获取同步统计
   */
  async getSyncStats(): Promise<{
    totalTranslations: number;
    totalWords: number;
    lastSync: number;
    syncEnabled: boolean;
  }> {
    const [translations, vocabulary, config] = await Promise.all([
      chrome.storage.local.get('translations'),
      chrome.storage.local.get('vocabulary'),
      chrome.storage.sync.get(['syncEnabled', 'lastSync'])
    ]);

    return {
      totalTranslations: (translations.translations || []).length,
      totalWords: (vocabulary.vocabulary || []).length,
      lastSync: config.lastSync || 0,
      syncEnabled: config.syncEnabled !== false
    };
  }

  /**
   * 启用/禁用同步
   */
  async toggleSync(enabled: boolean): Promise<void> {
    await chrome.storage.sync.set({ syncEnabled: enabled });
    
    if (enabled) {
      await this.performInitialSync();
    }
  }
}

// 全局实例
const mobileSyncService = new MobileSyncService();

export { MobileSyncService, mobileSyncService };
export type { TranslationRecord, VocabularyWord, LearningProgress, UserPreferences };
