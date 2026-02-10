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
    // 5173 单独运行时：/api 代理到 8788，与 npm run dev 同源，列表与布局一致
    // 先启动 npm run dev（8788），再开 npm run vite（5173）即可
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8788",
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on("error", (err, req, res) => {
            console.warn("API 代理错误（请先运行 npm run dev 起 8788）:", err.message);
          });
        },
      },
    },
  },
});
