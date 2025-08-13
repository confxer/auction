// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://auction-alb-925869368.ap-northeast-2.elb.amazonaws.com',
        changeOrigin: true,
        secure: false,
        ws: true
      }
    }
  },
  define: {
    global: 'globalThis',
  },
});