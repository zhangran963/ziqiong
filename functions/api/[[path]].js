export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // 截取 /api/ 之后的内容
  let path = url.pathname.replace(/^\/api\/?/, "");

  // 1. 文件读取逻辑 (如：/api/lyrics/71.png)
  const isFile = /\.(jpg|jpeg|png|gif|webp|mp3|txt)$/i.test(path);
  if (isFile) {
    const object = await env.MY_BUCKET.get(path);
    if (!object) return new Response("Not Found", { status: 404 });

    const headers = new Headers();

    // 写入 R2 自带元数据
    object.writeHttpMetadata(headers);

    // --- 强制修正逻辑 ---
    // 如果 R2 里的类型不对，我们根据文件后缀手动补全，确保浏览器认得它是图片
    if (path.endsWith(".png")) headers.set("Content-Type", "image/png");
    if (path.endsWith(".jpg") || path.endsWith(".jpeg")) headers.set("Content-Type", "image/jpeg");
    if (path.endsWith(".webp")) headers.set("Content-Type", "image/webp");
    if (path.endsWith(".gif")) headers.set("Content-Type", "image/gif");

    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Cache-Control", "public, max-age=604800");

    // 必须确保返回的是 object.body，不要做任何 .text() 转换
    return new Response(object.body, {
      headers,
      status: 200,
    });
  }

  // 2. 目录列表逻辑 (如：/api/lyrics/)
  const prefix = path === "" ? "" : path.endsWith("/") ? path : `${path}/`;

  // 【核心改动】：开启 include: ['customMetadata']
  const list = await env.MY_BUCKET.list({
    prefix,
    delimiter: "/",
    include: ["customMetadata"],
  });

  const responseData = {
    // 动态生成基础地址，方便前端拼接
    publicBaseUrl: `${url.origin}/api/`,
    folderPrefix: prefix,
    count: list.objects.length,
    files: list.objects
      .filter((o) => o.key !== prefix) // 排除目录本身
      .map((o) => {
        const meta = o.customMetadata || {};
        return {
          name: o.key.slice(prefix.length),
          // 转换为数字格式，方便瀑布流计算
          width: meta["user-width"] ? +meta["user-width"] : null,
          height: meta["user-height"] ? +meta["user-height"] : null,
          time: meta["user-original-time"] || o.uploaded.toISOString(),
          size: o.size,
        };
      }),
    folders: list.delimitedPrefixes.map((p) => p.slice(prefix.length)),
  };

  return new Response(JSON.stringify(responseData, null, 2), {
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
