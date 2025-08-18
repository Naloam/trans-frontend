#!/bin/bash

echo "🔨 强制重新构建Chrome插件"
echo "=========================="

# 检查是否在正确的目录
if [ ! -f "dist/manifest.json" ]; then
    echo "❌ 错误: 请在trans-frontend目录下运行此脚本"
    exit 1
fi

echo "🧹 清理旧文件..."
# 备份当前的service worker
cp dist/src/worker/serviceWorker.js dist/src/worker/serviceWorker.js.backup

echo "🔧 应用修复..."
# 确保URL模式正确
sed -i '' 's/"\*\.pdf"/"*:\/\/*\/\*.pdf"/g' dist/src/worker/serviceWorker.js
sed -i '' 's/"\*\.txt"/"*:\/\/*\/\*.txt"/g' dist/src/worker/serviceWorker.js
sed -i '' 's/"\*\.docx"/"*:\/\/*\/\*.docx"/g' dist/src/worker/serviceWorker.js

echo "✅ 验证修复..."
# 检查是否还有错误的URL模式
if grep -q "\*\.pdf" dist/src/worker/serviceWorker.js; then
    echo "❌ 仍有错误的URL模式存在"
    exit 1
else
    echo "✅ URL模式已修复"
fi

echo "🔍 检查ServiceWorker事件..."
if grep -q "addEventListener.*install" dist/src/worker/serviceWorker.js; then
    echo "✅ ServiceWorker install事件已添加"
else
    echo "⚠️  ServiceWorker install事件缺失"
fi

if grep -q "addEventListener.*activate" dist/src/worker/serviceWorker.js; then
    echo "✅ ServiceWorker activate事件已添加"
else
    echo "⚠️  ServiceWorker activate事件缺失"
fi

echo ""
echo "📋 现在请执行以下步骤:"
echo "1. 完全移除Chrome中的插件"
echo "2. 清理Chrome缓存 (Cmd+Shift+Delete)"
echo "3. 重启Chrome浏览器"
echo "4. 重新加载插件 (选择dist目录)"
echo ""
echo "🎯 这次应该彻底解决问题了！"



