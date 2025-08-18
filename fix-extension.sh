#!/bin/bash

echo "🔧 Chrome插件修复脚本"
echo "======================"

# 检查是否在正确的目录
if [ ! -f "dist/manifest.json" ]; then
    echo "❌ 错误: 请在trans-frontend目录下运行此脚本"
    exit 1
fi

echo "✅ 检查文件完整性..."

# 验证manifest.json语法
if python3 -m json.tool dist/manifest.json > /dev/null 2>&1; then
    echo "✅ manifest.json 语法正确"
else
    echo "❌ manifest.json 语法错误"
    exit 1
fi

# 检查service worker文件
if [ -f "dist/src/worker/serviceWorker.js" ]; then
    echo "✅ serviceWorker.js 文件存在"
else
    echo "❌ serviceWorker.js 文件不存在"
    exit 1
fi

# 检查权限
chmod -R 755 dist/
echo "✅ 文件权限已设置"

echo ""
echo "📋 修复步骤:"
echo "1. 打开Chrome浏览器"
echo "2. 访问 chrome://extensions/"
echo "3. 找到 'Immersive Translate' 插件"
echo "4. 点击 '移除' 按钮完全删除插件"
echo "5. 按 Cmd+Shift+Delete (Mac) 或 Ctrl+Shift+Delete (Windows)"
echo "6. 选择 '高级' -> 勾选所有选项 -> '清除数据'"
echo "7. 重启Chrome浏览器"
echo "8. 重新访问 chrome://extensions/"
echo "9. 开启 '开发者模式'"
echo "10. 点击 '加载已解压的扩展程序'"
echo "11. 选择当前目录下的 'dist' 文件夹"
echo ""
echo "🔍 验证修复:"
echo "- 检查Chrome开发者工具控制台是否还有错误"
echo "- 访问 chrome://extensions/ 查看插件错误页面"
echo "- 应该显示 'Nothing to see here, move along.'"
echo ""
echo "✨ 修复完成！如果仍有问题，请查看 troubleshooting.md 文件"
