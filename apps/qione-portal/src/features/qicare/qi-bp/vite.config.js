import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: "./",  // Critical for Cloudflare Pages - ensures assets load correctly
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  }
})

