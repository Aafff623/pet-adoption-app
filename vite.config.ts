import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const geminiKey = env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY;
    return {
      server: {
        port: 3001,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['pets/favicon.ico', 'pets/apple-touch-icon.png'],
          manifest: {
            name: 'PetConnect',
            short_name: 'PetConnect',
            description: '宠物领养与连接平台',
            theme_color: '#60e750',
            background_color: '#f6f8f6',
            display: 'standalone',
            start_url: '/',
            icons: [
              { src: '/pets/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
              { src: '/pets/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
              { src: '/pets/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
            ]
          },
          workbox: {
            // 预缓存 App Shell
            globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
            // 运行时缓存策略
            runtimeCaching: [
              {
                // Supabase REST API — stale-while-revalidate，最多缓存 50 条，保留 1 小时
                urlPattern: /https:\/\/.*\.supabase\.co\/rest\/v1\/.*/i,
                handler: 'StaleWhileRevalidate',
                options: {
                  cacheName: 'supabase-rest-cache',
                  expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 60 * 60, // 1 小时
                  },
                  cacheableResponse: {
                    statuses: [0, 200],
                  },
                },
              },
              {
                // Supabase Storage 图片 — CacheFirst，保留 7 天
                urlPattern: /https:\/\/.*\.supabase\.co\/storage\/v1\/.*/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'supabase-storage-cache',
                  expiration: {
                    maxEntries: 100,
                    maxAgeSeconds: 60 * 60 * 24 * 7, // 7 天
                  },
                  cacheableResponse: {
                    statuses: [0, 200],
                  },
                },
              },
              {
                // 宠物图片等静态资源 — CacheFirst
                urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'images-cache',
                  expiration: {
                    maxEntries: 80,
                    maxAgeSeconds: 60 * 60 * 24 * 3, // 3 天
                  },
                },
              },
            ],
          },
        })
      ],
      define: {
        'import.meta.env.VITE_LLM_PROVIDER': JSON.stringify(env.VITE_LLM_PROVIDER || 'deepseek'),
        'import.meta.env.VITE_DEEPSEEK_API_KEY': JSON.stringify(env.VITE_DEEPSEEK_API_KEY),
        'import.meta.env.VITE_DOUBAO_API_KEY': JSON.stringify(env.VITE_DOUBAO_API_KEY),
        'import.meta.env.VITE_DOUBAO_MODEL_ID': JSON.stringify(env.VITE_DOUBAO_MODEL_ID),
        'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(geminiKey),
        'process.env.GEMINI_API_KEY': JSON.stringify(geminiKey),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
