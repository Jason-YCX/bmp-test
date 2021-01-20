import store from '@/store'
import storage from 'store'
import { APP_LANGUAGE } from '@/store/mutation-types'
import { appidStore, tokenStore } from '@/utils/util'
import config from '@/config/defaultSettings'

export default function Initializer() {
  store.commit('SET_TOKEN', tokenStore.get())
  store.commit('SET_APPID', config.isFixAppId ? config.appId : appidStore.get())
  store.dispatch('setLang', storage.get(APP_LANGUAGE, 'zh-CN'))
  // last step
}
