import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    react(),
    
    // 新增：把 contentStyle.css 拷贝到 dist 根目录
    viteStaticCopy({
      targets: [
        { src: 'src/content/contentStyle.css', dest: '.' } // => dist/contentStyle.css
      ]
    }),
    
    // 保留：原有的 manifest & icons 拷贝逻辑
    {
      name: 'copy-assets',
      writeBundle() {
        const distDir = resolve(process.cwd(), 'dist');
        const iconsDistDir = resolve(distDir, 'icons');
        
        // 确保目录存在
        if (!existsSync(distDir)) {
          mkdirSync(distDir, { recursive: true });
        }
        if (!existsSync(iconsDistDir)) {
          mkdirSync(iconsDistDir, { recursive: true });
        }
        
        // 复制 manifest.json
        copyFileSync(
          resolve(process.cwd(), 'manifest.json'),
          resolve(distDir, 'manifest.json')
        );
        console.log('✅ Manifest copied to dist/');
        
        // 复制图标文件
        const iconsSourceDir = resolve(process.cwd(), 'public/icons');
        if (existsSync(iconsSourceDir)) {
          const iconFiles = readdirSync(iconsSourceDir);
          iconFiles.forEach(file => {
            copyFileSync(
              resolve(iconsSourceDir, file),
              resolve(iconsDistDir, file)
            );
          });
          console.log(`✅ ${iconFiles.length} icon files copied to dist/icons/`);
        }
      }
    }
  ],
  
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        // HTML 页面
        popup: resolve(process.cwd(), 'src/popup/index.html'),
        options: resolve(process.cwd(), 'src/options/index.html'),
        
        // JavaScript 入口
        serviceWorker: resolve(process.cwd(), 'src/worker/serviceWorker.ts'),
        contentScript: resolve(process.cwd(), 'src/content/contentScript.tsx')
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'serviceWorker') {
            return 'src/worker/serviceWorker.js';
          }
          if (chunkInfo.name === 'contentScript') {
            return 'src/content/contentScript.js';
          }
          return 'assets/[name]-[hash].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    },
    
    target: 'es2020',
    minify: false,
    sourcemap: true
  },
  
  resolve: {
    alias: {
      '@': resolve(process.cwd(), 'src')
    }
  }
});