import { constantRouterMap } from '@/config/router.config'
import { generatorRouter } from '@/router/generator-routers'
import { filterActiveRule, isType, listToTree } from '@/utils/util'

const permission = {
  state: {
    routers: constantRouterMap,
    addRouters: [],
    activeRules: {},
    rawDynamicRouter: []
  },
  mutations: {
    SET_ROUTERS: (state, routers) => {
      state.addRouters = routers
      state.routers = constantRouterMap.concat(routers)
    },
    SET_ACTIVE_RULES: (state, rules) => {
      state.activeRules = rules
    },
    SET_RAW_ROUTERS: (state, routers) => {
      state.rawDynamicRouter = routers
    }
  },
  actions: {
    GenerateRoutes({ commit }, rawDynamicRouter) {
      return new Promise(async (resolve, reject) => {
        const childrenNav = []
        // if (isType(rawDynamicRouter, 'Array') && rawDynamicRouter.length > 0) {
        if (isType(rawDynamicRouter, 'Array') && rawDynamicRouter.length) {
          listToTree(rawDynamicRouter, childrenNav, 0)
          const fmtDynamicRouter = generatorRouter(childrenNav)
          const activeRoutePaths = filterActiveRule(fmtDynamicRouter)
          // 匹配到的子应用的路由，用于qiankun触发匹配子应用机制
          commit('SET_ACTIVE_RULES', activeRoutePaths)
          // 利用 vue.addRoutes 添加的路由
          commit('SET_ROUTERS', fmtDynamicRouter)
          resolve()
        } else {
          reject(new Error('NOT_INIT_MENU'))
        }
      })
    }
  }
}

export default permission
