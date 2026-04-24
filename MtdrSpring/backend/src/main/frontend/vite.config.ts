import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
        // ADD THIS LINE: It removes "/api" so Spring Boot just sees "/teams"
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
  test: {
		globals:true,
		environment: 'jsdom',
		tags: [
			{name: "frontend", description: "Tests written for frontend"},
			{name: "backend", description: "Tests written for backend"}
		],
		coverage: {
			include: ['src/**/*'],
			exclude: [
				'src/assets',
				'src/*.css',
				'vite.*.ts',
				'**/*.config.*',
				'**/**.test.{ts, tsx, js, jsx}',
				'**/coverage/**'
			]
		}
	}
});
