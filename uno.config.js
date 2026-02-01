import { defineConfig, presetUno, presetAttributify } from "unocss";

export default defineConfig({
  presets: [
    presetUno(), // 默认预设
    presetAttributify(), // 开启属性化模式（可选）
  ],
});
