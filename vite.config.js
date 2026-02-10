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
    // ⚠️ 注意：本地开发强烈建议使用 npm run dev:local
    // 这样才能测试本地的 Functions API（新结构）
    // 
    // 如果使用 npm run vite，会代理到线上环境（可能还是旧 API 结构）
    proxy: {
      "/api": {
        target: "https://api.duanziqiong.com",
        changeOrigin: true,
        // 代理到线上环境（去掉 /api 前缀）
        rewrite: (path) => path.replace(/^\/api/, ""),
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('代理错误:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('代理请求:', req.method, req.url, '→', options.target + req.url);
          });
        },
      },
    },
  },
});
