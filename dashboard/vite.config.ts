import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/v1/skills': {
        target: 'http://localhost:8002',
        changeOrigin: true,
      },
      '/api/v1/agents': {
        target: 'http://localhost:8003',
        changeOrigin: true,
      },
      '/api/v1/mcps': {
        target: 'http://localhost:8004',
        changeOrigin: true,
      },
      '/api/v1/knowledge': {
        target: 'http://localhost:8005',
        changeOrigin: true,
      },
      '/api/v1/crews': {
        target: 'http://localhost:8006',
        changeOrigin: true,
      },
      '/api/v1/builders': {
        target: 'http://localhost:8007',
        changeOrigin: true,
      },
    },
  },
})
