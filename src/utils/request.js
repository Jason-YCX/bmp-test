import axios from 'axios'
import store from '@/store'
import notification from 'ant-design-vue/es/notification'
import message from 'ant-design-vue/es/message'
import { VueAxios } from './axios'
import { tokenStore } from '@/utils/util'

const defaultConfig = {
  // API 请求的默认前缀
  baseURL: process.env.VUE_APP_API_BASE_URL,
  timeout: 300000 // 请求超时时间
}

// 创建 axios 实例
// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'
// axios.defaults.crossDomain = true
// axios.defaults.withCredentials = true
const instance = axios.create()
// 异常拦截处理器
const errorHandler = error => {
  if (error.response) {
    const data = error.response.data
    const { token } = store.state.user
    if (error.response.status === 403) {
      notification.error({
        message: 'Forbidden',
        description: data.message
      })
    }
    if (error.response.status === 401) {
      notification.error({
        message: '未经授权',
        description: '授权验证失败'
      })
      if (token) {
        store.dispatch('Logout').then(() => {
          setTimeout(() => {
            window.location.reload()
          }, 1500)
        })
      }
    }
    notification.error({
      message: '请求错误',
      description: ((error.response || {}).data || {}).message || '请求出现错误，请稍后再试',
      duration: 4
    })
  }
  return Promise.reject(error)
}

// request interceptor
instance.interceptors.request.use(config => {
  const { needAppId = true } = config
  const token = store.state.user.token || tokenStore.get()
  // 如果 token 存在
  // 让每个请求携带自定义 token 请根据实际情况自行修改
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  const { appId } = store.state.app
  // 如果`url`不需要配置`appid`则跳过
  needAppId && (config.url += `${config.url.includes('?') ? '&' : '?'}appId=${config.appId || appId}`)
  return config
}, errorHandler)

// response interceptor
instance.interceptors.response.use(response => {
  const {
    data: { code, errorMsg }
  } = response
  if (code !== 0) message.error(errorMsg)
  return response.data
}, errorHandler)

const request = (options = {}) => {
  return instance({ ...defaultConfig, ...options })
}

const installer = {
  vm: {},
  install(Vue) {
    Vue.use(VueAxios, request)
  }
}

export default request

export { installer as VueAxios, request as axios }
