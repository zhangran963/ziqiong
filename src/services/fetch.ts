// export interface IRequest {
//   (url: string, config?: RequestInit | undefined): Promise<any>
//   get?: IRequest
// }

// export const request: IRequest = (url, config) => {
//   url = `/api${url}`
//   return fetch(url, config)
//     .then((res) => {
//       if (!res.ok) {
//         throw Error('接口请求异常')
//       }
//       return res.json()
//     })
//     .catch((error) => {
//       return Promise.reject(error)
//     })
// }

/**
 * GET请求
 */
// request.get = (url, config) => {
//   return request(url, { method: 'GET', ...config })
// }

export async function request<TData = any>(url: string, config?: RequestInit): Promise<TData> {
  const response = await fetch(`/api${url}`, config)
  return await response.json()
}
