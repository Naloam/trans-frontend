# 😄 Wistrans 智慧译——英语学习智能应用

## 选题：[**智享生活**](https://tianchi.aliyun.com/competition/entrance/532398/information)

🚀 一款专为学生设计的[移动端](https://github.com/aimmetal-tech/wistrans-app)与[浏览器插件](https://github.com/Naloam/trans-frontend)的英语学习智能应用工具

## 功能特色

### 🎯 主要功能

#### 📱 移动端

- **AI 对话**: 支持多种大模型（Qwen、DeepSeek、GPT-4o），实现流式对话和 Markdown 渲染
- **获取英语新闻**: 自动获取新华网英文新闻
- **学习笔记**: 创建、编辑、删除学习笔记，支持本地存储
- **个人中心**: 用户信息管理、学习统计、应用设置

#### 🌐 浏览器插件

- **AI 翻译**: 支持多种大模型（Qwen、DeepSeek、GPT-4o）
- **替换原文**：替换网页中的英文单词

## 项目创意

### 💡 灵感来源

1. 电脑浏览器端与移动端的使用增多。学生需要一个轻量级工具帮助快速学习、记录、复习。碎片化学习大势所趋。

2. 新闻平台冗杂。学生需要信息降噪，减少不必要的信息摄入。

## 部署与运行

### 🔗 仓库链接

- 前端
  - [移动端](https://github.com/aimmetal-tech/wistrans-app) - Flutter 应用
  - [浏览器插件](https://github.com/Naloam/trans-frontend) - Chrome 插件
- 后端，两者必须同时运行
  - [Go-Gin 后端](https://github.com/aimmetal-tech/wistrans-backend-go)
  - [FastAPI 后端](https://github.com/aimmetal-tech/wistrans-backend)

### 📦 拉取项目&&配置环境

1. **克隆项目**

   使用 git clone 命令

2. **安装依赖**

- 前端

  - 插件端

  ```bash
  npm install

  npm run build
  ```

  - 移动端

  ```bash
  flutter pub get

  flutter run
  ```

- 后端

  - Go-Gin

  ```bash
  # 复制 .env.example 文件为 .env，配置好API和数据库连接信息
  cp .env.example .env
  ```

  ```bash
  go mod tidy
  
  go run main.go
  ```

  - FastAPI，使用 conda 环境，Linux或MacOS（由于windows极大概率会出错所以推荐win使用wsl）

  ```bash
  # 复制 .env.example 文件为 .env，配置好API和数据库连接信息
  cp .env.example .env
  ```

  ```bash
  # 使用后端 FastAPI 项目下的 environment.yml 来创建环境，避免出错
  conda env create -f environment.yml -n wistrans
  
  conda activate wistrans
  
  python main.py
  ```

  > [!NOTE]
  >
  > 备注：移动端需要 Go-Gin 和 FastAPI 两个后端，插件端只需要 FastAPI 后端。Go-Gin 和 FastAPI 分别默认运行在 8080 和 8000 端口。两个前端默认连接localhost
  
  
