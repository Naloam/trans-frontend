#!/bin/bash

echo "🔍 简单验证Chrome插件修复"
echo "=========================="

echo "检查URL模式..."
if grep -q "\*\.pdf" dist/src/worker/serviceWorker.js; then
    echo "❌ 发现错误的URL模式"
    grep -n "\*\.pdf" dist/src/worker/serviceWorker.js
else
    echo "✅ URL模式正确"
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
echo "🎯 修复状态检查完成！"
