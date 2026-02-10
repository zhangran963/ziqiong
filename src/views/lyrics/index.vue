<template>
  <div
    ref="gridContainer"
    class="p-1 sm:p-4 md:p-6 grid grid-cols-3 gap-x-2 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-4 lg:gap-x-6 xl:grid-cols-5 grid-auto-rows-[4px] antialiased bg-gray-100/80 dark:bg-gray-900 min-h-screen">
      <div v-for="(file, index) in fileObjects" :key="file.name"
        class="item-container group rounded-lg sm:rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800 relative border border-gray-200/80 dark:border-gray-700 shadow-sm transition-all duration-500 ease-out cursor-pointer"
        :style="{
          // 核心优化：动态计算跨度，响应窗口大小变化
          gridRowEnd: `span ${itemSpans[file.name] || 30}`,
          transitionDelay: `${index * 20}ms`,
        }"
        @click="openPreview(file)">
        <div v-if="!loaded[file.name]"
          class="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-100 via-white to-gray-100 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 z-10"></div>

        <img :src="getImageUrl(`lyrics/${getThumbnailPath(file)}`, false)"
          :loading="index < 15 ? 'eager' : 'lazy'" decoding="async" @load="handleImageLoad(file.name)"
          class="w-full h-auto block transition-all duration-700 pointer-events-none"
          :class="[loaded[file.name] ? 'opacity-100 scale-100' : 'opacity-0 scale-95 blur-sm']" :alt="file.name" />

        <div
          class="absolute bottom-0 w-full p-1 sm:p-2 bg-gradient-to-t from-black/70 dark:from-black/80 to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
          <span class="text-[8px] sm:text-xs text-white truncate block">{{ file.name }}</span>
          <span class="text-[8px] sm:text-xs text-white/80 block mt-0.5">点击预览原图</span>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from "vue";
import { getR2List, getImageUrl } from "@/services/api";
import { useDialog } from "@/hooks/useDialog";
import ImageViewModal from "@/components/ImageView/modal.vue";

const fileObjects = ref([]); // 存储完整的对象 { name, thumbnailName, width, height }
const $dialog = useDialog();

/** 打开原图预览（Lightbox） */
const openPreview = (file) => {
  const originalUrl = getImageUrl(`lyrics/${file.name}`, false);
  $dialog.show(ImageViewModal, { props: { src: originalUrl } });
};

/** 预览页只显示缩略图：始终用缩略图路径，避免请求原图 */
const getThumbnailPath = (file) => {
  const base = file.thumbnailName || file.name;
  if (base.includes("_thumb.")) return base;
  const lastDot = base.lastIndexOf(".");
  const thumb =
    lastDot > 0 ? `${base.slice(0, lastDot)}_thumb${base.slice(lastDot)}` : `${base}_thumb`;
  return thumb;
};
const loaded = reactive({});
const itemSpans = reactive({}); // 存储每个图片的动态 span 值
const gridContainer = ref(null);
let hasRecalculatedAfterFirstImage = false; // 标记是否在第一张图片加载后重新计算过

const ROW_HEIGHT = 4; // 对应 grid-auto-rows 的像素值
const GAP_ADJUSTMENT = 4; // gap 的微调值

/**
 * 动态计算当前列宽
 */
const getCurrentColumnWidth = () => {
  if (!gridContainer.value) return 200;

  const containerWidth = gridContainer.value.offsetWidth;
  const computedStyle = window.getComputedStyle(gridContainer.value);
  const gap = parseFloat(computedStyle.columnGap) || 8;

  const width = window.innerWidth;
  let columns;
  if (width >= 1280) columns = 5;
  else if (width >= 1024) columns = 4;
  else columns = 3;

  return (containerWidth - gap * (columns - 1)) / columns;
};

/**
 * 根据列宽和图片宽高比计算 grid span
 */
const calculateSpan = (file, columnWidth) => {
  if (!file.width || !file.height) return 30;

  const aspectRatio = file.height / file.width;
  const estimatedHeight = columnWidth * aspectRatio;
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

    const initLayout = () => {
      if (gridContainer.value && gridContainer.value.offsetWidth > 0) {
        recalculateAllSpans();
        requestAnimationFrame(recalculateAllSpans);
      } else {
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