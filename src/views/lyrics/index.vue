<template>
  <div
    ref="gridContainer"
    class="p-1 sm:p-4 md:p-6 grid grid-cols-3 gap-x-2 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-4 lg:gap-x-6 xl:grid-cols-5 grid-auto-rows-[4px] antialiased bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div v-for="(file, index) in fileObjects" :key="file.name"
        class="item-container group rounded-lg sm:rounded-xl overflow-hidden bg-white dark:bg-gray-800 relative border border-gray-100 dark:border-gray-700 shadow-sm transition-all duration-500 ease-out"
        :style="{
          // 核心优化：动态计算跨度，响应窗口大小变化
          gridRowEnd: `span ${itemSpans[file.name] || 30}`,
          transitionDelay: `${index * 20}ms`,
        }">
        <div v-if="!loaded[file.name]"
          class="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-100 via-white to-gray-100 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 z-10"></div>

        <img :src="getImageUrl(`lyrics/${file.thumbnailName || file.name}`, false)"
          :loading="index < 15 ? 'eager' : 'lazy'" decoding="async" @load="handleImageLoad(file.name)"
          class="w-full h-auto block transition-all duration-700"
          :class="[loaded[file.name] ? 'opacity-100 scale-100' : 'opacity-0 scale-95 blur-sm']" :alt="file.name" />

        <div
          class="absolute bottom-0 w-full p-1 sm:p-2 bg-gradient-to-t from-black/70 dark:from-black/80 to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-20">
          <span class="text-[8px] sm:text-xs text-white truncate block">{{ file.name }}</span>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from "vue";
import { getR2List, getImageUrl } from "@/services/api";

const fileObjects = ref([]); // 存储完整的对象 { name, thumbnailName, width, height }
const loaded = reactive({});
const itemSpans = reactive({}); // 存储每个图片的动态 span 值
const gridContainer = ref(null);
let hasRecalculatedAfterFirstImage = false; // 标记是否在第一张图片加载后重新计算过

const ROW_HEIGHT = 4; // 对应 grid-auto-rows 的像素值
const GAP_ADJUSTMENT = 4; // gap 的微调值

/**
 * 动态计算当前列宽
 * 根据容器宽度和 CSS 断点，返回实际的单列宽度
 */
const getCurrentColumnWidth = () => {
  if (!gridContainer.value) return 200; // 默认值

  const containerWidth = gridContainer.value.offsetWidth;
  const computedStyle = window.getComputedStyle(gridContainer.value);

  // 获取实际的 gap 值（px）
  const gap = parseFloat(computedStyle.columnGap) || 8;

  // 获取当前列数（根据 Tailwind 断点）
  const width = window.innerWidth;
  let columns;
  if (width >= 1280) {
    columns = 5; // xl:grid-cols-5
  } else if (width >= 1024) {
    columns = 4; // lg:grid-cols-4
  } else {
    columns = 3; // 默认 grid-cols-3
  }

  // 计算单列宽度：(容器宽度 - 所有 gap 的总宽度) / 列数
  const columnWidth = (containerWidth - gap * (columns - 1)) / columns;

  return columnWidth;
};

/**
 * 核心：动态计算跨度
 * 根据实际列宽和图片宽高比计算准确的 grid span
 */
const calculateSpan = (file, columnWidth) => {
  if (!file.width || !file.height) return 30; // 兜底高度

  const aspectRatio = file.height / file.width;

  // 使用实际列宽计算图片应该占用的高度
  const estimatedHeight = columnWidth * aspectRatio;

  // 计算需要的行数（span）
  return Math.ceil((estimatedHeight + GAP_ADJUSTMENT) / ROW_HEIGHT);
};

/**
 * 重新计算所有图片的 span
 */
const recalculateAllSpans = () => {
  const columnWidth = getCurrentColumnWidth();

  fileObjects.value.forEach((file) => {
    itemSpans[file.name] = calculateSpan(file, columnWidth);
  });
};

/**
 * 处理图片加载完成
 */
const handleImageLoad = (fileName) => {
  loaded[fileName] = true;

  // 第一张图片加载后，重新计算一次布局（确保准确性）
  if (!hasRecalculatedAfterFirstImage) {
    hasRecalculatedAfterFirstImage = true;
    requestAnimationFrame(() => {
      recalculateAllSpans();
    });
  }
};

/**
 * 防抖函数 - 避免 resize 事件频繁触发
 */
let resizeTimer = null;
const handleResize = () => {
  if (resizeTimer) {
    clearTimeout(resizeTimer);
  }

  resizeTimer = setTimeout(() => {
    recalculateAllSpans();
  }, 150); // 150ms 防抖延迟
};

onMounted(async () => {
  try {
    const res = await getR2List("lyrics");
    fileObjects.value = Array.isArray(res.files) ? res.files : [];

    // 等待 DOM 更新
    await nextTick();

    // 延迟计算，确保容器有实际宽度
    const initLayout = () => {
      if (gridContainer.value && gridContainer.value.offsetWidth > 0) {
        recalculateAllSpans();

        // 再次确认布局（防止首次计算不准确）
        requestAnimationFrame(() => {
          recalculateAllSpans();
        });
      } else {
        // 如果容器还没有宽度，再等一帧
        requestAnimationFrame(initLayout);
      }
    };

    requestAnimationFrame(initLayout);

    // 监听窗口大小变化
    window.addEventListener("resize", handleResize);
  } catch (err) {
    console.error("Fetch error:", err);
  }
});

onUnmounted(() => {
  // 清理事件监听器
  window.removeEventListener("resize", handleResize);
  if (resizeTimer) {
    clearTimeout(resizeTimer);
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