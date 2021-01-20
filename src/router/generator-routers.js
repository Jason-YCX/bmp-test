// eslint-disable-next-line
import { BasicLayout, BlankLayout, PageView, RouteView } from '@/layouts'
import { defaultRoutePath } from '@/config/router.config'
// 前端路由表
const constantRouterComponents = {
  // 基础页面 layout 必须引入
  BasicLayout: BasicLayout,
  BlankLayout: BlankLayout,
  RouteView: RouteView,
  PageView: PageView,
  '403': () => import(/* webpackChunkName: "error" */ '@/views/exception/403'),
  '404': () => import(/* webpackChunkName: "error" */ '@/views/exception/404'),
  '500': () => import(/* webpackChunkName: "error" */ '@/views/exception/500'),

  // exception
  Exception403: () => import(/* webpackChunkName: "fail" */ '@/views/exception/403'),
  Exception404: () => import(/* webpackChunkName: "fail" */ '@/views/exception/404'),
  Exception500: () => import(/* webpackChunkName: "fail" */ '@/views/exception/500')
}

// 前端未找到页面路由（固定不用改）
const notFoundRouter = {
  path: '*',
  redirect: '/404',
  hidden: true
}

// 根级菜单
const rootRouter = {
  name: 'index',
  path: '/',
  component: 'BasicLayout',
  redirect: defaultRoutePath,
  meta: {
    title: '首页'
  },
  children: []
}

export const generatorRouter = dynamicRouter => {
  // 外层包裹一层首页，首页的跳转地址默认使用第一个子路由
  // dynamicRouter.push(transitionPage)
  rootRouter.children = dynamicRouter
  let routers = []
  const menuNav = generator([rootRouter])
  routers = routers.concat(menuNav)
  routers.push(notFoundRouter)
  return routers
}

/**
 * 格式化树形结构数据 生成 vue-router 层级路由表
 *
 * @param routerMap
 * @param parent
 * @returns {*}
 */
export const generator = routerMap => {
  return routerMap.map(item => {
    const { title, hiddenHeaderContent, target, icon, isMicro, keepAlive = false } = item.meta || {}
    const currentRouter = {
      // 如果路由设置了 path，则作为默认 path，否则 路由地址 动态拼接生成如 /dashboard/workplace
      path: item.path,
      // 路由名称，建议唯一
      name: item.name || '',
      // 该路由对应页面的 组件 : 动态加载
      component:
        isMicro || !item.component
          ? RouteView
          : constantRouterComponents[item.component] || (() => import(`@/views/${item.component}`)),
      // 控制路由和子路由是否显示在 sidebar
      hidden: !!item.hidden,
      // 强制菜单显示为Item而不是SubItem(配合 meta.hidden)
      hideChildrenInMenu: !!item.hideChildrenInMenu,
      // 重定向地址, 访问这个路由时,自定进行重定向
      // meta: 页面标题, 菜单图标, 页面权限(供指令权限用，可去掉)
      meta: {
        title: title,
        icon: icon || undefined,
        hiddenHeaderContent: hiddenHeaderContent,
        target: target,
        permission: item.name,
        isMicro,
        keepAlive
      }
    }
    // 为了防止出现后端返回结果不规范，处理有可能出现拼接出两个 反斜杠
    if (!currentRouter.path.startsWith('http')) {
      currentRouter.path = currentRouter.path.replace('//', '/')
    }
    // 重定向
    item.redirect && (currentRouter.redirect = item.redirect)
    // 是否有子菜单，并递归处理
    if (item.children && item.children.length > 0) {
      // Recursion
      currentRouter.children = generator(item.children)
    }

    return currentRouter
  })
}
