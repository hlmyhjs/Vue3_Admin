import request from '@/utils/request'
import { parseStrEmpty } from '@/utils/function'

// 查询商品列表
export function listGoods(query) {
  return request({
    url: '/goods/list',
    method: 'get',
    params: query
  })
}

// 查询商品详细
export function getGoods(goodsId) {
  return request({
    url: '/goods/' + parseStrEmpty(goodsId),
    method: 'get'
  })
}

// 获取分类列表
export function getKindList() {
  return request({
    url: '/mall/category/list',
    method: 'get'
  })
}

// 新增商品
export function addGoods(data) {
  return request({
    url: '/goods/create',
    method: 'post',
    data: data
  })
}

// 修改商品
export function updateGoods(data) {
  return request({
    url: '/goods/update',
    method: 'patch',
    data: data
  })
}

// 删除商品
export function delGoods(ids) {
  return request({
    url: '/goods/remove/' + ids,
    method: 'delete'
  })
}

// 商品状态修改
export function changeUserStatus(id, status) {
  const data = {
    id,
    status
  }
  return request({
    url: '/goods/changeStatus',
    method: 'put',
    data: data
  })
}

// 图片上传
export function uploadAvatar(data) {
  return request({
    url: '/upload/picture',
    method: 'post',
    data: data
  })
}
