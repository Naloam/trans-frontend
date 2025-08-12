/**
 * IndexedDB Helper for Translation Cache
 * 轻量级 IndexedDB 封装，用于翻译结果缓存
 * 
 * 功能：
 * - 自动创建数据库和对象存储
 * - 支持 TTL 过期机制
 * - 提供简单的 CRUD 操作
 * - 自动清理过期数据
 */

// 类型定义
interface CacheEntry {
  hash: string;
  data: any;
  expireAt: number;
  createdAt: number;
}

interface DatabaseInfo {
  name: string;
  version: number;
  storeName: string;
}

class TranslationDB {
  private dbInfo: DatabaseInfo = {
    name: 'immersive-translate',
    version: 1,
    storeName: 'translations'
  };
  
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  /**
   * 初始化数据库连接
   */
  private async init(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbInfo.name, this.dbInfo.version);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB opened successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        console.log('Upgrading IndexedDB schema');

        // 创建对象存储
        if (!db.objectStoreNames.contains(this.dbInfo.storeName)) {
          const store = db.createObjectStore(this.dbInfo.storeName, { 
            keyPath: 'hash' 
          });
          
          // 创建索引
          store.createIndex('expireAt', 'expireAt', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
          
          console.log('Created object store and indexes');
        }
      };
    });

    return this.initPromise;
  }

  /**
   * 确保数据库已初始化
   */
  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    
    if (!this.db) {
      throw new Error('Failed to initialize database');
    }
    
    return this.db;
  }

  /**
   * 生成缓存键的哈希值
   */
  async generateHash(text: string, source: string, target: string, format: string = 'text'): Promise<string> {
    const data = `${text}|${source}|${target}|${format}`;
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * 获取缓存数据
   */
  async get(hash: string): Promise<any> {
    try {
      const db = await this.ensureDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.dbInfo.storeName], 'readonly');
        const store = transaction.objectStore(this.dbInfo.storeName);
        const request = store.get(hash);

        request.onerror = () => {
          console.error('Failed to get cache entry:', request.error);
          reject(request.error);
        };

        request.onsuccess = () => {
          const result = request.result as CacheEntry;
          
          if (!result) {
            resolve(null);
            return;
          }

          // 检查是否过期
          if (result.expireAt <= Date.now()) {
            console.log('Cache entry expired:', hash);
            // 异步删除过期条目
            this.delete(hash).catch(console.error);
            resolve(null);
            return;
          }

          console.log('Cache hit:', hash);
          resolve(result.data);
        };
      });
    } catch (error) {
      console.error('Error getting cache entry:', error);
      return null;
    }
  }

  /**
   * 设置缓存数据
   */
  async set(hash: string, data: any, ttlSeconds: number = 3600): Promise<void> {
    try {
      const db = await this.ensureDB();
      const now = Date.now();
      
      const entry: CacheEntry = {
        hash,
        data,
        expireAt: now + (ttlSeconds * 1000),
        createdAt: now
      };

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.dbInfo.storeName], 'readwrite');
        const store = transaction.objectStore(this.dbInfo.storeName);
        const request = store.put(entry);

        request.onerror = () => {
          console.error('Failed to set cache entry:', request.error);
          reject(request.error);
        };

        request.onsuccess = () => {
          console.log('Cache entry saved:', hash);
          resolve();
        };
      });
    } catch (error) {
      console.error('Error setting cache entry:', error);
      throw error;
    }
  }

  /**
   * 删除缓存数据
   */
  async delete(hash: string): Promise<void> {
    try {
      const db = await this.ensureDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.dbInfo.storeName], 'readwrite');
        const store = transaction.objectStore(this.dbInfo.storeName);
        const request = store.delete(hash);

        request.onerror = () => {
          console.error('Failed to delete cache entry:', request.error);
          reject(request.error);
        };

        request.onsuccess = () => {
          console.log('Cache entry deleted:', hash);
          resolve();
        };
      });
    } catch (error) {
      console.error('Error deleting cache entry:', error);
      throw error;
    }
  }

  /**
   * 清理所有过期的缓存条目
   */
  async clearExpired(): Promise<number> {
    try {
      const db = await this.ensureDB();
      const now = Date.now();
      let deletedCount = 0;

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.dbInfo.storeName], 'readwrite');
        const store = transaction.objectStore(this.dbInfo.storeName);
        const index = store.index('expireAt');
        
        // 获取所有过期的条目
        const range = IDBKeyRange.upperBound(now);
        const request = index.openCursor(range);

        request.onerror = () => {
          console.error('Failed to clear expired entries:', request.error);
          reject(request.error);
        };

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          
          if (cursor) {
            cursor.delete();
            deletedCount++;
            cursor.continue();
          } else {
            console.log(`Cleared ${deletedCount} expired cache entries`);
            resolve(deletedCount);
          }
        };
      });
    } catch (error) {
      console.error('Error clearing expired entries:', error);
      return 0;
    }
  }

  /**
   * 清空所有缓存数据
   */
  async clear(): Promise<void> {
    try {
      const db = await this.ensureDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.dbInfo.storeName], 'readwrite');
        const store = transaction.objectStore(this.dbInfo.storeName);
        const request = store.clear();

        request.onerror = () => {
          console.error('Failed to clear cache:', request.error);
          reject(request.error);
        };

        request.onsuccess = () => {
          console.log('All cache entries cleared');
          resolve();
        };
      });
    } catch (error) {
      console.error('Error clearing cache:', error);
      throw error;
    }
  }

  /**
   * 获取缓存统计信息
   */
  async getStats(): Promise<{ count: number; size: number; oldestEntry?: number; newestEntry?: number }> {
    try {
      const db = await this.ensureDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.dbInfo.storeName], 'readonly');
        const store = transaction.objectStore(this.dbInfo.storeName);
        const request = store.getAll();

        request.onerror = () => {
          console.error('Failed to get cache stats:', request.error);
          reject(request.error);
        };

        request.onsuccess = () => {
          const entries = request.result as CacheEntry[];
          
          let totalSize = 0;
          let oldestEntry: number | undefined;
          let newestEntry: number | undefined;

          entries.forEach(entry => {
            // 估算条目大小（简单实现）
            totalSize += JSON.stringify(entry).length * 2; // UTF-16 字符占用2字节
            
            if (!oldestEntry || entry.createdAt < oldestEntry) {
              oldestEntry = entry.createdAt;
            }
            
            if (!newestEntry || entry.createdAt > newestEntry) {
              newestEntry = entry.createdAt;
            }
          });

          resolve({
            count: entries.length,
            size: totalSize,
            oldestEntry,
            newestEntry
          });
        };
      });
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return { count: 0, size: 0 };
    }
  }

  /**
   * 关闭数据库连接
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initPromise = null;
      console.log('Database connection closed');
    }
  }
}

// 创建全局实例
const translationDB = new TranslationDB();

// 导出便捷函数
export const db = {
  /**
   * 生成缓存键
   */
  generateHash: (text: string, source: string, target: string, format?: string) => 
    translationDB.generateHash(text, source, target, format),

  /**
   * 获取缓存数据
   */
  get: (hash: string) => translationDB.get(hash),

  /**
   * 设置缓存数据
   */
  set: (hash: string, data: any, ttlSeconds?: number) => 
    translationDB.set(hash, data, ttlSeconds),

  /**
   * 删除缓存数据
   */
  delete: (hash: string) => translationDB.delete(hash),

  /**
   * 清理过期数据
   */
  clearExpired: () => translationDB.clearExpired(),

  /**
   * 清空所有数据
   */
  clear: () => translationDB.clear(),

  /**
   * 获取统计信息
   */
  getStats: () => translationDB.getStats(),

  /**
   * 关闭数据库连接
   */
  close: () => translationDB.close()
};

export default translationDB;