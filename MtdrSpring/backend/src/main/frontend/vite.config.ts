import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Redirige las llamadas REST del backend al contenedor de Docker
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false
      },
      "/oauth2": "http://localhost:8080",
      "/login": "http://localhost:8080",
      "/logout": "http://localhost:8080"
    }
  },
  build: {
    outDir: "build",
    sourcemap: false,
  },
});
