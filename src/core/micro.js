import { registerMicroApps, addGlobalUncaughtErrorHandler, start, initGlobalState } from 'qiankun'
import { message } from 'ant-design-vue'
import store from '@/store'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 这里注册一些主子应用的初始通讯数据
// doc: https://qiankun.umijs.org/zh/api#initglobalstatestate
export const stateActions = initGlobalState({})
export class Micro {
  constructor(options) {
    const { apps, activeRules } = options
    apps.forEach(item => {
      item.activeRule = activeRules[item.name]
      item.container = item.container || '#sub-app'
      item.loader = loading => {
        store.commit('SET_MICRO_LOADING', loading)
      }
    })
    this.microApps = apps.filter(app => app.activeRule && app.activeRule.length > 0)
    if (this.microApps.length) {
      this.register()
    } else {
      console.warn('未匹配到子应用对应的路径')
    }
  }

  register() {
    registerMicroApps(this.microApps, {
      // qiankun 生命周期钩子 - 加载前
      beforeLoad: app => {
        // 加载子应用前，加载进度条
        NProgress.start()
        console.log('before load', app.name)
        return Promise.resolve()
      },
      // qiankun 生命周期钩子 - 挂载后
      afterMount: app => {
        // 加载子应用前，进度条加载完成
        NProgress.done()
        console.log('after mount', app.name)
        return Promise.resolve()
      }
    })

    addGlobalUncaughtErrorHandler(event => {
      console.error(event)
      const { message: msg } = event
      console.warn(msg)
      // 加载失败时提示
      if (msg && msg.includes('died in status LOADING_SOURCE_CODE')) {
        message.error('子应用加载失败，请检查应用是否可运行')
      }
    })
  }

  startMicro() {
    start({
      sandbox: true,
      prefetch: 'all'
    })
  }
}
