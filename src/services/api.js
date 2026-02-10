/**
 * API 服务模块
 *
 * 统一使用新 API（/api/list/、/api/images/），保证 5173 与 8788 布局一致。
 * - 生产 / 8788 / 5173 均走新 API；5173 需通过 Vite 代理到 8788 或同源。
 */

const useNewAPI = true;

/**
 * 获取 R2 存储桶目录列表
 * @param {string} path - 目录路径，如 "lyrics"、"photos" 等
 * @returns {Promise<Object>} 包含 files 和 folders 的列表数据
 */
export const getR2List = async (path = "") => {
  // 新 API 结构：/api/list/lyrics
  // 旧 API 结构：/api/lyrics
  const url = useNewAPI ? `/api/list/${path}` : `/api/${path}`;
  
  const response = await fetch(url);
  if (!response.ok) throw new Error("读取 R2 列表失败");
  return await response.json();
};

/**
 * 获取图片 URL
 * @param {string} path - 图片路径，如 "lyrics/image.jpg"
 * @param {boolean} preview - 是否返回预览图（WASM 压缩）
 * @returns {string} 图片 URL
 */
export const getImageUrl = (path, preview = false) => {
  // 新 API 结构：/api/images/lyrics/xxx.jpg
  // 旧 API 结构：/api/lyrics/xxx.jpg
  const url = useNewAPI ? `/api/images/${path}` : `/api/${path}`;
  return preview ? `${url}?preview` : url;
};
