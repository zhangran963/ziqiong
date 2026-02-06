import wasmModule from "./image_processor_bg.wasm?module";
import init, { process_image } from "./image_processor.js";

const IMAGE_BASE_URL = "https://store.duanziqiong.com/";

// 【推荐做法】定义一个全局 Promise。无论请求多少次，init 只会执行一次。
let wasmInitPromise = null;

const ensureWasmLoaded = async () => {
  if (!wasmInitPromise) {
    // 第一次调用时，启动初始化过程
    wasmInitPromise = init(wasmModule);
  }
  // 后续调用直接等待同一个 promise 完成
  return wasmInitPromise;
};

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // 统一去掉 /api/ 前缀
  let path = url.pathname.replace(/^\/api\//, "");

  // --- 1. 图片处理逻辑 ---
  if (/\.(jpg|jpeg|png|webp)$/i.test(path)) {
    if (url.searchParams.has("preview")) {
      try {
        const object = await env.MY_BUCKET.get(path);
        if (!object) return new Response("Not Found", { status: 404 });

        // 确保 Wasm 已就绪（仅在第一次请求时真正消耗 CPU）
        await ensureWasmLoaded();

        const buffer = await object.arrayBuffer();

        // 调用 Rust 生成预览图：宽 200, 模糊 1.0
        const processed = process_image(new Uint8Array(buffer), 200, 1.0);

        return new Response(processed, {
          headers: {
            "Content-Type": "image/jpeg",
            "Cache-Control": "public, max-age=31536000, immutable",
            "Access-Control-Allow-Origin": "*",
          },
        });
      } catch (e) {
        console.error("Rust transformation failed:", e);
        // 出错时优雅回退：直接从存储库取原图
        return fetch(`${IMAGE_BASE_URL}${path}`);
      }
    }
    // 非预览请求，直连存储库
    return fetch(`${IMAGE_BASE_URL}${path}`);
  }

  // --- 2. 目录列表逻辑 (如：/api/lyrics) ---
  const prefix = path === "" ? "" : path.endsWith("/") ? path : `${path}/`;

  try {
    const list = await env.MY_BUCKET.list({
      prefix,
      delimiter: "/",
      include: ["customMetadata"],
    });

    const responseData = {
      publicBaseUrl: `${url.origin}/api/`,
      folderPrefix: prefix,
      count: list.objects.length,
      files: list.objects
        .filter((o) => o.key !== prefix)
        .map((o) => {
          const meta = o.customMetadata || {};
          return {
            name: o.key.slice(prefix.length),
            width: meta["user-width"] ? Number(meta["user-width"]) : null,
            height: meta["user-height"] ? Number(meta["user-height"]) : null,
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
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
