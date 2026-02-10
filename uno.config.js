import { defineConfig, presetUno, presetAttributify } from "unocss";

export default defineConfig({
  presets: [presetUno(), presetAttributify()],
  // 暗色模式：使用系统 prefers-color-scheme（而不是 .dark class）
  // UnoCSS 正确字段名是 `dark`，不是 `darkMode`
  dark: "media",
  // 这里可以定义你原来的 SCSS 变量为快捷方式
  shortcuts: {
    "grid-main":
      "grid grid-flow-dense gap-2px grid-cols-[repeat(auto-fit,minmax(110px,1fr))] auto-rows-170px sm:grid-cols-[repeat(auto-fit,minmax(220px,1fr))] sm:auto-rows-320px",
  },
});
