import { http2 } from '@/utils/request'

const request = http2
export default {

  // 保存Sku
  saveSkuInfo(skuForm) {
    return request({
      url: 'saveSkuInfo',
      method: 'post',
      data: skuForm
    })
  }
}
