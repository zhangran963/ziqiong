<template>
  <Teleport to="body">
    <Transition name="toast-slide">
      <div
        v-if="current"
        ref="barEl"
        :class="['toast-bar', `toast-bar--${current.type}`, { 'toast-bar--hiding': hiding }]"
        role="alert"
        @transitionend="onTransitionEnd"
      >
        <span class="toast-bar__icon">{{ icon }}</span>
        <div class="toast-bar__content">
          <p class="toast-bar__message">{{ current.message }}</p>
          <p v-if="current.details" class="toast-bar__details">{{ current.details }}</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, inject } from 'vue';

const toast = inject('toast');
const current = computed(() => toast?.current?.value ?? null);
const hiding = computed(() => toast?.hiding?.value ?? false);

const icon = computed(() => {
  if (!current.value) return '';
  const map = { info: 'ℹ️', success: '✅', error: '❌', warn: '⚠️' };
  return map[current.value.type] || 'ℹ️';
});

const barEl = ref(null);
function onTransitionEnd(e) {
  if (e.target !== barEl.value) return;
  if (e.propertyName !== 'transform') return;
  if (hiding.value) toast?.dismissComplete();
}
</script>

<style scoped>
.toast-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(0);
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-bar--hiding {
  transform: translateY(-100%);
}

.toast-bar__icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.toast-bar__content {
  flex: 1;
  min-width: 0;
}

.toast-bar__message {
  margin: 0;
  font-weight: 600;
  font-size: 0.9375rem;
}

.toast-bar__details {
  margin: 4px 0 0;
  font-size: 0.8125rem;
  opacity: 0.9;
}

/* type styles */
.toast-bar--info {
  background: #e0f2fe;
  color: #0c4a6e;
}
.dark .toast-bar--info {
  background: #0c4a6e;
  color: #e0f2fe;
}

.toast-bar--success {
  background: #dcfce7;
  color: #14532d;
}
.dark .toast-bar--success {
  background: #14532d;
  color: #dcfce7;
}

.toast-bar--error {
  background: #fee2e2;
  color: #991b1b;
}
.dark .toast-bar--error {
  background: #991b1b;
  color: #fee2e2;
}

.toast-bar--warn {
  background: #fef3c7;
  color: #92400e;
}
.dark .toast-bar--warn {
  background: #92400e;
  color: #fef3c7;
}

.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.toast-slide-enter-from,
.toast-slide-leave-to {
  transform: translateY(-100%);
}
</style>
