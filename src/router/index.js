import Vue from 'vue'
import Router from 'vue-router'
import NProgress from 'nprogress'
import '@/components/NProgress/nprogress.less' // progress bar custom style
import notification from 'ant-design-vue/es/notification'
import store from '@/store'
import { constantRouterMap, whiteList, loginRoutePath, defaultRoutePath, microRouterMap } from '@/config/router.config'
import { setDocumentTitle, domTitle } from '@/utils/domUtil'
import { tokenStore } from '@/utils/util'
import { Micro } from '@/core/micro'

// hack router push callback
const originalPush = Router.prototype.push
Router.prototype.push = function push(location, onResolve, onReject) {
  if (onResolve || onReject) return originalPush.call(this, location, onResolve, onReject)
  return originalPush.call(this, location).catch(err => err)
}

Vue.use(Router)

let router = new Router({
  mode: 'history',
  routes: constantRouterMap
})

NProgress.configure({ showSpinner: false }) // NProgress Configuration

router.beforeEach((to, from, next) => {
  NProgress.start() // start progress bar
  to.meta && typeof to.meta.title !== 'undefined' && setDocumentTitle(`${to.meta.title} - ${domTitle}`)
  const token = tokenStore.get()
  /* has token */
  if (token) {
    if (to.path === loginRoutePath) {
      next({ path: defaultRoutePath })
      NProgress.done()
    } else {
      // 检查是否已经通过接口拿到用户信息
      if (!store.getters.account) {
        store
          .dispatch('GetUserInfo', token)
          .then(res => {
            // 获取动态路由
            const { menuList } = res
            store
              .dispatch('GenerateRoutes', menuList)
              .then(() => {
                // 根据roles权限生成可访问的路由表
                // 动态添加可访问路由表
                const { activeRules } = store.state.permission
                if (activeRules) {
                  const micro = new Micro({ apps: microRouterMap, activeRules })
                  micro.startMicro()
                }
                router.addRoutes(store.getters.addRouters)
                // 请求带有 redirect 重定向时，登录自动重定向到该地址
                const redirect = decodeURIComponent(from.query.redirect || to.path)
                if (to.path === redirect) {
                  // set the replace: true so the navigation will not leave a history record
                  next({ ...to, replace: true })
                } else {
                  // 跳转到目的路由
                  next({ path: redirect })
                }
              })
              .catch(err => {
                err = err.message || err
                console.error(err || err.message)
                if (err === 'NOT_INIT_MENU') {
                  notification.warning({
                    message: '提示',
                    description: '项目还未进行路由初始化，请设置'
                  })
                  next({ path: '/set-menu' })
                } else {
                  notification.error({
                    message: '错误',
                    description: typeof err === 'string' ? err : '获取菜单失败，请尝试重新登陆'
                  })
                  store.dispatch('Logout').then(() => {
                    next({ path: loginRoutePath, query: { redirect: to.fullPath }, replace: true })
                  })
                }
              })
          })
          .catch(() => {
            notification.error({
              message: '错误',
              description: '请求用户信息失败，请重试'
            })
            // 失败时，获取用户信息失败时，调用登出，来清空历史保留信息
            store.dispatch('Logout').then(() => {
              next({ path: loginRoutePath, query: { redirect: to.fullPath } })
            })
          })
      } else {
        next()
      }
    }
  } else {
    if (whiteList.includes(to.name)) {
      // 在免登录白名单，直接进入
      next()
    } else {
      next({ path: loginRoutePath, query: { redirect: to.fullPath } })
      NProgress.done() // if current page is login will not trigger afterEach hook, so manually handle it
    }
  }
})

router.afterEach(() => {
  NProgress.done() // finish progress bar
})

export const unmountRouter = () => {
  router = null
}

export default router
