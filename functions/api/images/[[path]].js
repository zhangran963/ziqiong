/**
 * 图片访问端点
 * 路由：/api/images/[[path]]
 * 
 * 功能：
 * 从 R2 存储桶返回图片（支持本地和远程）
 */

const IMAGE_BASE_URL = "https://store.duanziqiong.com/";

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // 去掉 /api/images/ 前缀，获取实际的图片路径
  const path = url.pathname.replace(/^\/api\/images\//, "");

  // 验证是否是图片文件
  if (!/\.(jpg|jpeg|png|webp)$/i.test(path)) {
    return new Response("Only image files are supported", { 
      status: 400,
      headers: { "Content-Type": "text/plain" }
    });
  }

  try {
    // 优先从 R2 存储桶读取（支持本地开发和生产环境）
    if (env.MY_BUCKET) {
      const object = await env.MY_BUCKET.get(path);
      
      if (object) {
        // 从 R2 读取成功，返回图片
        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');
        
        return new Response(object.body, {
          headers
        });
      }
    }

    // 如果 R2 中没有，尝试从 CDN 获取（回退方案）
    return fetch(`${IMAGE_BASE_URL}${path}`, {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
      }
    });
  } catch (error) {
    console.error('获取图片失败:', error);
    
    // 出错时尝试从 CDN 获取
    return fetch(`${IMAGE_BASE_URL}${path}`, {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
      }
    });
  }
}
