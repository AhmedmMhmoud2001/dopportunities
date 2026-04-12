import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiOrigin = env.VITE_DEV_API_ORIGIN?.trim() || 'http://localhost:5000'

  return {
    plugins: [react()],
    resolve: {
      dedupe: ['react', 'react-dom'],
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
    },
    server: {
      port: 5174,
      strictPort: false,
      proxy: {
        '/api': { target: apiOrigin, changeOrigin: true },
        '/uploads': { target: apiOrigin, changeOrigin: true },
      },
    },
  }
})
