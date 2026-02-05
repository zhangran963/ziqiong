<template>
  <div
    class="p-1 sm:p-4 md:p-6 grid grid-cols-3 gap-x-2 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-4 lg:gap-x-6 xl:grid-cols-5 grid-auto-rows-[4px] antialiased">
    <div v-for="(file, index) in fileObjects" :key="file.name"
      class="item-container group rounded-lg sm:rounded-xl overflow-hidden bg-gray-50 relative border border-gray-100 shadow-sm transition-all duration-500 ease-out"
      :style="{
        // 2. 核心优化：提前根据比例计算跨度，不再等待图片下载
        gridRowEnd: `span ${calculateSpan(file)}`,
        transitionDelay: `${index * 20}ms`,
      }">
      <div v-if="!loaded[file.name]"
        class="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-100 via-white to-gray-100 z-10"></div>

      <img :src="`/api/lyrics/${file.name}`" :loading="index < 10 ? 'eager' : 'lazy'" decoding="async"
        @load="loaded[file.name] = true" class="w-full h-auto block transition-all duration-700"
        :class="[loaded[file.name] ? 'opacity-100 scale-100' : 'opacity-0 scale-95 blur-sm']" />

      <div
        class="absolute bottom-0 w-full p-1 sm:p-2 bg-gradient-to-t from-black/60 to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-20">
        <span class="text-[8px] sm:text-xs text-white truncate block">{{ file.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from "vue";
import { getR2List } from "@/services/api";

const fileObjects = ref([]); // 存储完整的对象 { name, width, height }
const loaded = reactive({});
const ROW_HEIGHT = 4; // 对应 grid-auto-rows 的像素值

/**
 * 核心：提前计算跨度
 * 不需要等待图片加载，直接根据后端给的宽高比例算出占位高度
 */
const calculateSpan = (file) => {
  if (!file.width || !file.height) return 30; // 兜底高度

  // 1. 获取当前列宽（这是一个估算值，grid 会自动伸缩）
  // 假设宽度为 100，高度 = 100 * (height / width)
  const aspectRatio = file.height / file.width;

  // 2. 将比例高度映射到 grid 行数
  // 这里的 200 是一个参考基准宽（列宽），它不影响比例计算，只影响跨度精度
  const estimatedHeight = 200 * aspectRatio;

  // 3. 计算 span。 +4 是为了加上 gap 的微调
  return Math.ceil((estimatedHeight + 4) / ROW_HEIGHT);
};

onMounted(async () => {
  try {
    const res = await getR2List("lyrics");
    // 假设 res.files 是我们之前优化的 [{name, width, height}, ...]
    fileObjects.value = Array.isArray(res.files) ? res.files : [];
  } catch (err) {
    console.error("Fetch error:", err);
  }
});
</script>

<style scoped>
.item-container {
  display: flex;
  flex-direction: column;
  align-self: start;
  width: 100%;
}
</style>