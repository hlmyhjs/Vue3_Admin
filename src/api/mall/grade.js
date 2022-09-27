import request from '@/utils/request'
import { parseStrEmpty } from '@/utils/function'

const URL = '/mall/grade/'
export function list(query) {
  return request({
    url: URL + 'list',
    method: 'get',
    params: query
  })
}

export function detail(id) {
  return request({
    url: URL + parseStrEmpty(id) + '/detail',
    method: 'get'
  })
}

export function create(data) {
  return request({
    url: URL + 'create',
    method: 'post',
    data: data
  })
}

export function update(data) {
  return request({
    url: URL + 'update',
    method: 'patch',
    data: data
  })
}

export function changeStatus(id, status) {
  const data = {
    id,
    status
  }
  return request({
    url: URL + 'changeStatus',
    method: 'put',
    data: data
  })
}

export function remove(ids) {
  if (ids === 1) return
  return request({
    url: URL + ids + '/remove',
    method: 'delete'
  })
}
