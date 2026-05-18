import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache', 'docs/**'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@react-pdf') || id.includes('fontkit') || id.includes('yoga-layout')) {
            return 'pdf-renderer';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1600,
  },
  server: {
    host: true,
    port: 5173,
    open: true,
  },
});
