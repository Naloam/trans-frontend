#!/bin/bash

echo "🚀 终极Chrome插件修复方案"
echo "=========================="

# 检查是否在正确的目录
if [ ! -f "dist/manifest.json" ]; then
    echo "❌ 错误: 请在trans-frontend目录下运行此脚本"
    exit 1
fi

echo "🔧 应用最终修复..."
# 使用修复后的service worker文件
if [ -f "serviceWorker-fixed.js" ]; then
    cp serviceWorker-fixed.js dist/src/worker/serviceWorker.js
    echo "✅ 已应用修复的service worker文件"
else
    echo "❌ 找不到修复文件"
    exit 1
fi

echo ""
echo "🔍 验证修复..."
# 检查URL模式
if grep -q '"\*\.pdf"' dist/src/worker/serviceWorker.js; then
    echo "❌ 仍有错误的URL模式"
    exit 1
else
    echo "✅ URL模式已修复"
fi

# 检查ServiceWorker事件
if grep -q "addEventListener.*install" dist/src/worker/serviceWorker.js; then
    echo "✅ ServiceWorker install事件存在"
else
    echo "❌ ServiceWorker install事件缺失"
    exit 1
fi

if grep -q "addEventListener.*activate" dist/src/worker/serviceWorker.js; then
    echo "✅ ServiceWorker activate事件存在"
else
    echo "❌ ServiceWorker activate事件缺失"
    exit 1
fi

# 检查Context Menus
if grep -q "setupContextMenus" dist/src/worker/serviceWorker.js; then
    echo "✅ Context Menus管理函数存在"
else
    echo "❌ Context Menus管理函数缺失"
    exit 1
fi

echo ""
echo "🎉 所有修复验证通过！"
echo ""
echo "📋 现在请严格按照以下步骤操作："
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
echo "✨ 这次应该彻底解决问题了！"



