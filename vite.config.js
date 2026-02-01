import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import UnoCSS from "unocss/vite";
import { fileURLToPath, URL } from "node:url"; // 引入工具函数

export default defineConfig({
  plugins: [vue(), UnoCSS()],
  resolve: {
    alias: {
      // 将 @ 指向 src 目录
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    proxy: {
      "/api": "http://localhost:8888", // 代理到 wrangler 端口
    },
  },
});
