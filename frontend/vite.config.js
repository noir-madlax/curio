import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: loadEnv(process.env.NODE_ENV, process.cwd()).VITE_API_URL,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    }
  }
}); 