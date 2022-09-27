import request from '@/utils/request'
import { parseStrEmpty } from '@/utils/function'

const prefix = '/mall/home/banner/'
export function listBanner(query) {
  return request({
    url: prefix + 'list',
    method: 'get',
    params: query
  })
}

export function getBanner(id) {
  return request({
    url: prefix + parseStrEmpty(id),
    method: 'get'
  })
}

export function addbanner(data) {
  return request({
    url: prefix + 'create',
    method: 'post',
    data: data
  })
}

export function updateBanner(data) {
  return request({
    url: prefix + 'update',
    method: 'patch',
    data: data
  })
}

export function delBanner(ids) {
  return request({
    url: prefix + 'remove/' + ids,
    method: 'delete'
  })
}

export function changeStatus(id, status) {
  const data = {
    id,
    status
  }
  return request({
    url: prefix + 'changeStatus',
    method: 'put',
    data: data
  })
}
