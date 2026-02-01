import { request } from './fetch'
import { type CosObject } from 'cos-nodejs-sdk-v5'

export interface ILyricItem extends CosObject {
  filename: string
  exp: string
  url: string
}

export const fetchLyricList = () => {
  return request<{
    code: number
    data: ILyricItem[]
  }>('/lyric/list')
}
