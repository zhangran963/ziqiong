<template>
  <div class="image-modal" @click="onClose">
    <div class="image-modal__content" @click.stop @wheel.prevent="onWheel">
      <img :src="src" alt="预览" class="image-modal__img" :style="{ transform: `scale(${scale})` }" draggable="false" />
    </div>
    <div class="image-modal__controls" @click.stop>
      <button type="button" class="image-modal__btn" aria-label="缩小" @click.stop="zoomOut">−</button>
      <span class="image-modal__scale">{{ Math.round(scale * 100) }}%</span>
      <button type="button" class="image-modal__btn" aria-label="放大" @click.stop="zoomIn">+</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useDialog } from '@/hooks/useDialog'

const props = defineProps<{ src: string }>()
const $dialog = useDialog()

const MIN = 0.75
const MAX = 2
const STEP = 0.12

const scale = ref(1)

watch(() => props.src, () => { scale.value = 1 })

function onClose() {
  $dialog.close()
}

function onWheel(e: WheelEvent) {
  const delta = e.deltaY > 0 ? -STEP : STEP
  scale.value = Math.min(MAX, Math.max(MIN, scale.value + delta))
}

function zoomIn() {
  scale.value = Math.min(MAX, scale.value + STEP)
}

function zoomOut() {
  scale.value = Math.max(MIN, scale.value - STEP)
}
</script>

<style scoped>
.image-modal {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.image-modal__content {
  cursor: default;
  max-width: 95vw;
  max-height: 95vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-modal__img {
  max-width: 95vw;
  max-height: 95vh;
  width: auto;
  height: auto;
  object-fit: contain;
  transform-origin: center center;
  transition: transform 0.18s ease-out;
  user-select: none;
}

.image-modal__controls {
  position: absolute;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 9999px;
  cursor: default;
}

.image-modal__btn {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  transition: background 0.15s;
  padding: 0;
}

.image-modal__btn:hover {
  background: rgba(255, 255, 255, 0.35);
}

.image-modal__scale {
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.9);
  min-width: 3rem;
  text-align: center;
}
</style>
