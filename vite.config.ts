/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = import.meta.dirname || path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@react-pdf') || id.includes('fontkit') || id.includes('yoga-layout')) {
            return 'pdf-renderer';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1600
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    open: true
  },
  test: {
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache', 'docs/**', 'tests/e2e/**', 'tests/stress/**', 'archive/**']
  }
});
