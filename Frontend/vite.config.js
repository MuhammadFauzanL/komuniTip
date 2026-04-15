import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
  ],
  server: {
    host: '0.0.0.0',       // Allow external access dari Docker
    port: 5173,
    headers: {
      'Cross-Origin-Opener-Policy': 'unsafe-none',
      'Cross-Origin-Embedder-Policy': 'unsafe-none'
    },
    watch: {
      usePolling: true,     // Hot-reload di Docker volume mount
    },
    proxy: {
      '/api': {
        target: 'http://backend-api:3000',
        changeOrigin: true,
      },
    },
  },
})
