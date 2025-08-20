/**
 * 高级请求管理器 - 实现请求去重、批量处理、智能重试
 */

interface BatchRequest {
  id: string;
  text: string;
  source: string;
  target: string;
  format?: 'text' | 'html';
  priority?: number;
  context?: string;
  resolve: (result: any) => void;
  reject: (error: any) => void;
  timestamp: number;
}

interface RequestBatch {
  requests: BatchRequest[];
  timer: number;
  executing: boolean;
}

interface ContextGroup {
  context: string;
  requests: BatchRequest[];
  lastActivity: number;
}

class RequestManager {
  private pendingRequests = new Map<string, BatchRequest[]>(); // 去重Map
  private batchQueue = new Map<string, RequestBatch>(); // 批量队列
  private contextGroups = new Map<string, ContextGroup>(); // 上下文分组
  private executingRequests = new Set<string>(); // 执行中的请求
  
  private readonly BATCH_SIZE = 5; // 批量大小
  private readonly BATCH_DELAY = 100; // 批量延迟(ms)
  private readonly DEDUP_TTL = 30000; // 去重TTL(ms)
  private readonly CONTEXT_TTL = 60000; // 上下文TTL(ms)
  private readonly MAX_RETRIES = 3; // 最大重试次数
  
  /**
   * 添加翻译请求（自动去重和批量处理）
   */
  async addRequest(request: Omit<BatchRequest, 'resolve' | 'reject' | 'timestamp'>): Promise<any> {
    return new Promise((resolve, reject) => {
      const requestKey = this.generateRequestKey(request);
      const batchRequest: BatchRequest = {
        ...request,
        resolve,
        reject,
        timestamp: Date.now(),
        priority: request.priority || 1
      };

      // 检查请求去重
      const duplicate = this.checkDuplicate(requestKey);
      if (duplicate) {
        duplicate.push(batchRequest);
        return;
      }

      // 新请求加入去重Map
      this.pendingRequests.set(requestKey, [batchRequest]);

      // 加入批量队列
      this.addToBatch(batchRequest);

      // 处理上下文分组
      if (request.context) {
        this.addToContextGroup(batchRequest);
      }
    });
  }

  /**
   * 生成请求唯一键
   */
  private generateRequestKey(request: Pick<BatchRequest, 'text' | 'source' | 'target' | 'format'>): string {
    return `${request.text}|${request.source}|${request.target}|${request.format || 'text'}`;
  }

  /**
   * 检查重复请求
   */
  private checkDuplicate(requestKey: string): BatchRequest[] | null {
    const existing = this.pendingRequests.get(requestKey);
    if (existing && existing.length > 0) {
      const firstRequest = existing[0];
      if (Date.now() - firstRequest.timestamp < this.DEDUP_TTL) {
        return existing;
      } else {
        // 过期的请求，清理
        this.pendingRequests.delete(requestKey);
      }
    }
    return null;
  }

  /**
   * 添加到批量队列
   */
  private addToBatch(request: BatchRequest): void {
    const batchKey = `${request.source}|${request.target}`;
    
    if (!this.batchQueue.has(batchKey)) {
      this.batchQueue.set(batchKey, {
        requests: [],
        timer: 0,
        executing: false
      });
    }

    const batch = this.batchQueue.get(batchKey)!;
    batch.requests.push(request);

    // 清除现有定时器
    if (batch.timer) {
      clearTimeout(batch.timer);
    }

    // 如果达到批量大小，立即执行
    if (batch.requests.length >= this.BATCH_SIZE) {
      this.executeBatch(batchKey);
    } else {
      // 否则设置延迟执行
      batch.timer = window.setTimeout(() => {
        this.executeBatch(batchKey);
      }, this.BATCH_DELAY);
    }
  }

  /**
   * 添加到上下文分组
   */
  private addToContextGroup(request: BatchRequest): void {
    if (!request.context) return;

    const context = request.context;
    if (!this.contextGroups.has(context)) {
      this.contextGroups.set(context, {
        context,
        requests: [],
        lastActivity: Date.now()
      });
    }

    const group = this.contextGroups.get(context)!;
    group.requests.push(request);
    group.lastActivity = Date.now();

    // 清理过期的上下文组
    this.cleanupContextGroups();
  }

  /**
   * 执行批量请求
   */
  private async executeBatch(batchKey: string): Promise<void> {
    const batch = this.batchQueue.get(batchKey);
    if (!batch || batch.executing || batch.requests.length === 0) {
      return;
    }

    batch.executing = true;
    clearTimeout(batch.timer);

    try {
      const requests = batch.requests.splice(0, this.BATCH_SIZE);
      
      // 按优先级排序
      requests.sort((a, b) => (b.priority || 1) - (a.priority || 1));

      // 构建批量请求
      const batchRequest = this.buildBatchRequest(requests);
      
      // 发送请求
      const results = await this.sendBatchRequest(batchRequest);
      
      // 处理结果
      this.handleBatchResults(requests, results);

    } catch (error) {
      // 处理错误
      this.handleBatchError(batch.requests, error);
    } finally {
      batch.executing = false;
      
      // 如果还有请求，继续处理
      if (batch.requests.length > 0) {
        this.addToBatch(batch.requests[0]);
      } else {
        this.batchQueue.delete(batchKey);
      }
    }
  }

  /**
   * 构建批量请求
   */
  private buildBatchRequest(requests: BatchRequest[]): any {
    const [firstRequest] = requests;
    
    return {
      target: firstRequest.target === 'zh' ? '中文' : 'English',
      segments: requests.map(req => ({
        id: req.id,
        text: req.text,
        model: "qwen-turbo-latest"
      })),
      user_id: null,
      extra_args: {
        batch_size: requests.length,
        context_aware: this.hasContextualRequests(requests)
      }
    };
  }

  /**
   * 检查是否有上下文相关请求
   */
  private hasContextualRequests(requests: BatchRequest[]): boolean {
    return requests.some(req => req.context);
  }

  /**
   * 发送批量请求（带智能重试）
   */
  private async sendBatchRequest(batchRequest: any, retryCount = 0): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时

    try {
      const backendUrl = import.meta.env.BACKEND_URL || 'http://localhost:8000';
      
      const response = await fetch(`${backendUrl}/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batchRequest),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();

    } catch (error: any) {
      clearTimeout(timeoutId);

      // 智能重试逻辑
      if (retryCount < this.MAX_RETRIES) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 5000); // 指数退避
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.sendBatchRequest(batchRequest, retryCount + 1);
      }

      throw error;
    }
  }

  /**
   * 处理批量结果
   */
  private handleBatchResults(requests: BatchRequest[], results: any): void {
    const segments = results.segments || [];
    
    requests.forEach(request => {
      const requestKey = this.generateRequestKey(request);
      const duplicates = this.pendingRequests.get(requestKey) || [request];
      
      // 查找对应的结果
      const segment = segments.find((s: any) => s.id === request.id);
      
      if (segment) {
        const result = {
          ok: true,
          data: {
            translatedText: segment.text,
            detectedLanguage: results.translated,
            alternatives: segment.alternatives || []
          }
        };

        // 发送结果给所有重复请求
        duplicates.forEach(dup => dup.resolve(result));
      } else {
        const error = {
          ok: false,
          error: {
            code: 'SEGMENT_NOT_FOUND',
            message: '未找到对应的翻译结果'
          }
        };
        
        duplicates.forEach(dup => dup.reject(error));
      }

      // 清理去重记录
      this.pendingRequests.delete(requestKey);
    });
  }

  /**
   * 处理批量错误
   */
  private handleBatchError(requests: BatchRequest[], error: any): void {
    requests.forEach(request => {
      const requestKey = this.generateRequestKey(request);
      const duplicates = this.pendingRequests.get(requestKey) || [request];
      
      const errorResult = {
        ok: false,
        error: {
          code: 'BATCH_REQUEST_FAILED',
          message: error.message || '批量请求失败'
        }
      };

      duplicates.forEach(dup => dup.reject(errorResult));
      this.pendingRequests.delete(requestKey);
    });
  }

  /**
   * 清理过期的上下文组
   */
  private cleanupContextGroups(): void {
    const now = Date.now();
    
    for (const [context, group] of this.contextGroups.entries()) {
      if (now - group.lastActivity > this.CONTEXT_TTL) {
        this.contextGroups.delete(context);
      }
    }
  }

  /**
   * 获取上下文相关的翻译历史
   */
  getContextHistory(context: string): BatchRequest[] {
    const group = this.contextGroups.get(context);
    return group ? group.requests.slice() : [];
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      pendingRequests: this.pendingRequests.size,
      batchQueues: this.batchQueue.size,
      contextGroups: this.contextGroups.size,
      executingRequests: this.executingRequests.size
    };
  }
}

// 导出单例
export const requestManager = new RequestManager();
export default RequestManager;
