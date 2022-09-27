import request from '@/utils/request'
import { parseStrEmpty } from '@/utils/function'

const URL = '/mall/order/'
// 获取订单列表
export function list(query) {
  return request({
    url: URL + 'list',
    method: 'get',
    params: query
  })
}

// 查询订单详情
export function detail(id) {
  return request({
    url: URL + parseStrEmpty(id) + '/detail',
    method: 'get'
  })
}

// 订单发货
export function deliverGoods(data) {
  return request({
    url: URL + 'update',
    method: 'patch',
    data: data
  })
}

// 删除订单
export function remove(ids) {
  if (ids === 1) return
  return request({
    url: URL + ids + '/remove',
    method: 'delete'
  })
}
