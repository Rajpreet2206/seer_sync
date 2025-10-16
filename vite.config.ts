import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, mkdirSync, existsSync, rmSync, renameSync } from 'fs';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-files',
      closeBundle() {
        const distPath = resolve(__dirname, 'dist');
        
        // Move popup.html from dist/src/popup/ to dist/
        const popupSrc = resolve(distPath, 'src/popup/popup.html');
        const popupDest = resolve(distPath, 'popup.html');
        if (existsSync(popupSrc)) {
          renameSync(popupSrc, popupDest);
          console.log('✓ Moved popup.html to dist root');
        }

        // Remove empty src directory
        const srcDir = resolve(distPath, 'src');
        if (existsSync(srcDir)) {
          rmSync(srcDir, { recursive: true, force: true });
          console.log('✓ Cleaned up src directory');
        }

        // Copy manifest.json
        const manifestSrc = resolve(__dirname, 'public/manifest.json');
        const manifestDest = resolve(distPath, 'manifest.json');
        copyFileSync(manifestSrc, manifestDest);
        console.log('✓ Copied manifest.json');

        // Copy icons directory
        const iconsSrc = resolve(__dirname, 'public/icons');
        const iconsDest = resolve(distPath, 'icons');
        if (!existsSync(iconsDest)) {
          mkdirSync(iconsDest, { recursive: true });
        }
        const icons = ['icon16.png', 'icon32.png', 'icon48.png', 'icon128.png'];
        icons.forEach(icon => {
          copyFileSync(
            resolve(iconsSrc, icon),
            resolve(iconsDest, icon)
          );
        });
        console.log('✓ Copied icons');
      }
    }
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/popup.html'),
        background: resolve(__dirname, 'src/background/service-worker.ts'),
        content: resolve(__dirname, 'src/content/content-script.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background') return 'background.js';
          if (chunkInfo.name === 'content') return 'content.js';
          return '[name].js';
        },
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.html')) {
            return '[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
});