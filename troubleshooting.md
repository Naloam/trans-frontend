# Chrome插件故障排除指南

## 当前错误
1. `Uncaught (in promise) AbortError: Failed to unregister a ServiceWorkerRegistration: Worker disallowed`
2. `Unchecked runtime.lastError: Invalid url pattern '*.pdf'`

## 彻底解决方案

### 步骤1: 完全清理插件
```bash
# 1. 在Chrome中完全移除插件
# 打开 chrome://extensions/
# 找到 "Immersive Translate" 并点击 "移除"

# 2. 清理Chrome缓存
# 按 Cmd+Shift+Delete (Mac) 或 Ctrl+Shift+Delete (Windows)
# 选择 "高级" -> 勾选所有选项 -> "清除数据"

# 3. 重启Chrome浏览器
```

### 步骤2: 检查文件权限
```bash
# 确保dist目录有正确的权限
chmod -R 755 trans-frontend/dist/
```

### 步骤3: 重新加载插件
1. 打开 `chrome://extensions/`
2. 开启 "开发者模式"
3. 点击 "加载已解压的扩展程序"
4. 选择 `trans-frontend/dist` 目录

## 修复内容

### 1. URL模式修复
- ❌ 错误: `"*.pdf"` (无效的通配符)
- ✅ 正确: `"*://*/*.pdf"` (有效的URL模式)

### 2. ServiceWorker生命周期管理
- 添加了 `install` 事件处理
- 添加了 `activate` 事件处理
- 添加了错误处理机制
- 添加了缓存清理逻辑

### 3. Context Menus管理
- 添加了清理现有menus的逻辑
- 改进了错误处理
- 添加了详细的日志记录

## 验证修复

### 检查控制台
重新加载后，在Chrome开发者工具中应该看到：
```
Service Worker installing...
Service Worker activating...
Existing context menus removed
Context menus created successfully
Service Worker loaded
```

### 检查错误页面
访问 `chrome://extensions/` 并点击插件的 "错误" 按钮，应该显示：
- 没有错误信息
- 或者显示 "Nothing to see here, move along."

## 如果问题仍然存在

### 1. 检查Chrome版本
确保Chrome版本 >= 88 (支持Manifest V3)

### 2. 检查其他插件冲突
- 暂时禁用其他翻译插件
- 检查是否有其他插件使用相同的权限

### 3. 检查文件完整性
```bash
# 验证manifest.json语法
cat trans-frontend/dist/manifest.json | python -m json.tool

# 检查service worker文件
ls -la trans-frontend/dist/src/worker/serviceWorker.js
```

### 4. 使用Chrome的扩展调试工具
1. 打开 `chrome://extensions/`
2. 找到插件并点击 "检查视图"
3. 查看控制台输出

## 常见问题

### Q: 为什么会出现ServiceWorker错误？
A: 这通常发生在插件更新或重新加载时，旧的service worker没有被正确清理。

### Q: 为什么URL模式会报错？
A: Chrome扩展的Manifest V3对URL模式有严格要求，`*.pdf` 这种通配符模式是无效的。

### Q: 如何避免这些错误？
A: 
1. 总是完全移除插件后再重新加载
2. 使用正确的URL模式格式
3. 实现proper的ServiceWorker生命周期管理
