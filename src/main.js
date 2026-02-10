import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./router";
import "virtual:uno.css";

// 跟随系统的暗色模式：在 <html> 上同步 .dark class，配合 UnoCSS 的 `dark:` 变体
if (typeof window !== "undefined" && window.matchMedia) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const apply = (e) => {
    document.documentElement.classList.toggle("dark", e.matches);
  };
  apply(media);
  media.addEventListener("change", apply);
}

const app = createApp(App);
app.use(router);
app.mount("#app");
