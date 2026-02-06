const IMAGE_BASE_URL = "https://store.duanziqiong.com/";

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // 截取 /api/ 之后的内容
  let path = url.pathname.replace(/^\/api\/?/, "");

  // 1. 文件读取逻辑 (如：/api/lyrics/71.png)
  const isFile = /\.(jpg|jpeg|png|gif|webp|mp3|txt)$/i.test(path);
  if (isFile) {
    // 1. 构造目标 URL
    // 将 /api/lyrics/22.png 转换为 https://store.duanziqiong.com/lyrics/22.png
    const remoteUrl = `${IMAGE_BASE_URL}${path}`;

    // 2. 发起子请求
    const response = await fetch(remoteUrl, {
      method: request.method,
      headers: request.headers,
    });

    // 3. 克隆响应并修改 Header（可选）
    const newResponse = new Response(response.body, response);

    // 确保跨域和缓存设置正确
    newResponse.headers.set("Access-Control-Allow-Origin", "*");
    newResponse.headers.set("Cache-Control", "public, max-age=604800");

    return newResponse;
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
