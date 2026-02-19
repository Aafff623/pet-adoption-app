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
          }
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
