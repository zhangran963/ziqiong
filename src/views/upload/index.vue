<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8">
    <div class="max-w-2xl mx-auto">
      <!-- 头部 -->
      <div class="mb-8 text-center">
        <h1 class="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">上传图片</h1>
        <p class="text-gray-600 dark:text-gray-400">
          支持 JPG、PNG、WebP 格式，最大 10MB
        </p>
        <router-link to="/" class="inline-block mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline">
          ← 返回首页
        </router-link>
      </div>

      <!-- 密码验证 -->
      <div v-if="!isAuthenticated" class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
        <h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">请输入上传密码</h2>
        <form @submit.prevent="checkPassword" class="space-y-4">
          <input
            v-model="password"
            type="password"
            placeholder="请输入密码"
            class="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-colors placeholder-gray-400 dark:placeholder-gray-500"
            autocomplete="off"
          />
          <button
            type="submit"
            class="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            验证密码
          </button>
          <p v-if="authError" class="text-red-600 dark:text-red-400 text-sm">{{ authError }}</p>
        </form>
      </div>

      <!-- 上传区域 -->
      <div v-else class="space-y-6">
        <!-- 拖拽上传区 -->
        <div
          @drop.prevent="handleDrop"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          :class="[
            'border-3 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer',
            isDragging
              ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30'
              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
          ]"
          @click="$refs.fileInput.click()"
        >
          <input
            ref="fileInput"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            @change="handleFileSelect"
            class="hidden"
          />
          
          <div class="text-6xl mb-4">📸</div>
          <p class="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
            {{ isDragging ? '松开鼠标上传' : '点击或拖拽图片到此处' }}
          </p>
          <p class="text-gray-500 dark:text-gray-400">支持 JPG、PNG、WebP，最大 10MB</p>
        </div>

        <!-- 图片预览 -->
        <div v-if="selectedFile" class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h3 class="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">图片预览</h3>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <!-- 预览图 -->
            <div class="flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
              <img :src="previewUrl" alt="预览" class="max-w-full max-h-64 object-contain" />
            </div>
            
            <!-- 文件信息 -->
            <div class="space-y-3 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">文件名:</span>
                <span class="font-mono text-gray-800 dark:text-gray-200">{{ selectedFile.name }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">文件大小:</span>
                <span class="font-semibold text-gray-800 dark:text-gray-200">{{ formatFileSize(selectedFile.size) }}</span>
              </div>
              <div v-if="imageMetadata.width" class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">图片尺寸:</span>
                <span class="font-semibold text-gray-800 dark:text-gray-200">{{ imageMetadata.width }} × {{ imageMetadata.height }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">目标文件夹:</span>
                <span class="font-semibold text-blue-600 dark:text-blue-400">lyrics</span>
              </div>
            </div>
          </div>

          <!-- 上传按钮 -->
          <div class="mt-6 flex gap-3">
            <button
              @click="uploadImage"
              :disabled="uploading"
              class="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {{ uploading ? '上传中...' : '开始上传' }}
            </button>
            <button
              @click="clearSelection"
              :disabled="uploading"
              class="px-6 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold py-3 rounded-lg transition-colors"
            >
              取消
            </button>
          </div>

          <!-- 进度条 -->
          <div v-if="uploading" class="mt-4">
            <div class="bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                class="bg-blue-600 dark:bg-blue-500 h-full transition-all duration-300"
                :style="{ width: `${uploadProgress}%` }"
              ></div>
            </div>
            <p class="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">{{ uploadStatus }}</p>
          </div>
        </div>

        <!-- 上传结果 -->
        <div v-if="uploadResult" class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div :class="[
            'flex items-center gap-3 p-4 rounded-lg',
            uploadResult.success 
              ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
              : 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300'
          ]">
            <span class="text-2xl">{{ uploadResult.success ? '✅' : '❌' }}</span>
            <div class="flex-1">
              <p class="font-semibold">{{ uploadResult.message }}</p>
              <p v-if="uploadResult.details" class="text-sm mt-1 opacity-80">{{ uploadResult.details }}</p>
            </div>
          </div>
          
          <button
            v-if="uploadResult.success"
            @click="resetUpload"
            class="w-full mt-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            继续上传
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// 认证状态
const isAuthenticated = ref(false);
const password = ref('');
const authError = ref('');

// 上传状态
const isDragging = ref(false);
const selectedFile = ref(null);
const previewUrl = ref('');
const imageMetadata = ref({ width: null, height: null });
const uploading = ref(false);
const uploadProgress = ref(0);
const uploadStatus = ref('');
const uploadResult = ref(null);

/**
 * 验证密码
 */
const checkPassword = () => {
  if (!password.value) {
    authError.value = '请输入密码';
    return;
  }
  
  // 临时存储密码，后续上传时验证
  sessionStorage.setItem('uploadPassword', password.value);
  isAuthenticated.value = true;
  authError.value = '';
};

/**
 * 格式化文件大小
 */
const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(1) + ' MB';
};

/**
 * 验证文件
 */
const validateFile = (file) => {
  // 检查文件类型
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: '仅支持 JPG、PNG、WebP 格式' };
  }
  
  // 检查文件大小（10MB）
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: '文件大小不能超过 10MB' };
  }
  
  return { valid: true };
};

/**
 * 读取图片元数据
 */
const readImageMetadata = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height
        });
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * 处理文件选择
 */
const handleFileSelect = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  await processFile(file);
};

/**
 * 处理拖拽上传
 */
const handleDrop = async (event) => {
  isDragging.value = false;
  
  const file = event.dataTransfer.files[0];
  if (!file) return;
  
  await processFile(file);
};

/**
 * 处理文件
 */
const processFile = async (file) => {
  uploadResult.value = null;
  
  // 验证文件
  const validation = validateFile(file);
  if (!validation.valid) {
    uploadResult.value = {
      success: false,
      message: validation.error
    };
    return;
  }
  
  // 设置选中的文件
  selectedFile.value = file;
  
  // 生成预览
  const reader = new FileReader();
  reader.onload = (e) => {
    previewUrl.value = e.target.result;
  };
  reader.readAsDataURL(file);
  
  // 读取元数据
  try {
    const metadata = await readImageMetadata(file);
    imageMetadata.value = metadata;
  } catch (err) {
    console.error('读取元数据失败:', err);
  }
};

/**
 * 生成缩略图（Canvas）
 */
const generateThumbnail = (file, maxWidth = 300, quality = 0.9) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // 计算缩放后的尺寸
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        // 创建 Canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // 转换为 Blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('生成缩略图失败'));
            }
          },
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

/**
 * 上传图片
 */
const uploadImage = async () => {
  if (!selectedFile.value) return;
  
  uploading.value = true;
  uploadProgress.value = 0;
  uploadStatus.value = '准备上传...';
  uploadResult.value = null;
  
  try {
    // 1. 生成缩略图
    uploadStatus.value = '生成缩略图...';
    uploadProgress.value = 10;
    
    const thumbnailBlob = await generateThumbnail(selectedFile.value, 300, 0.9);
    
    uploadProgress.value = 30;
    
    // 2. 构建 FormData
    uploadStatus.value = '准备上传...';
    const formData = new FormData();
    formData.append('originalFile', selectedFile.value);
    formData.append('thumbnailFile', thumbnailBlob, `thumb_${selectedFile.value.name}`);
    formData.append('folder', 'lyrics'); // 固定文件夹（可扩展）
    formData.append('fileName', selectedFile.value.name);
    formData.append('width', imageMetadata.value.width);
    formData.append('height', imageMetadata.value.height);
    
    uploadProgress.value = 40;
    
    // 3. 获取密码
    const pwd = sessionStorage.getItem('uploadPassword');
    
    // 4. 上传
    uploadStatus.value = '上传中...';
    uploadProgress.value = 50;
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'X-Upload-Password': pwd
      },
      body: formData
    });
    
    uploadProgress.value = 90;
    
    const result = await response.json();
    
    if (response.ok) {
      uploadProgress.value = 100;
      uploadStatus.value = '上传成功！';
      uploadResult.value = {
        success: true,
        message: '上传成功！',
        details: `已保存: ${result.originalKey} 和 ${result.thumbnailKey}`
      };
    } else {
      throw new Error(result.error || '上传失败');
    }
  } catch (error) {
    console.error('上传失败:', error);
    uploadResult.value = {
      success: false,
      message: '上传失败',
      details: error.message
    };
  } finally {
    uploading.value = false;
    uploadProgress.value = 0;
  }
};

/**
 * 清除选择
 */
const clearSelection = () => {
  selectedFile.value = null;
  previewUrl.value = '';
  imageMetadata.value = { width: null, height: null };
  uploadResult.value = null;
};

/**
 * 重置上传（继续上传）
 */
const resetUpload = () => {
  clearSelection();
  uploadResult.value = null;
};
</script>

<style scoped>
/* 拖拽区域动画 */
.border-3 {
  border-width: 3px;
}
</style>
