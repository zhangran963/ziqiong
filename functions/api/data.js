// functions/api/[[path]].js

export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    
    // 这里的 url.pathname 包含 "/api"，我们需要去掉它
    // 假设你的接口都在 /api 路径下，我们截取 /api/ 之后的部分
    let path = url.pathname.replace(/^\/api\/?/, "");

    console.log('* 访问路径:', path);

    // 1. 判断是否是文件请求
    const isFileRequest = /\.(jpg|jpeg|png|gif|webp|mp3|txt)$/i.test(path);

    // --- 逻辑 A: 返回文件 ---
    if (isFileRequest) {
        // 在 Functions 中，env.MY_BUCKET 是通过 context.env 获取的
        const object = await env.MY_BUCKET.get(path);
        if (object === null) {
            return new Response('File Not Found', { status: 404 });
        }

        const headers = new Headers();
        object.writeHttpMetadata(headers);
        // 融合模式下同源请求无需 CORS，但保留以防万一
        headers.set('Access-Control-Allow-Origin', '*');
        return new Response(object.body, { headers });
    }

    // --- 逻辑 B: 目录列表请求 ---
    const prefix = path === "" ? "" : (path.endsWith('/') ? path : `${path}/`);

    const allFiles = [];
    let cursor;
    let truncated = true;

    while (truncated) {
        const list = await env.MY_BUCKET.list({
            prefix: prefix,
            cursor: cursor,
            delimiter: '/', 
        });

        for (const object of list.objects) {
            if (object.key === prefix) continue;
            const pureName = object.key.slice(prefix.length);
            allFiles.push(pureName);
        }

        truncated = list.truncated;
        cursor = list.cursor;
    }

    // 融合模式下，Base URL 通常就是当前域名加接口前缀
    const baseUrl = `${url.origin}/api/`;

    return new Response(
        JSON.stringify(
            {
                publicBaseUrl: baseUrl,
                folderPrefix: prefix,
                count: allFiles.length,
                files: allFiles,
            },
            null,
            2,
        ),
        {
            headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        },
    );
}