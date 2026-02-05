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
    // 线上有个独立worker可访问; 但最终逻辑应该放在本项目的functions里
    proxy: {
      "/api": {
        target: "https://api.duanziqiong.com",
        changeOrigin: true,
        // 关键点：因为线上地址是 https://api.duanziqiong.com/lyrics
        // 而本地请求是 /api/lyrics，所以我们需要把开头的 /api 去掉
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
