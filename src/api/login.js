import request from '@/utils/request'

const userApi = {
  Login: '/user/qyCms/login',
  Logout: '/auth/logout',
  ForgePassword: '/auth/forge-password',
  Register: '/auth/register',
  twoStepCode: '/auth/2step-code',
  SendSms: '/user/cmsUser/getVerCode',
  ResetPassword: '/user/cmsUser/resetPassword',
  // get my info
  UserInfo: '/user/cmsUser/getCmsUserByToken/v2',
  UserMenu: '/user/nav'
}

export function loginNotAppId(parameter) {
  const url = `/user/qyCms/login`
  return request({
    url,
    method: 'post',
    data: parameter,
    needAppId: false
  })
}

export function loginByAppId(parameter) {
  let url = `/user/cmsUser/login`
  // 有验证码就会有随机字符串`nonce`
  if (parameter.captcha) url += `?captcha=${parameter.captcha}`
  if (parameter.nonce) url += `&nonce=${parameter.nonce}`
  return request({
    url,
    method: 'post',
    data: parameter
  })
}

export function getSmsCaptcha(parameter) {
  return request({
    url: userApi.SendSms,
    method: 'post',
    data: parameter
  })
}

export function resetPassword(parameter) {
  return request({
    url: userApi.ResetPassword,
    method: 'post',
    data: parameter
  })
}

/**
 *
 * @param {*} params nonce - 第一次请求不用传，如果验证码验证失败，把上次的nonce带上  type - resetPwd为重设密码
 */
export function getImgCaptcha({ type = null, nonce = null }) {
  return request({
    url: '/user/cmsUser/getCaptcha',
    method: 'post',
    params: {
      type,
      nonce
    }
  })
}

export function getInfo(token) {
  return request({
    url: `${userApi.UserInfo}?jwt=${token}`,
    method: 'get'
  })
}

export function getCurrentUserNav() {
  return request({
    url: userApi.UserMenu,
    method: 'get'
  })
}

export function changePw(data) {
  return request({
    url: '/user/cmsUser/changePassword',
    method: 'post',
    data
  })
}
