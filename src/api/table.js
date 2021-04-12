import { http1 } from '@/utils/request'

const request = http1
export function getList(params) {
  return request({
    url: '/table/list',
    method: 'get',
    params
  })
}
