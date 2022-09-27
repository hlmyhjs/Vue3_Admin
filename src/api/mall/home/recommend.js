import request from '@/utils/request'

const prefix = '/mall/home/recommend/'
export function listRecommend(query) {
  return request({
    url: prefix + 'list',
    method: 'get',
    params: query
  })
}

export function listGoods(query) {
  return request({
    url: prefix + 'goods/list/new',
    method: 'get',
    params: query
  })
}

export function addRecommend(id) {
  return request({
    url: prefix + 'add',
    method: 'put',
    data: {
      id,
      recommend: true
    }
  })
}

export function delRecommend(ids) {
  return request({
    url: prefix + 'remove',
    method: 'put',
    data: {
      id: ids,
      recommend: false
    }
  })
}

export const changeRecommend_sort = (id, recommend_sort) => {
  const data = { id, recommend_sort }
  return request({
    url: prefix + 'changeRecommend_sort',
    method: 'put',
    data
  })
}
