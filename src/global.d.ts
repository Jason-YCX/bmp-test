import Vue from 'vue'

declare module 'vue/types/vue' {
  // 声明原型链属性: `this.x`
  interface Vue {
    /** 判断接口请求是否成功 */
    $requestOk: Function
    /** 域名地址 */
    $domain: String
  }
  // 声明全局属性: `Vue.xx`
  // interface VueConstructor {
  //   oo: string
  // }
}

// 声明选项属性: `export default { xxx: '' }`
// declare module 'vue/types/options' {
//   interface ComponentOptions<V extends Vue> {
//     www?: string
//   }
// }
