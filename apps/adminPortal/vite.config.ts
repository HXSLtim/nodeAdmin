import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { importmapPlugin } from './vite-importmap-plugin';

export default defineConfig({
  plugins: [react(), importmapPlugin()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          state: ['zustand', '@tanstack/react-query'],
          ws: ['socket.io-client'],
          'shared-ui': ['clsx', 'tailwind-merge'],
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:11451',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://127.0.0.1:11451',
        ws: true,
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});
