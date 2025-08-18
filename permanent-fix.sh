#!/bin/bash

echo "🔧 永久修复Chrome插件问题"
echo "=========================="

# 检查是否在正确的目录
if [ ! -f "src/worker/serviceWorker.ts" ]; then
    echo "❌ 错误: 请在trans-frontend目录下运行此脚本"
    exit 1
fi

echo "🔍 检查源代码修复..."
# 检查TypeScript源文件中的URL模式
if grep -q "'\*\.pdf'" src/worker/serviceWorker.ts; then
    echo "❌ 源代码中仍有错误的URL模式"
    echo "正在修复源代码..."
    
    # 修复源代码中的URL模式
    sed -i '' "s/'\\*\.pdf'/'*:\/\/\*\/\*\.pdf'/g" src/worker/serviceWorker.ts
    sed -i '' "s/'\\*\.txt'/'*:\/\/\*\/\*\.txt'/g" src/worker/serviceWorker.ts
    sed -i '' "s/'\\*\.docx'/'*:\/\/\*\/\*\.docx'/g" src/worker/serviceWorker.ts
    
    echo "✅ 源代码已修复"
else
    echo "✅ 源代码URL模式正确"
fi

# 检查ServiceWorker事件
if grep -q "addEventListener.*install" src/worker/serviceWorker.ts; then
    echo "✅ ServiceWorker install事件存在"
else
    echo "❌ ServiceWorker install事件缺失"
fi

if grep -q "addEventListener.*activate" src/worker/serviceWorker.ts; then
    echo "✅ ServiceWorker activate事件存在"
else
    echo "❌ ServiceWorker activate事件缺失"
fi

# 检查Context Menus
if grep -q "setupContextMenus" src/worker/serviceWorker.ts; then
    echo "✅ Context Menus管理函数存在"
else
    echo "❌ Context Menus管理函数缺失"
fi

echo ""
echo "🔨 重新构建项目..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ 构建成功"
else
    echo "❌ 构建失败"
    exit 1
fi

echo ""
echo "🔍 验证构建结果..."
# 检查构建后的文件
if grep -q '"\*\.pdf"' dist/src/worker/serviceWorker.js; then
    echo "❌ 构建后仍有错误的URL模式"
    exit 1
else
    echo "✅ 构建后URL模式正确"
fi

if grep -q "addEventListener.*install" dist/src/worker/serviceWorker.js; then
    echo "✅ 构建后ServiceWorker install事件存在"
else
    echo "❌ 构建后ServiceWorker install事件缺失"
    exit 1
fi

if grep -q "addEventListener.*activate" dist/src/worker/serviceWorker.js; then
    echo "✅ 构建后ServiceWorker activate事件存在"
else
    echo "❌ 构建后ServiceWorker activate事件缺失"
    exit 1
fi

if grep -q "setupContextMenus" dist/src/worker/serviceWorker.js; then
    echo "✅ 构建后Context Menus管理函数存在"
else
    echo "❌ 构建后Context Menus管理函数缺失"
    exit 1
fi

echo ""
echo "🎉 永久修复完成！"
echo ""
echo "📋 现在请执行以下步骤："
echo ""
echo "1️⃣ 完全移除插件："
echo "   - 打开Chrome浏览器"
echo "   - 访问 chrome://extensions/"
echo "   - 找到 'Immersive Translate' 插件"
echo "   - 点击 '移除' 按钮"
echo ""
echo "2️⃣ 清理Chrome缓存："
echo "   - 按 Cmd+Shift+Delete (Mac)"
echo "   - 选择 '高级' 标签"
echo "   - 勾选所有选项"
echo "   - 点击 '清除数据'"
echo ""
echo "3️⃣ 重启Chrome："
echo "   - 完全关闭Chrome (Cmd+Q)"
echo "   - 重新打开Chrome"
echo ""
echo "4️⃣ 重新加载插件："
echo "   - 访问 chrome://extensions/"
echo "   - 开启 '开发者模式'"
echo "   - 点击 '加载已解压的扩展程序'"
echo "   - 选择当前目录下的 'dist' 文件夹"
echo ""
echo "🔍 验证成功："
echo "   - 插件错误页面应该显示 'Nothing to see here, move along.'"
echo "   - 控制台不再显示错误信息"
echo ""
echo "✨ 这次是永久修复，以后重新构建也不会再出现这个问题！"
