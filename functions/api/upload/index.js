/**
 * 图片上传端点
 * 路由：POST /api/upload
 *
 * 功能：
 * 1. 密码验证
 * 2. 接收原图 + 缩略图
 * 3. 上传到 R2 带 Custom Metadata
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Upload-Password',
  'Access-Control-Max-Age': '86400',
};

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
  });
}

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    // 密码校验：统一转字符串并 trim，避免 Dashboard/请求头 带空格或类型不一致
    const password = String(request.headers.get('X-Upload-Password') || '').trim();
    const rawEnv = env.UPLOAD_PASSWORD;
    const validPassword = rawEnv != null && rawEnv !== '' ? String(rawEnv).trim() : null;

    if (validPassword == null || validPassword === '') {
      return jsonResponse(
        { error: '服务端未配置 UPLOAD_PASSWORD，请在 Cloudflare Dashboard 或 wrangler.toml 中配置' },
        500
      );
    }
    if (password !== validPassword) {
      return jsonResponse({ error: '密码错误' }, 401);
    }

    const formData = await request.formData();
    const originalFile = formData.get('originalFile');
    const thumbnailFile = formData.get('thumbnailFile');
    const folder = formData.get('folder') || 'lyrics';
    const width = formData.get('width');
    const height = formData.get('height');
    const fileName = formData.get('fileName') || (originalFile && originalFile.name) || '';

    if (!originalFile || !thumbnailFile) {
      return jsonResponse({ error: '缺少文件' }, 400);
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(originalFile.type)) {
      return jsonResponse({ error: '不支持的文件类型' }, 400);
    }

    const maxSize = 10 * 1024 * 1024;
    if (originalFile.size > maxSize) {
      return jsonResponse({ error: '文件大小不能超过 10MB' }, 400);
    }

    const safeName = String(fileName || 'image').replace(/[^a-zA-Z0-9._\u4e00-\u9fa5-]/g, '_');

    const metadata = {
      'user-width': width,
      'user-height': height,
      'user-original-time': new Date().toISOString(),
      'uploaded-by': 'web-upload'
    };

    const originalKey = `${folder}/${safeName}`;
    await env.MY_BUCKET.put(originalKey, originalFile.stream(), {
      httpMetadata: { contentType: originalFile.type },
      customMetadata: metadata
    });

    const fileExt = safeName.substring(safeName.lastIndexOf('.'));
    const fileNameWithoutExt = safeName.substring(0, safeName.lastIndexOf('.'));
    const thumbnailKey = `${folder}/${fileNameWithoutExt}_thumb${fileExt}`;

    await env.MY_BUCKET.put(thumbnailKey, thumbnailFile.stream(), {
      httpMetadata: { contentType: thumbnailFile.type }
    });

    return jsonResponse({
      success: true,
      message: '上传成功',
      originalKey,
      thumbnailKey,
      metadata
    });
  } catch (error) {
    console.error('上传失败:', error);
    return jsonResponse({ error: '上传失败', details: error.message }, 500);
  }
}
