import { isType } from '@/utils/util'

/**
 * 因为拖拽组件要实现嵌套，必须要有一个空数组，
 * 对于没有子路由的，这里添加一个空的数组
 * @param {*} menus
 */
export function addEmptyChild(menus) {
  for (let i = 0; i < menus.length; i++) {
    const curentMenu = menus[i]
    if (curentMenu.children) {
      addEmptyChild(curentMenu.children)
    } else {
      curentMenu.children = []
    }
  }
}

export function removeEmptyChild(menus) {
  for (let i = 0; i < menus.length; i++) {
    const curentMenu = menus[i]
    if (isType(curentMenu.children, 'Array')) {
      if (curentMenu.children.length === 0) delete curentMenu.children
      else removeEmptyChild(curentMenu.children)
    }
  }
}

export function backupRouteInfo(route) {
  const backup = {}
  for (const key in route) {
    const notBackupFied = ['children', 'component', 'backup']
    if (!notBackupFied.includes(key)) {
      try {
        backup[key] = JSON.parse(JSON.stringify(route[key]))
      } catch (err) {
        console.error('你的路由中似乎存在不能被JSON解析的字段，请不要使用函数模式传参！')
        console.error(err)
      }
    }
  }
  route.backup = backup
}

/**
 * 对传入路由的参数做备份处理
 * @param {*} routes 需要做备份处理的路由数组
 * @param {*} isMicro 为每一个路由注入微前端的项目名，为了启动qiankun使用
 */
export function handleInputRoutes(routes, isMicro = false) {
  for (let i = 0; i < routes.length; i++) {
    const curentMenu = routes[i]
    if (isMicro) {
      curentMenu.meta.isMicro = isMicro
    }
    curentMenu.backup = { meta: {} }
    curentMenu.needRedirect = !!curentMenu.redirect
    curentMenu.needRename = false
    curentMenu.showAttribute = false
    curentMenu.copy = curentMenu.copy === undefined ? true : curentMenu.copy
    if (curentMenu.children) {
      handleInputRoutes(curentMenu.children, isMicro)
    } else {
      curentMenu.children = []
    }
  }
  return routes
}

/**
 * 删去在 `handleInputRoutes` 中的配置字段
 * @param {*} routes
 */
export function handleOutputRouters(routes) {
  for (let i = 0; i < routes.length; i++) {
    const curentMenu = routes[i]
    delete curentMenu.needRedirect
    delete curentMenu.needRename
    delete curentMenu.showAttribute
    delete curentMenu.backup
    if (curentMenu.children && curentMenu.children.length > 0) {
      curentMenu.hideChildrenInMenu = curentMenu.children.every(item => item.hidden)
      handleOutputRouters(curentMenu.children)
    } else {
      delete curentMenu.children
    }
  }
  return routes
}
