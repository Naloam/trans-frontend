#!/bin/bash

echo "🔍 验证Chrome插件修复"
echo "======================"

# 检查是否在正确的目录
if [ ! -f "dist/manifest.json" ]; then
    echo "❌ 错误: 请在trans-frontend目录下运行此脚本"
    exit 1
fi

echo "✅ 检查文件完整性..."
if [ -f "dist/src/worker/serviceWorker.js" ]; then
    echo "✅ serviceWorker.js 文件存在"
else
    echo "❌ serviceWorker.js 文件不存在"
    exit 1
fi

echo ""
echo "🔍 检查URL模式修复..."
if grep -q "\*\.pdf" dist/src/worker/serviceWorker.js; then
    echo "❌ 发现错误的URL模式: *.pdf"
    exit 1
else
    echo "✅ URL模式已修复 (没有 *.pdf)"
fi

if grep -q "\*://\*/\*\.pdf" dist/src/worker/serviceWorker.js; then
    echo "✅ 正确的URL模式存在: *://*/*.pdf"
else
    echo "❌ 缺少正确的URL模式"
    exit 1
fi

echo ""
echo "🔍 检查ServiceWorker事件..."
if grep -q "addEventListener.*install" dist/src/worker/serviceWorker.js; then
    echo "✅ ServiceWorker install事件已添加"
else
    echo "❌ ServiceWorker install事件缺失"
    exit 1
fi

if grep -q "addEventListener.*activate" dist/src/worker/serviceWorker.js; then
    echo "✅ ServiceWorker activate事件已添加"
else
    echo "❌ ServiceWorker activate事件缺失"
    exit 1
fi

if grep -q "addEventListener.*error" dist/src/worker/serviceWorker.js; then
    echo "✅ ServiceWorker error事件已添加"
else
    echo "❌ ServiceWorker error事件缺失"
    exit 1
fi

echo ""
echo "🔍 检查Context Menus管理..."
if grep -q "setupContextMenus" dist/src/worker/serviceWorker.js; then
    echo "✅ Context Menus管理函数已添加"
else
    echo "❌ Context Menus管理函数缺失"
    exit 1
fi

if grep -q "removeAll" dist/src/worker/serviceWorker.js; then
    echo "✅ Context Menus清理逻辑已添加"
else
    echo "❌ Context Menus清理逻辑缺失"
    exit 1
fi

echo ""
echo "🎉 所有修复验证通过！"
echo ""
echo "📋 现在请执行以下步骤:"
echo "1. 打开Chrome浏览器"
echo "2. 访问 chrome://extensions/"
echo "3. 找到 'Immersive Translate' 插件并点击 '移除'"
echo "4. 按 Cmd+Shift+Delete 清理Chrome缓存"
echo "5. 重启Chrome浏览器"
echo "6. 重新访问 chrome://extensions/"
echo "7. 开启 '开发者模式'"
echo "8. 点击 '加载已解压的扩展程序'"
echo "9. 选择当前目录下的 'dist' 文件夹"
echo ""
echo "✨ 这次应该彻底解决问题了！"
