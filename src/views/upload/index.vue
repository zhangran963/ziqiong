<template>
  <div class="upload-page">
    <!-- 提示区：固定高度 -->
    <header class="upload-page__hint">
      <p class="upload-page__hint-text">支持 JPG、PNG、WebP 格式，最大 10MB</p>
      <router-link to="/" class="upload-page__back">← 返回首页</router-link>
    </header>

    <!-- 未验证时：密码区占主内容 -->
    <template v-if="!isAuthenticated">
      <div class="upload-page__main upload-page__main--auth">
        <div class="upload-page__auth-card">
          <h2 class="upload-page__auth-title">请输入上传密码</h2>
          <form @submit.prevent="checkPassword" class="upload-page__auth-form">
            <input
              v-model="password"
              type="password"
              placeholder="请输入密码"
              class="upload-page__auth-input"
              autocomplete="off"
            />
            <button type="submit" class="upload-page__auth-submit">验证密码</button>
            <p v-if="authError" class="upload-page__auth-error">{{ authError }}</p>
          </form>
        </div>
      </div>
      <div class="upload-page__buttons upload-page__buttons--hidden" />
    </template>

    <!-- 已验证：图片区（默认接受图片；有图时显示图片+删除，参数在底部）+ 按钮 -->
    <template v-else>
      <div
        class="upload-page__image-area"
        @drop.prevent="handleDrop"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        :class="[
          { 'upload-page__image-area--active': isDragging },
          { 'upload-page__image-area--has-file': selectedFile }
        ]"
        @click="!uploading && !selectedFile && fileInput?.click()"
      >
        <input
          ref="fileInput"
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          @change="handleFileSelect"
          class="upload-page__file-input"
        />
        <template v-if="!selectedFile">
          <p class="upload-page__image-area-text">
            {{ isDragging ? '松开鼠标上传' : '点击或拖拽图片到此处' }}
          </p>
          <p class="upload-page__image-area-hint">支持 JPG、PNG、WebP，最大 10MB</p>
        </template>
        <template v-else>
          <div class="upload-page__image-area-content" @click.prevent="uploading ? null : fileInput?.click()">
            <img :src="previewUrl" alt="预览" class="upload-page__image-area-img" />
          </div>
          <div class="upload-page__image-area-bar">
            <p class="upload-page__image-area-params">
              文件名：{{ selectedFile.name }}. 大小：{{ formatFileSize(selectedFile.size) }}<template v-if="imageMetadata.width">. 尺寸：{{ imageMetadata.width }} × {{ imageMetadata.height }}</template>
            </p>
            <button
              type="button"
              class="upload-page__image-area-delete"
              :disabled="uploading"
              title="删除"
              @click.stop="clearSelection"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </button>
          </div>
        </template>
      </div>

      <!-- 按钮区：固定高度 -->
      <div class="upload-page__buttons">
        <template v-if="selectedFile">
          <button
            @click="uploadImage"
            :disabled="uploading"
            class="upload-page__btn upload-page__btn--primary"
          >
            {{ uploading ? '上传中...' : '开始上传' }}
          </button>
          <button
            @click="clearSelection"
            :disabled="uploading"
            class="upload-page__btn upload-page__btn--secondary"
          >
            取消
          </button>
          <div v-if="uploading" class="upload-page__progress">
            <div class="upload-page__progress-bar">
              <div
                class="upload-page__progress-fill"
                :style="{ width: `${uploadProgress}%` }"
              />
            </div>
            <p class="upload-page__progress-text">{{ uploadStatus }}</p>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue';

const toast = inject('toast');

const isAuthenticated = ref(false);
const password = ref('');
const authError = ref('');

const isDragging = ref(false);
const selectedFile = ref(null);
const previewUrl = ref('');
const imageMetadata = ref({ width: null, height: null });
const uploading = ref(false);
const uploadProgress = ref(0);
const uploadStatus = ref('');
const fileInput = ref(null);

const checkPassword = () => {
  if (!password.value) {
    authError.value = '请输入密码';
    return;
  }
  sessionStorage.setItem('uploadPassword', password.value);
  isAuthenticated.value = true;
  authError.value = '';
};

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(1) + ' MB';
};

const validateFile = (file) => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: '仅支持 JPG、PNG、WebP 格式' };
  }
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: '文件大小不能超过 10MB' };
  }
  return { valid: true };
};

const readImageMetadata = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const handleFileSelect = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  await processFile(file);
};

const handleDrop = async (event) => {
  isDragging.value = false;
  const file = event.dataTransfer.files[0];
  if (!file) return;
  await processFile(file);
};

const processFile = async (file) => {
  const validation = validateFile(file);
  if (!validation.valid) {
    toast?.showError(validation.error);
    return;
  }
  selectedFile.value = file;
  const reader = new FileReader();
  reader.onload = (e) => { previewUrl.value = e.target.result; };
  reader.readAsDataURL(file);
  try {
    imageMetadata.value = await readImageMetadata(file);
  } catch (err) {
    console.error('读取元数据失败:', err);
  }
};

const generateThumbnail = (file, maxWidth = 300, quality = 0.9) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error('生成缩略图失败'))),
          'image/jpeg',
          quality
        );
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const clearSelection = () => {
  selectedFile.value = null;
  previewUrl.value = '';
  imageMetadata.value = { width: null, height: null };
  if (fileInput.value) fileInput.value.value = '';
};

const uploadImage = async () => {
  if (!selectedFile.value) return;

  uploading.value = true;
  uploadProgress.value = 0;
  uploadStatus.value = '准备上传...';

  const resetAfterNotify = () => {
    clearSelection();
    uploading.value = false;
    uploadProgress.value = 0;
  };

  try {
    uploadStatus.value = '生成缩略图...';
    uploadProgress.value = 10;
    const thumbnailBlob = await generateThumbnail(selectedFile.value, 300, 0.9);
    uploadProgress.value = 30;

    const formData = new FormData();
    formData.append('originalFile', selectedFile.value);
    formData.append('thumbnailFile', thumbnailBlob, `thumb_${selectedFile.value.name}`);
    formData.append('folder', 'lyrics');
    formData.append('fileName', selectedFile.value.name);
    formData.append('width', imageMetadata.value.width);
    formData.append('height', imageMetadata.value.height);
    uploadProgress.value = 40;

    const pwd = sessionStorage.getItem('uploadPassword');
    uploadStatus.value = '上传中...';
    uploadProgress.value = 50;

    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'X-Upload-Password': pwd },
      body: formData,
    });
    uploadProgress.value = 90;
    const result = await response.json();

    if (response.ok) {
      uploadProgress.value = 100;
      uploadStatus.value = '上传成功！';
      toast?.showSuccess(
        '上传成功！',
        `已保存: ${result.originalKey} 和 ${result.thumbnailKey}`,
        resetAfterNotify
      );
    } else {
      throw new Error(result.error || '上传失败');
    }
  } catch (error) {
    console.error('上传失败:', error);
    toast?.showError('上传失败', error.message, resetAfterNotify);
  } finally {
    uploading.value = false;
    uploadProgress.value = 0;
  }
};
</script>

<style scoped>
.upload-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  min-height: 100vh;
  overflow: hidden;
  background: var(--upload-bg, #f5f5f4);
}
.dark .upload-page {
  background: var(--upload-bg-dark, #1a1a1a);
}

/* 提示区：固定高度 */
.upload-page__hint {
  flex-shrink: 0;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}
.dark .upload-page__hint {
  border-bottom-color: rgba(255, 255, 255, 0.08);
}
.upload-page__hint-text {
  margin: 0;
  font-size: 0.9375rem;
  color: #374151;
}
.dark .upload-page__hint-text {
  color: #d1d5db;
}
.upload-page__back {
  color: #2563eb;
  text-decoration: none;
  font-size: 0.9375rem;
}
.dark .upload-page__back {
  color: #60a5fa;
}
.upload-page__back:hover {
  text-decoration: underline;
}

/* 主内容区：占满剩余 */
.upload-page__main {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}
.upload-page__main--auth {
  align-items: center;
}
.upload-page__auth-card {
  width: 100%;
  max-width: 360px;
  padding: 24px;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.dark .upload-page__auth-card {
  background: #262626;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
.upload-page__auth-title {
  margin: 0 0 16px;
  font-size: 1.125rem;
  color: #111;
}
.dark .upload-page__auth-title {
  color: #f3f4f6;
}
.upload-page__auth-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.upload-page__auth-input {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  background: #fff;
  color: #111;
}
.dark .upload-page__auth-input {
  border-color: #404040;
  background: #1f1f1f;
  color: #f3f4f6;
}
.upload-page__auth-input:focus {
  outline: none;
  border-color: #2563eb;
}
.upload-page__auth-submit {
  padding: 12px;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}
.upload-page__auth-submit:hover {
  background: #1d4ed8;
}
.upload-page__auth-error {
  margin: 0;
  font-size: 0.875rem;
  color: #dc2626;
}

/* 图片区：占剩余空间，默认接受图片；有图时显示图片+删除，参数在底部 */
.upload-page__image-area {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 16px 16px;
  border: 3px dashed #d1d5db;
  border-radius: 16px;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}
.dark .upload-page__image-area {
  border-color: #4b5563;
}
.upload-page__image-area:hover,
.upload-page__image-area--active {
  border-color: #2563eb;
  background: rgba(37, 99, 235, 0.06);
}
.dark .upload-page__image-area:hover,
.dark .upload-page__image-area--active {
  border-color: #60a5fa;
  background: rgba(96, 165, 250, 0.1);
}
.upload-page__file-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}
.upload-page__image-area-text {
  margin: 0 0 4px;
  font-size: 1.0625rem;
  font-weight: 600;
  color: #374151;
}
.dark .upload-page__image-area-text {
  color: #e5e7eb;
}
.upload-page__image-area-hint {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
}
.dark .upload-page__image-area-hint {
  color: #9ca3af;
}

/* 有图时：上方图片+删除，底部参数 */
.upload-page__image-area--has-file {
  justify-content: stretch;
  padding: 0;
  cursor: default;
}
.upload-page__image-area--has-file:hover {
  background: transparent;
}
.dark .upload-page__image-area--has-file:hover {
  background: transparent;
}
.upload-page__image-area-content {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 16px;
  cursor: pointer;
}
.upload-page__image-area-img {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 12px;
  background: #f3f4f6;
}
.dark .upload-page__image-area-img {
  background: #374151;
}
/* 图片区底部一条：占满图片区宽度，左侧文本、右侧删除 */
.upload-page__image-area-bar {
  flex-shrink: 0;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(0, 0, 0, 0.03);
  border-radius: 0 0 13px 13px;
}
.dark .upload-page__image-area-bar {
  border-top-color: rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.05);
}
.upload-page__image-area-params {
  flex: 1;
  margin: 0;
  font-size: 0.8125rem;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
  text-align: left;
}
.dark .upload-page__image-area-params {
  color: #9ca3af;
}
.upload-page__image-area-delete {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  color: #6b7280;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
.upload-page__image-area-delete:hover:not(:disabled) {
  color: #991b1b;
  background: #fee2e2;
}
.dark .upload-page__image-area-delete {
  color: #9ca3af;
}
.dark .upload-page__image-area-delete:hover:not(:disabled) {
  color: #fecaca;
  background: #7f1d1d;
}
.upload-page__image-area-delete:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 按钮区：固定高度 */
.upload-page__buttons {
  flex-shrink: 0;
  height: 80px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}
.dark .upload-page__buttons {
  border-top-color: rgba(255, 255, 255, 0.08);
}
.upload-page__buttons--hidden {
  border-top: none;
}
.upload-page__btn {
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  border: none;
}
.upload-page__btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.upload-page__btn--primary {
  background: #2563eb;
  color: #fff;
}
.upload-page__btn--primary:hover:not(:disabled) {
  background: #1d4ed8;
}
.upload-page__btn--secondary {
  background: #e5e7eb;
  color: #374151;
}
.dark .upload-page__btn--secondary {
  background: #404040;
  color: #e5e7eb;
}
.upload-page__btn--secondary:hover:not(:disabled) {
  background: #d1d5db;
}
.dark .upload-page__btn--secondary:hover:not(:disabled) {
  background: #525252;
}
.upload-page__progress {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  max-width: 240px;
}
.upload-page__progress-bar {
  height: 8px;
  border-radius: 4px;
  background: #e5e7eb;
  overflow: hidden;
}
.dark .upload-page__progress-bar {
  background: #404040;
}
.upload-page__progress-fill {
  height: 100%;
  background: #2563eb;
  transition: width 0.3s;
}
.upload-page__progress-text {
  margin: 0;
  font-size: 0.8125rem;
  color: #6b7280;
}
.dark .upload-page__progress-text {
  color: #9ca3af;
}
</style>
