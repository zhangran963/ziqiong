/**
 * 批量生成缩略图脚本
 * 
 * 功能：
 * 1. 从 R2 下载原图
 * 2. 使用 sharp 生成缩略图（300px 宽，高质量）
 * 3. 上传缩略图到 R2（文件名：原名_thumb.扩展名）
 * 
 * 使用方法：
 * node scripts/generate-thumbnails.js [folder]
 * 
 * 示例：
 * node scripts/generate-thumbnails.js lyrics
 */

import { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { Readable } from 'stream';
import path from 'path';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 配置
const CONFIG = {
  ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID || '',
  ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID || '',
  SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY || '',
  BUCKET_NAME: 'duan',
  THUMBNAIL_WIDTH: 300,      // 提高到 300px（更清晰）
  THUMBNAIL_QUALITY: 90,      // 提高到 90（更高质量）
};

// 创建 S3 客户端（R2 兼容 S3 API）
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${CONFIG.ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: CONFIG.ACCESS_KEY_ID,
    secretAccessKey: CONFIG.SECRET_ACCESS_KEY,
  },
});

/**
 * 将 Stream 转换为 Buffer
 */
async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

/**
 * 检查文件是否是图片
 */
function isImage(filename) {
  const ext = path.extname(filename).toLowerCase();
  return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
}

/**
 * 生成缩略图文件名
 */
function getThumbnailKey(originalKey) {
  const parsed = path.parse(originalKey);
  return `${parsed.dir}/${parsed.name}_thumb${parsed.ext}`;
}

/**
 * 检查缩略图是否已存在
 */
async function thumbnailExists(key) {
  try {
    await s3Client.send(new GetObjectCommand({
      Bucket: CONFIG.BUCKET_NAME,
      Key: key,
    }));
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * 生成单个缩略图
 */
async function generateThumbnail(key) {
  const thumbnailKey = getThumbnailKey(key);
  
  // 检查是否已存在
  if (await thumbnailExists(thumbnailKey)) {
    console.log(`  ⏭️  跳过（已存在）: ${thumbnailKey}`);
    return { success: true, skipped: true };
  }
  
  try {
    // 1. 下载原图
    console.log(`  📥 下载: ${key}`);
    const getResponse = await s3Client.send(new GetObjectCommand({
      Bucket: CONFIG.BUCKET_NAME,
      Key: key,
    }));
    
    const imageBuffer = await streamToBuffer(getResponse.Body);
    
    // 2. 生成缩略图
    console.log(`  🎨 处理: 缩放到 ${CONFIG.THUMBNAIL_WIDTH}px...`);
    const thumbnail = await sharp(imageBuffer)
      .resize(CONFIG.THUMBNAIL_WIDTH, null, {
        withoutEnlargement: true,
        fit: 'inside',
      })
      .jpeg({ quality: CONFIG.THUMBNAIL_QUALITY })
      .toBuffer();
    
    // 3. 上传缩略图
    console.log(`  📤 上传: ${thumbnailKey} (${(thumbnail.length / 1024).toFixed(1)}KB)`);
    await s3Client.send(new PutObjectCommand({
      Bucket: CONFIG.BUCKET_NAME,
      Key: thumbnailKey,
      Body: thumbnail,
      ContentType: 'image/jpeg',
    }));
    
    console.log(`  ✅ 成功: ${key} → ${thumbnailKey}`);
    return { success: true, skipped: false, originalSize: imageBuffer.length, thumbnailSize: thumbnail.length };
  } catch (error) {
    console.error(`  ❌ 失败: ${key}`);
    console.error(`     错误: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * 批量处理文件夹
 */
async function processFoldder(folderPath = '') {
  console.log(`\n🚀 开始处理文件夹: ${folderPath || '根目录'}`);
  console.log(`📦 存储桶: ${CONFIG.BUCKET_NAME}`);
  console.log(`🎯 缩略图宽度: ${CONFIG.THUMBNAIL_WIDTH}px`);
  console.log(`📊 JPEG 质量: ${CONFIG.THUMBNAIL_QUALITY}`);
  console.log('━'.repeat(60));
  
  try {
    // 列出文件夹中的所有对象
    const prefix = folderPath ? `${folderPath}/` : '';
    const listResponse = await s3Client.send(new ListObjectsV2Command({
      Bucket: CONFIG.BUCKET_NAME,
      Prefix: prefix,
    }));
    
    if (!listResponse.Contents || listResponse.Contents.length === 0) {
      console.log(`\n⚠️  文件夹为空: ${folderPath}`);
      return;
    }
    
    // 过滤出图片文件（排除已有的缩略图）
    const imageFiles = listResponse.Contents
      .filter(obj => isImage(obj.Key))
      .filter(obj => !obj.Key.includes('_thumb.'));
    
    console.log(`\n📝 找到 ${imageFiles.length} 个图片文件\n`);
    
    // 统计
    let processed = 0;
    let skipped = 0;
    let failed = 0;
    let totalOriginalSize = 0;
    let totalThumbnailSize = 0;
    
    // 逐个处理
    for (const [index, file] of imageFiles.entries()) {
      console.log(`\n[${index + 1}/${imageFiles.length}] ${file.Key}`);
      
      const result = await generateThumbnail(file.Key);
      
      if (result.success) {
        if (result.skipped) {
          skipped++;
        } else {
          processed++;
          totalOriginalSize += result.originalSize;
          totalThumbnailSize += result.thumbnailSize;
        }
      } else {
        failed++;
      }
      
      // 避免请求过快，间隔 100ms
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // 输出统计
    console.log('\n' + '━'.repeat(60));
    console.log('📊 处理完成\n');
    console.log(`✅ 成功生成: ${processed} 个`);
    console.log(`⏭️  跳过已存在: ${skipped} 个`);
    console.log(`❌ 失败: ${failed} 个`);
    console.log(`📁 总文件数: ${imageFiles.length} 个`);
    
    if (processed > 0) {
      const avgOriginal = (totalOriginalSize / processed / 1024).toFixed(1);
      const avgThumbnail = (totalThumbnailSize / processed / 1024).toFixed(1);
      const compressionRatio = ((1 - totalThumbnailSize / totalOriginalSize) * 100).toFixed(1);
      
      console.log(`\n💾 大小对比:`);
      console.log(`   原图平均: ${avgOriginal}KB`);
      console.log(`   缩略图平均: ${avgThumbnail}KB`);
      console.log(`   压缩率: ${compressionRatio}%`);
    }
    
    console.log('\n✨ 完成！');
    
  } catch (error) {
    console.error('\n❌ 处理失败:', error.message);
    throw error;
  }
}

// 主函数
async function main() {
  // 检查环境变量
  if (!CONFIG.ACCOUNT_ID || !CONFIG.ACCESS_KEY_ID || !CONFIG.SECRET_ACCESS_KEY) {
    console.error('❌ 错误: 缺少必要的环境变量');
    console.error('\n请设置以下环境变量:');
    console.error('  CLOUDFLARE_ACCOUNT_ID');
    console.error('  R2_ACCESS_KEY_ID');
    console.error('  R2_SECRET_ACCESS_KEY');
    console.error('\n或者创建 .env 文件');
    process.exit(1);
  }
  
  const folderPath = process.argv[2] || '';
  
  await processFoldder(folderPath);
}

// 运行
main().catch(error => {
  console.error('\n💥 发生错误:', error);
  process.exit(1);
});
