import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-oxc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // proxy API calls to the Spring Boot backend during development
    // replace target with actual local backend URL
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
