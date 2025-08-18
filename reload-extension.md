# Chrome插件重新加载指南

## 问题解决步骤

### 1. 完全移除插件
1. 打开Chrome浏览器
2. 进入 `chrome://extensions/`
3. 找到 "Immersive Translate" 插件
4. 点击 "移除" 按钮完全删除插件

### 2. 清理浏览器缓存
1. 按 `Ctrl+Shift+Delete` (Windows) 或 `Cmd+Shift+Delete` (Mac)
2. 选择 "高级" 标签
3. 勾选 "缓存的图片和文件"
4. 点击 "清除数据"

### 3. 重新加载插件
1. 在 `chrome://extensions/` 页面
2. 开启 "开发者模式"
3. 点击 "加载已解压的扩展程序"
4. 选择 `trans-frontend/dist` 目录

## 修复的问题

### 1. ServiceWorker错误
- 添加了service worker的激活和安装事件处理
- 确保旧的service worker被正确清理
- 添加了context menus的清理机制

### 2. URL模式错误
- 修复了 `targetUrlPatterns` 中的无效通配符模式
- 将 `*.pdf` 改为 `*://*/*.pdf` 等有效格式

## 验证修复
重新加载后，检查Chrome开发者工具的控制台，应该不再出现以下错误：
- "Failed to unregister a ServiceWorkerRegistration"
- "Invalid url pattern '*.pdf'"

如果仍有问题，请检查：
1. 插件版本是否正确更新
2. 是否有其他插件冲突
3. Chrome浏览器版本是否支持Manifest V3



