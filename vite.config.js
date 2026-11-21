import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Khi chạy `npm run dev`, Vite phục vụ giao diện ở cổng 5173
// và chuyển tiếp các yêu cầu /api sang server Express (cổng 3000).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          react: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
});
