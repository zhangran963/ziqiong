// 融合模式下不需要 Base URL，直接使用相对路径避免跨域
export const getR2List = async (path = "") => {
  const response = await fetch(`/api/${path}`);
  if (!response.ok) throw new Error("读取 R2 失败");
  return await response.json();
};
