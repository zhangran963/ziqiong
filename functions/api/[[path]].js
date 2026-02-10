/**
 * ⚠️ 已废弃 - 兼容层
 * 
 * 此文件已被拆分为两个独立的端点：
 * - /api/images/[[path]].js - 图片处理
 * - /api/list/[[path]].js - 目录列表
 * 
 * 当前文件保留用于向后兼容旧的 API 调用
 * 建议：更新所有客户端代码使用新的端点
 */

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  // 去掉 /api/ 前缀
  let path = url.pathname.replace(/^\/api\//, "");

  // 兼容旧的图片请求：重定向到新的 /api/images/ 端点
  if (/\.(jpg|jpeg|png|webp)$/i.test(path)) {
    const newUrl = new URL(url);
    newUrl.pathname = `/api/images/${path}`;
    
    // 使用 308 永久重定向，保留请求方法和查询参数
    return Response.redirect(newUrl.toString(), 308);
  }

  // 兼容旧的列表请求：重定向到新的 /api/list/ 端点
  const newUrl = new URL(url);
  newUrl.pathname = `/api/list/${path}`;
  
  return Response.redirect(newUrl.toString(), 308);
}

