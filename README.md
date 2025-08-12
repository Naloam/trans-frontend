# 沉浸式翻译扩展

一个功能强大的Chrome浏览器翻译扩展，支持选中文本即时翻译和沉浸式翻译模式。

## 功能特性

- 🎯 **选中即翻译**：选中页面文本即可显示翻译气泡
- 🌐 **多语言支持**：支持中文、英文、日文、韩文等多种语言
- 🎨 **沉浸式模式**：全屏翻译界面，支持逐句对比
- ⚙️ **丰富设置**：自定义翻译服务、主题、快捷键等
- 🔒 **隐私保护**：本地缓存，减少网络请求
- ♿ **无障碍支持**：完整的键盘导航和屏幕阅读器支持

## 最近修复的问题

### ✅ 翻译框无法关闭
- 添加了明确的关闭按钮（✕）
- 修复了点击外部关闭功能
- 保持ESC键关闭功能

### ✅ 设置按钮无响应
- 重新实现了弹窗组件
- 修复了设置按钮点击处理
- 完善了设置页面功能

### ✅ 图标加载错误
- 修复了manifest.json中缺失的图标文件问题
- 更新了构建脚本自动复制图标文件
- 简化了图标配置，确保扩展能正常加载

## 安装和使用

### 开发环境安装

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd immersive-translate
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **构建扩展**
   ```bash
   npm run build
   ```

4. **加载到Chrome**
   - 打开 Chrome 浏览器
   - 访问 `chrome://extensions/`
   - 开启"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择项目的 `dist` 目录

### 使用方法

1. **选中翻译**
   - 在任意网页选中文本
   - 翻译气泡会自动出现
   - 点击关闭按钮（✕）或按ESC键关闭

2. **扩展弹窗**
   - 点击浏览器工具栏中的扩展图标
   - 在弹窗中输入要翻译的文本
   - 点击设置按钮（⚙️）打开设置页面

3. **沉浸式模式**
   - 选中文本后点击"更多选项"按钮
   - 或使用快捷键 `Ctrl+Shift+Y`



## 技术栈

- **前端框架**：React + TypeScript
- **构建工具**：Vite
- **样式框架**：Tailwind CSS
- **扩展API**：Chrome Extension Manifest V3
- **存储**：Chrome Storage API + IndexedDB


## 项目结构

```
├── src/
│   ├── content/          # 内容脚本
│   ├── popup/            # 扩展弹窗
│   ├── options/          # 设置页面
│   ├── worker/           # Service Worker
│   ├── overlay/          # 沉浸式覆盖层
│   ├── lib/              # 工具库
│   └── styles/           # 样式文件
├── dist/                 # 构建输出
└── dist/                 # 构建输出
```

## 开发说明

### 调试

1. **Service Worker调试**：在 `chrome://extensions/` 中点击"Service Worker"链接
2. **内容脚本调试**：在网页上按F12打开开发者工具查看Console
3. **弹窗调试**：右键点击扩展图标选择"检查弹出内容"

### 构建命令

- `npm run dev` - 开发模式
- `npm run build` - 生产构建
- `npm run clean` - 清理构建文件
- `npm run package` - 打包扩展

## 贡献

欢迎提交Issue和Pull Request来改进这个项目。

## 许可证

MIT License