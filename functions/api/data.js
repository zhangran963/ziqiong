export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  // 截取 /api/ 之后的内容作为 R2 的 key
  let path = url.pathname.replace(/^\/api\/?/, "");

  // 1. 文件读取逻辑 (如：/api/photo.jpg)
  const isFile = /\.(jpg|jpeg|png|gif|webp|mp3|txt)$/i.test(path);
  if (isFile) {
    const object = await env.MY_BUCKET.get(path);
    if (!object) return new Response("Not Found", { status: 404 });
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("Access-Control-Allow-Origin", "*");
    return new Response(object.body, { headers });
  }

  // 2. 目录列表逻辑 (如：/api/ 或 /api/folder)
  const prefix = path === "" ? "" : path.endsWith("/") ? path : `${path}/`;
  const list = await env.MY_BUCKET.list({ prefix, delimiter: "/" });

  return new Response(
    JSON.stringify({
      files: list.objects.map((o) => o.key.slice(prefix.length)),
      folders: list.delimitedPrefixes.map((p) => p.slice(prefix.length)),
    }),
    { headers: { "Content-Type": "application/json" } },
  );
}
