import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // 配置 @ 指向 src 目录
      '@': path.resolve(import.meta.dirname, './src')
    }
  },
  server: {
    port: 5173,
    // 把 /api 转发给本地 AI 服务，避免跨域，同时 API Key 不出现在浏览器
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})
