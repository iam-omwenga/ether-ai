import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      build: {
        // Code splitting for better caching
        rollupOptions: {
          output: {
            manualChunks: {
              'ethers-lib': ['ethers'],
              'react-lib': ['react', 'react-dom'],
              'gemini-lib': ['@google/genai'],
            }
          }
        },
        // Minify and optimize
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: mode === 'production'
          }
        },
        // Enable CSS code splitting
        cssCodeSplit: true,
        // Chunk size warnings
        chunkSizeWarningLimit: 500,
        // Source maps for production
        sourcemap: false,
        // Report compressed size
        reportCompressedSize: false
      },
      plugins: [
        react({
          // Fast refresh for dev
          fastRefresh: true
        })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      optimize: {
        // Enable dependency pre-bundling
        esbuild: {
          drop: mode === 'production' ? ['console'] : []
        }
      }
    };
});
