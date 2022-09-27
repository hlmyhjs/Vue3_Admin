import request from '@/utils/request'
import { parseStrEmpty } from '@/utils/function'

const URL = '/mall/user/'
// 查询用户列表
export function listUser(query) {
  return request({
    url: URL + 'list',
    method: 'get',
    params: query
  })
}

// 用户等级选择下拉列表
export function levelSelectList() {
  return request({
    url: '/mall/grade/selectList',
    method: 'get'
  })
}

// 查询用户详细
export function getUser(userId) {
  return request({
    url: URL + parseStrEmpty(userId) + '/detail',
    method: 'get'
  })
}

// 新增用户
export function addUser(data) {
  return request({
    url: URL + 'create',
    method: 'post',
    data: data
  })
}

// 修改用户
export function updateUser(data) {
  return request({
    url: URL + 'update',
    method: 'patch',
    data: data
  })
}

// 删除用户
export function delUser(ids) {
  if (ids === 1) return
  return request({
    url: URL + ids + '/remove',
    method: 'delete'
  })
}

// 用户密码重置
export function resetUserPwd(id, password) {
  const data = {
    id,
    password
  }
  return request({
    url: URL + 'resetPwd',
    method: 'put',
    data: data
  })
}

// 用户状态修改
export function changeUserStatus(id, status) {
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

// 查询用户个人信息
export function getUserProfile() {
  return request({
    url: URL + 'profile',
    method: 'get'
  })
}

// 修改用户个人信息
export function updateUserProfile(data) {
  return request({
    url: URL + `${data.id}/profile`,
    method: 'patch',
    data: data
  })
}

// 用户密码重置
export function updateUserPwd(oldPassword, newPassword) {
  const data = {
    oldPassword,
    newPassword
  }
  return request({
    url: URL + 'updatePwd',
    method: 'put',
    params: data
  })
}

// 用户头像上传
export function uploadAvatar(data) {
  return request({
    // url: '/system/user/profile/avatar',
    url: '/upload/picture',
    method: 'post',
    data: data
  })
}
