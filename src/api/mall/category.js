import request from '@/utils/request'

const URL = '/mall/category/'
// 查询列表(所有数据)
export function listCategory(query) {
  return request({
    url: URL + 'queryList',
    method: 'get',
    params: query
  })
}

// 分页列表
export function pagingList(pageNum, query) {
  return request({
    url: URL + `pagingList`,
    method: 'get',
    params: {
      ...query,
      pageNum
    }
  })
}

// 获取所有下拉列表
export function categoryTreeList(query) {
  return request({
    url: URL + 'treeList',
    method: 'get',
    params: query
  })
}

// 添加到热门推荐
export function addToRecommend(data) {
  return request({
    url: URL + 'addToRecommend',
    method: 'put',
    data
  })
}

// 移除热门分类
export function removeRecommend(data) {
  return request({
    url: URL + 'removeRecommend',
    method: 'put',
    data
  })
}

// 获取一级下拉列表
export function categoryFirstList() {
  return request({
    url: URL + 'firstCategory',
    method: 'get'
  })
}

// 查询详细
export function getCategory(CategoryId) {
  return request({
    url: URL + CategoryId + '/detail',
    method: 'get'
  })
}

// 新增
export function addCategory(data) {
  return request({
    url: URL + 'create',
    method: 'post',
    data: data
  })
}

// 修改
export function updateCategory(data) {
  return request({
    url: URL + 'update',
    method: 'patch',
    data: data
  })
}

// 修改状态
export function changeStatus(id, status) {
  return request({
    url: URL + 'changeStatus',
    method: 'put',
    data: { id, status }
  })
}

// 修改首页展示
export function changeShowHome(id, home_show) {
  return request({
    url: URL + 'changeShowHome',
    method: 'put',
    data: { id, home_show }
  })
}

// 删除
export function delCategory(CategoryId) {
  return request({
    url: URL + CategoryId + '/remove',
    method: 'delete'
  })
}
