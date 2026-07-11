import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: env.VITE_API_URL,
        changeOrigin: true,
        headers: { Origin: env.FRONTEND_URL },
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('monaco-editor')) return 'monaco';
          if (id.includes('@xyflow/react')) return 'reactflow';
          if (id.includes('lucide-react')) return 'lucide';
        },
      },
    },
  },
}})
