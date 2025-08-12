#!/usr/bin/env node

/**
 * Build Script for Immersive Translate Extension
 * 构建沉浸式翻译扩展的脚本
 */

import { build } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function buildExtension() {
  try {
    console.log('🚀 开始构建扩展...');
    
    // 构建扩展
    await build({
      configFile: resolve(__dirname, 'vite.config.ts'),
      mode: 'production'
    });
    
    console.log('✅ 扩展构建完成！');
    console.log('📦 输出目录: dist/');
    console.log('🔧 可以加载到 Chrome 扩展管理器中进行测试');
    
  } catch (error) {
    console.error('❌ 构建失败:', error);
    process.exit(1);
  }
}

buildExtension();