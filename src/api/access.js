import request from '@/utils/request'

/**
 * 获取成员列表
 * @param {*} data
 */
export const fetchCmsUserList = data =>
  request({
    url: '/user/cmsUser/getCmsUserList',
    method: 'post',
    data
  })

/**
 * 获取角色列表
 * @param {*} data
 */
export const fetchRoleList = data =>
  request({
    url: '/user/auth/getRoleList',
    method: 'post',
    data
  })

export function fetchAllMenu() {
  return request({
    url: '/user/cmsUser/getMenu',
    method: 'get'
  })
}

export const addRole = data =>
  request({
    url: '/user/auth/addRole',
    method: 'post',
    data
  })

export const updateRole = data =>
  request({
    url: '/user/auth/updateRole',
    method: 'post',
    data
  })

export const addMember = data =>
  request({
    url: '/user/cmsUser/addCmsUser/v2',
    method: 'post',
    data
  })

export const getRoleDetail = id =>
  request({
    url: `/user/auth/getRole?id=${id}`,
    method: 'get'
  })

export const getCmsUser = id =>
  request({
    url: `/user/cmsUser/getCmsUser/v2`,
    method: 'post',
    data: { id }
  })

export const updateMemberInfo = data =>
  request({
    url: '/user/cmsUser/updateCmsUser/v2',
    method: 'post',
    data
  })

export const changeCmsUserStatus = id =>
  request({
    url: '/user/cmsUser/changeStatus',
    data: { id },
    method: 'post'
  })

export const getCmsUserByRole = data =>
  request({
    url: '/user/auth/getCmsUserByRole',
    method: 'post',
    data
  })

export function getAllDynamicRouter() {
  return request({
    url: '/user/cmsUser/getMenu',
    method: 'get'
  })
}

export const initAdmin = () =>
  request({
    url: '/user/auth/initAdmin',
    method: 'get'
  })

export function getMicroMenu() {
  return request({
    url: '/user/cmsUser/cmsMenuRoute',
    method: 'get'
  })
}

export function saveMenu(data) {
  return request({
    url: '/user/cmsUser/initMenu',
    method: 'post',
    data
  })
}
