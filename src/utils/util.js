import md5 from 'md5'
import storage from 'store'
import { storeAppidKey, storeTokenKey } from '@/config/defaultSettings'

export function timeFix() {
  const time = new Date()
  const hour = time.getHours()
  return hour < 9 ? '早上好' : hour <= 11 ? '上午好' : hour <= 13 ? '中午好' : hour < 20 ? '下午好' : '晚上好'
}

/**
 * 触发 window.resize
 */
export function triggerWindowResizeEvent() {
  const event = document.createEvent('HTMLEvents')
  event.initEvent('resize', true, true)
  event.eventType = 'message'
  window.dispatchEvent(event)
}

export function handleScrollHeader(callback) {
  let timer = 0

  let beforeScrollTop = window.pageYOffset
  callback = callback || function() {}
  window.addEventListener(
    'scroll',
    event => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        let direction = 'up'
        const afterScrollTop = window.pageYOffset
        const delta = afterScrollTop - beforeScrollTop
        if (delta === 0) {
          return false
        }
        direction = delta > 0 ? 'down' : 'up'
        callback(direction)
        beforeScrollTop = afterScrollTop
      }, 50)
    },
    false
  )
}

export function isIE() {
  const bw = window.navigator.userAgent
  const compare = s => bw.indexOf(s) >= 0
  const ie11 = (() => 'ActiveXObject' in window)()
  return compare('MSIE') || ie11
}

/**
 * Remove loading animate
 * @param id parent element id or class
 * @param timeout
 */
export function removeLoadingAnimate(id = '', timeout = 1500) {
  if (id === '') {
    return
  }
  setTimeout(() => {
    document.body.removeChild(document.getElementById(id))
  }, timeout)
}

export function requestOk(response) {
  const { code, errorMsg, result } = response
  const ok = code === 0
  const ctx = ok ? result : errorMsg || '请求错误'
  return [ok, ctx]
}

export function filterActiveRule(dynamicRouterMap) {
  const activePaths = {}
  const loopSearchMicroRoute = routes => {
    routes.forEach(r => {
      if (r.meta && r.meta.isMicro) {
        if (typeof r.meta.isMicro !== 'string') console.warn('`isMicro 字段是 String 类型`')
        const microCollect = activePaths[r.meta.isMicro]
        if (microCollect && isType(microCollect, 'Array')) {
          microCollect.push(r.path)
        } else {
          activePaths[r.meta.isMicro] = [r.path]
        }
      }

      if (r.children && r.children.length > 0) {
        loopSearchMicroRoute(r.children)
      }
    })
  }
  loopSearchMicroRoute(dynamicRouterMap)
  return activePaths
}

/**
 * 数组转树形结构
 * @param list 源数组
 * @param tree 树
 * @param parentId 父ID
 */
export const listToTree = (list, tree, parentId) => {
  list.forEach(item => {
    // 判断是否为父级菜单
    if (item.parentId === parentId) {
      const child = {
        ...item,
        key: item.key || item.name,
        children: []
      }
      // 迭代 list， 找到当前菜单相符合的所有子菜单
      listToTree(list, child.children, item.id)
      // 删掉不存在 children 值的属性
      if (child.children.length <= 0) {
        delete child.children
      }
      // 加入到树中
      tree.push(child)
    }
  })
}

export const encrypt = value => md5(value + 'e840ccf6-3c47-4a1b-b580-377a1a0d89bc').toUpperCase()

// 生成随机字符串
export const generatorRandomKey = desc => {
  return `${Date.parse(new Date()) / 1000}-${Math.random()
    .toString(36)
    .slice(-9)}-${desc}`
}

/**
 * 判断原始数据类型
 * @param {*} date 要判断的数据
 * @param {*} type 预判断的类型
 */
export function isType(date, type) {
  const originType = Object.prototype.toString.call(date)
  return originType.slice(8, -1) === type
}

class Store {
  constructor(options) {
    const { expired = 7 * 24 * 60 * 60 * 1000, key } = options
    this.expired = expired
    this.key = key
  }

  get() {
    return storage.get(this.key) || undefined
  }

  del() {
    storage.remove(this.key)
  }

  set(ctx) {
    ctx ? storage.set(this.key, ctx, this.expired) : this.del()
  }
}

export const tokenStore = new Store({ key: storeTokenKey })
export const appidStore = new Store({ key: storeAppidKey })
