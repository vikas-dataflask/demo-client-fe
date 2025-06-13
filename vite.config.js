import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8000/", // your backend
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""), // removes /api from request path
      },
      "/backoffice-api": {
        target: "http://localhost:8080/api/admin/", // another backend or microservice
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/backoffice-api/, ""),
      },
    },
  },
});
