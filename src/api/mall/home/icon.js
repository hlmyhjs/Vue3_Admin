import request from '@/utils/request'
import { parseStrEmpty } from '@/utils/function'

const prefix = '/mall/home/icon/'
export function listIcon(query) {
  return request({
    url: prefix + 'list',
    method: 'get',
    params: query
  })
}

export function getIcon(id) {
  return request({
    url: prefix + parseStrEmpty(id),
    method: 'get'
  })
}

export function addIcon(data) {
  return request({
    url: prefix + 'create',
    method: 'post',
    data: data
  })
}

export function updateIcon(data) {
  return request({
    url: prefix + 'update',
    method: 'patch',
    data: data
  })
}

export function delIcon(ids) {
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
