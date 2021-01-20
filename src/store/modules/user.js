import { loginNotAppId, getInfo, loginByAppId } from '@/api/login'
import { requestOk, tokenStore } from '@/utils/util'
import { stateActions } from '@/core/micro'
import config from '@/config/defaultSettings'

const user = {
  state: {
    token: '',
    account: '',
    info: {}
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      // 发送token给子应用
      stateActions.setGlobalState({ token })
      state.token = token
    },
    SET_ACCOUNT: (state, account) => {
      state.account = account
    },
    SET_INFO: (state, userInfo) => {
      stateActions.setGlobalState({ userInfo })
      state.info = userInfo
    }
  },

  actions: {
    // 登录
    Login({ commit }, userInfo) {
      return new Promise((resolve, reject) => {
        const loginApi = config.isFixAppId ? loginByAppId : loginNotAppId
        loginApi(userInfo)
          .then(response => {
            const [ok, result] = requestOk(response)
            if (!ok) reject(new Error(result))
            else {
              let token
              if (config.isFixAppId) {
                token = result
              } else {
                token = result.token
                const appId = result.appId
                commit('SET_APPID', appId)
              }
              tokenStore.set(token)
              commit('SET_TOKEN', token)
              resolve()
            }
          })
          .catch(error => {
            reject(error)
          })
      })
    },

    // 获取用户信息
    GetUserInfo({ commit }, token) {
      return new Promise((resolve, reject) => {
        getInfo(token)
          .then(response => {
            const result = response.result
            const { realName } = result
            commit('SET_ACCOUNT', realName)
            commit('SET_INFO', result)
            resolve(result)
          })
          .catch(error => {
            reject(error)
          })
      })
    },

    // 登出
    Logout({ commit, state }) {
      return new Promise(resolve => {
        commit('SET_TOKEN', '')
        commit('SET_ACCOUNT', '')
        tokenStore.del()
        resolve()
      })
    }
  }
}

export default user
