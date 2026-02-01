import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import UnoCSS from "unocss/vite";

export default defineConfig({
  plugins: [vue(), UnoCSS()],
  server: {
    proxy: {
      // 当你在代码里请求 /api 时，Vite 会帮你转发到你之前那个通的 Worker 地址
      "/api": {
        target: "https://server.duanziqiong.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
