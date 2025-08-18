# 调试 "Extension context invalidated" 错误

## 问题分析

"Extension context invalidated" 错误通常由以下原因引起：

1. **Service Worker 重启**：Chrome 可能会因为内存压力或其他原因重启 Service Worker
2. **扩展重新加载**：开发过程中频繁重新加载扩展
3. **页面刷新**：页面刷新后扩展状态丢失
4. **浏览器重启**：浏览器重启后扩展需要重新初始化
5. **权限问题**：扩展权限被撤销或更改

## 已实施的解决方案

### 1. 增强的错误检测
```typescript
// 检查是否是扩展上下文失效错误
if (chrome.runtime.lastError.message?.includes('Extension context invalidated')) {
  resolve({
    ok: false,
    error: {
      code: 'EXTENSION_CONTEXT_INVALIDATED',
      message: '扩展上下文已失效，请刷新页面重试'
    }
  });
}
```

### 2. 自动状态检查
```typescript
// 检查chrome.runtime是否可用
if (!chrome.runtime || !chrome.runtime.sendMessage) {
  console.warn('Chrome runtime not available');
  return false;
}
```

### 3. 自动恢复机制
```typescript
// 如果遇到扩展上下文失效错误，尝试重新初始化
if (!result.ok && result.error?.code === 'EXTENSION_CONTEXT_INVALIDATED') {
  console.log('Extension context invalidated, attempting to reinitialize...');
  resetExtensionState();
  const reinitResult = await initializeExtension();
  if (reinitResult) {
    // 重新尝试翻译
    return await sendMessage('translate', payload);
  }
}
```

### 4. 页面生命周期监听
```typescript
// 监听页面可见性变化
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    resetExtensionState();
  }
});

// 页面加载完成后自动初始化
document.addEventListener('DOMContentLoaded', async () => {
  await initializeExtension();
});
```

## 调试步骤

### 步骤1: 检查扩展状态
1. 打开 `chrome://extensions/`
2. 找到 "Immersive Translate" 插件
3. 检查是否有错误信息
4. 点击 "检查视图" 查看 Service Worker 控制台

### 步骤2: 检查浏览器控制台
1. 打开网页的开发者工具 (F12)
2. 查看 Console 标签页
3. 寻找以下日志信息：
   - "Extension initialized successfully"
   - "Extension status check failed"
   - "Extension context invalidated"

### 步骤3: 测试扩展连接
1. 在浏览器控制台中运行：
```javascript
chrome.runtime.sendMessage({type: 'ping', payload: {}}, (response) => {
  console.log('Ping response:', response);
});
```

### 步骤4: 手动重置扩展
1. 在扩展管理页面点击刷新按钮 🔄
2. 刷新当前网页
3. 重新尝试翻译功能

## 常见解决方案

### 方案1: 重新加载扩展
```bash
# 在扩展管理页面
1. 点击刷新按钮 🔄
2. 刷新网页
3. 重新测试
```

### 方案2: 完全重新安装
```bash
# 完全移除并重新加载
1. 移除扩展
2. 清理浏览器缓存
3. 重新加载 dist 目录
4. 刷新网页
```

### 方案3: 检查后端服务
```bash
# 确保后端服务运行
cd ../wistrans-backend
python main.py

# 测试后端连接
curl http://localhost:8000/
```

## 预防措施

### 1. 开发环境优化
- 避免频繁重新加载扩展
- 使用 Chrome 的刷新按钮而不是完全移除
- 保持后端服务稳定运行

### 2. 用户指导
- 如果遇到错误，点击重试按钮
- 如果重试失败，刷新页面
- 如果问题持续，重新加载扩展

### 3. 监控和日志
- 定期检查扩展状态
- 监控错误日志
- 及时处理异常情况

## 技术细节

### Service Worker 生命周期
```typescript
// 安装事件
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

// 激活事件
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
```

### 消息传递机制
```typescript
// 发送消息
chrome.runtime.sendMessage({type: 'ping', payload: {}}, (response) => {
  if (chrome.runtime.lastError) {
    // 处理错误
  } else {
    // 处理响应
  }
});
```

### 状态管理
```typescript
// 扩展状态
let extensionInitialized = false;
let retryCount = 0;
const MAX_RETRY_COUNT = 3;

// 重置状态
function resetExtensionState() {
  extensionInitialized = false;
  retryCount = 0;
}
```

## 故障排除检查清单

- [ ] 扩展是否正常加载？
- [ ] Service Worker 是否运行？
- [ ] 后端服务是否可用？
- [ ] 网络连接是否正常？
- [ ] 浏览器控制台是否有错误？
- [ ] 扩展权限是否正确？
- [ ] 页面是否完全加载？

## 联系支持

如果问题仍然存在，请提供以下信息：
1. Chrome 浏览器版本
2. 扩展版本
3. 错误截图
4. 浏览器控制台日志
5. 重现步骤
