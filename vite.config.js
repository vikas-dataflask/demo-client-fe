import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8000", // adminBe for other API calls
        changeOrigin: true,
        // Don't rewrite the path - keep /api prefix
      },
      "/backoffice-api": {
        target: "http://localhost:8080/api/admin/", // another backend or microservice
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/backoffice-api/, ""),
      },
      "/ai-api": {
        target: "https://aiagent.askmantu.com/",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ai-api/, ""),
      },
    },
  },
});
