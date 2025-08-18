#!/bin/bash

echo "🔍 最终验证Chrome插件修复"
echo "=========================="

echo "检查错误的URL模式..."
if grep -q '"\*\.pdf"' dist/src/worker/serviceWorker.js; then
    echo "❌ 发现错误的URL模式: \"*.pdf\""
    grep -n '"\*\.pdf"' dist/src/worker/serviceWorker.js
else
    echo "✅ 没有错误的URL模式"
fi

echo ""
echo "检查正确的URL模式..."
if grep -q '"\*://\*/\*\.pdf"' dist/src/worker/serviceWorker.js; then
    echo "✅ 正确的URL模式存在: \"*://*/*.pdf\""
else
    echo "❌ 缺少正确的URL模式"
fi

echo ""
echo "检查ServiceWorker事件..."
if grep -q "addEventListener.*install" dist/src/worker/serviceWorker.js; then
    echo "✅ install事件存在"
else
    echo "❌ install事件缺失"
fi

if grep -q "addEventListener.*activate" dist/src/worker/serviceWorker.js; then
    echo "✅ activate事件存在"
else
    echo "❌ activate事件缺失"
fi

echo ""
echo "检查Context Menus..."
if grep -q "setupContextMenus" dist/src/worker/serviceWorker.js; then
    echo "✅ setupContextMenus函数存在"
else
    echo "❌ setupContextMenus函数缺失"
fi

echo ""
echo "🎉 验证完成！"
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
