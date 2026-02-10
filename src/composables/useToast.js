import { ref, readonly } from 'vue';

const queue = ref([]);
const current = ref(null);
const hiding = ref(false);

const DURATION = {
  info: 3000,
  success: 3000,
  warn: 3500,
  error: 4500,
};

const SLIDE_DURATION_MS = 350;

let hideTimer = null;
let nextTimer = null;

function showNext() {
  if (queue.value.length === 0) {
    hiding.value = false;
    return;
  }
  current.value = queue.value.shift();
  hiding.value = false;

  const duration = current.value.duration ?? DURATION[current.value.type] ?? 3000;
  hideTimer = setTimeout(() => {
    hiding.value = true;
    hideTimer = null;
    nextTimer = setTimeout(() => {
      const prev = current.value;
      current.value = null;
      nextTimer = null;
      try {
        prev?.onDismiss?.();
      } catch (_) {}
      showNext();
    }, SLIDE_DURATION_MS);
  }, duration);
}

function show(type, message, details = '', onDismiss) {
  const item = {
    id: Date.now() + Math.random(),
    type,
    message,
    details: details || '',
    duration: DURATION[type],
    onDismiss: typeof onDismiss === 'function' ? onDismiss : undefined,
  };
  queue.value.push(item);
  if (!current.value && !hiding.value) {
    showNext();
  }
}

function dismissComplete() {
  if (nextTimer) clearTimeout(nextTimer);
  nextTimer = null;
  const prev = current.value;
  current.value = null;
  try {
    prev?.onDismiss?.();
  } catch (_) {}
  showNext();
}

export function useToast() {
  return {
    current: readonly(current),
    hiding: readonly(hiding),
    showInfo: (message, details, onDismiss) => show('info', message, details, onDismiss),
    showSuccess: (message, details, onDismiss) => show('success', message, details, onDismiss),
    showError: (message, details, onDismiss) => show('error', message, details, onDismiss),
    showWarn: (message, details, onDismiss) => show('warn', message, details, onDismiss),
    dismissComplete,
  };
}
