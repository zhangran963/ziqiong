/**
 * 目录列表端点
 * 路由：/api/list/[[path]]
 * 
 * 功能：
 * 返回 R2 存储桶中指定路径下的文件列表和子文件夹
 * 包含文件的元数据：宽度、高度、创建时间、大小
 * 支持预生成缩略图
 */

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // 去掉 /api/list/ 前缀，获取要列出的目录路径
  let path = url.pathname.replace(/^\/api\/list\//, "");
  
  // 标准化路径：确保目录路径以 / 结尾
  const prefix = path === "" ? "" : path.endsWith("/") ? path : `${path}/`;

  try {
    // 从 R2 获取目录列表，包含自定义元数据
    const list = await env.MY_BUCKET.list({
      prefix,
      delimiter: "/",
      include: ["customMetadata"],
    });

    // 构建响应数据
    const responseData = {
      // 公共访问基础 URL
      publicBaseUrl: `${url.origin}/api/images/`,
      
      // 当前文件夹前缀
      folderPrefix: prefix,
      
      // 文件总数
      count: list.objects.length,
      
      // 文件列表（过滤掉文件夹本身和缩略图文件）
      files: list.objects
        .filter((o) => o.key !== prefix)
        .filter((o) => !o.key.includes('_thumb.'))  // 排除 _thumb.jpg/_thumb.png 等缩略图
        .map((o) => {
          const meta = o.customMetadata || {};
          const name = o.key.slice(prefix.length);
          
          // 手动解析文件名和扩展名（替代 path.parse）
          const lastDotIndex = name.lastIndexOf('.');
          const nameWithoutExt = lastDotIndex > 0 ? name.substring(0, lastDotIndex) : name;
          const ext = lastDotIndex > 0 ? name.substring(lastDotIndex) : '';
          const thumbnailName = `${nameWithoutExt}_thumb${ext}`;  // 生成缩略图名称
          
          return {
            // 文件名（相对于当前文件夹）
            name: name,
            
            // 缩略图文件名
            thumbnailName: thumbnailName,
            
            // 图片宽度（从元数据读取）
            width: meta["user-width"] ? Number(meta["user-width"]) : null,
            
            // 图片高度（从元数据读取）
            height: meta["user-height"] ? Number(meta["user-height"]) : null,
            
            // 创建时间（优先使用原始时间，否则使用上传时间）
            time: meta["user-original-time"] || o.uploaded.toISOString(),
            
            // 文件大小（字节）
            size: o.size,
          };
        }),
      
      // 子文件夹列表
      folders: list.delimitedPrefixes.map((p) => p.slice(prefix.length)),
    };

    return new Response(JSON.stringify(responseData, null, 2), {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        "Cache-Control": "public, max-age=300", // 缓存 5 分钟
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("R2 list error:", err);
    
    return new Response(
      JSON.stringify({ 
        error: err.message,
        path: prefix
      }), 
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}
