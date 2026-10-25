import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [vue()], base: process.env.V3_BASE_PATH || '/',
  build: { rollupOptions: { output: { manualChunks: { three: ['three'] } } } },
})
