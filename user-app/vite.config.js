import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    allowedHosts: ['4o1c69oc3q78.share.zrok.io'],
    proxy: {
      // Node.js/Express backend
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      // Django AI backend — rewrite /ai-api/... → /api/v1/...
      '/ai-api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ai-api/, '/api/v1'),
      },
    },
  },
});
