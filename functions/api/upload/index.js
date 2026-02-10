/**
 * 图片上传端点
 * 路由：POST /api/upload
 * 
 * 功能：
 * 1. 密码验证
 * 2. 接收原图 + 缩略图
 * 3. 上传到 R2 带 Custom Metadata
 */

export async function onRequest(context) {
  const { request, env } = context;

  // 仅允许 POST 请求
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // 1. 验证密码
    const password = request.headers.get('X-Upload-Password');
    const validPassword = env.UPLOAD_PASSWORD || 'default-password';
    
    if (password !== validPassword) {
      return new Response(JSON.stringify({ error: '密码错误' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 2. 解析 FormData
    const formData = await request.formData();
    const originalFile = formData.get('originalFile');
    const thumbnailFile = formData.get('thumbnailFile');
    const folder = formData.get('folder') || 'lyrics';
    const width = formData.get('width');
    const height = formData.get('height');
    const fileName = formData.get('fileName');

    if (!originalFile || !thumbnailFile) {
      return new Response(JSON.stringify({ error: '缺少文件' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 3. 验证文件类型
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(originalFile.type)) {
      return new Response(JSON.stringify({ error: '不支持的文件类型' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 4. 验证文件大小（10MB）
    const maxSize = 10 * 1024 * 1024;
    if (originalFile.size > maxSize) {
      return new Response(JSON.stringify({ error: '文件大小不能超过 10MB' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 5. 清理文件名（安全）
    const safeName = fileName.replace(/[^a-zA-Z0-9._\u4e00-\u9fa5-]/g, '_');
    
    // 6. 构建元数据
    const metadata = {
      'user-width': width,
      'user-height': height,
      'user-original-time': new Date().toISOString(),
      'uploaded-by': 'web-upload'
    };

    // 7. 上传原图到 R2
    const originalKey = `${folder}/${safeName}`;
    await env.MY_BUCKET.put(originalKey, originalFile.stream(), {
      httpMetadata: {
        contentType: originalFile.type
      },
      customMetadata: metadata
    });

    // 8. 上传缩略图到 R2
    const fileExt = safeName.substring(safeName.lastIndexOf('.'));
    const fileNameWithoutExt = safeName.substring(0, safeName.lastIndexOf('.'));
    const thumbnailKey = `${folder}/${fileNameWithoutExt}_thumb${fileExt}`;
    
    await env.MY_BUCKET.put(thumbnailKey, thumbnailFile.stream(), {
      httpMetadata: {
        contentType: thumbnailFile.type
      }
    });

    // 9. 返回成功
    return new Response(JSON.stringify({
      success: true,
      message: '上传成功',
      originalKey,
      thumbnailKey,
      metadata
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('上传失败:', error);
    
    return new Response(JSON.stringify({
      error: '上传失败',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
