// eslint-disable-next-line
import draggable from 'vuedraggable'
import { UserLayout } from '@/layouts'

export const whiteList = ['login', 'forget', 'forgetResult'] // no redirect whitelist
export const loginRoutePath = '/user/login'
export const defaultRoutePath = '/goods' // 需要跳转的首页路径

// 本地项目自己配置的路由
export const localRoutes = [
  // 权限
  {
    path: '/access',
    name: 'Access',
    redirect: '/access/member',
    component: 'RouteView',
    meta: { title: '权限管理', keepAlive: true, icon: 'tool' },
    children: [
      {
        path: '/access/member',
        name: 'AccessMember',
        redirect: '/access/member/list',
        component: 'RouteView',
        meta: { title: '成员管理', keepAlive: true },
        children: [
          {
            path: '/access/member/list',
            name: 'AccessMemberList',
            component: 'access/member/list.vue',
            meta: { title: '成员列表', keepAlive: true, icon: 'tool' }
          },
          {
            path: '/access/member/detail/:id?',
            name: 'AccessMemberDetail',
            component: 'access/member/detail.vue',
            meta: { title: '成员详情', keepAlive: true, icon: 'tool' }
          }
        ]
      },
      {
        path: '/access/role',
        name: 'AccessRole',
        redirect: '/access/role/list',
        component: 'RouteView',
        meta: { title: '角色管理', keepAlive: true },
        children: [
          {
            path: '/access/role/list',
            name: 'AccessRoleList',
            component: 'access/role/list.vue',
            meta: { title: '角色列表', keepAlive: true, icon: 'tool' }
          },
          {
            path: '/access/role/detail/:id?',
            name: 'AccessRoleDetail',
            component: 'access/role/detail.vue',
            meta: { title: '角色详情', keepAlive: true, icon: 'tool' }
          }
        ]
      }
    ]
  }
]

// 接入微应用时的配置
// fix: 这里主子应用共享`draggable`组件，原因和上面的`window.Vue2`问题一样，vuedraggable存在这样的源码
//       window.Vue.component("draggable", draggableComponent); 找不到`window.Vue`报错
const microRouterConfig = [
  // 运营中台
  {
    name: 'bmp-interaction',
    entries: {
      development: 'https://hudong.yuxisoft.cn/',
      test: 'https://zxcvb.yuxisoft.cn/',
      production: 'https://hudong.yuxisoft.cn/'
    },
    props: {
      settings: {
        // 展示商品价格（金额 + 积分）的时候 是否显示金额
        payment: false,
        // 部署方式
        deployType: '11'
      }
    }
  },
  // 通用中台
  {
    name: 'bmp-common',
    entries: {
      development: 'https://bmp.yuxisoft.cn/',
      test: 'https://test.yuxisoft.cn:9955/',
      production: 'https://bmp.yuxisoft.cn/'
    },
    props: {
      draggable,
      settings: {
        orderFrom: 'integral'
      }
    }
  }
]

export const microRouterMap = microRouterConfig.map(micro => ({
  name: micro.name, // 接入的子应用的名字
  props: micro.props, // 传递给子应用的 props
  entry: micro.entries[process.env.VUE_APP_ENV] // 子应用的入口
}))

// 以下配置可不需要关系

// 基础路由，固定不变
export const constantRouterMap = [
  {
    path: '/user',
    component: UserLayout,
    redirect: '/user/login',
    hidden: true,
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Login')
      },
      {
        path: 'forget',
        name: 'forget',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Forget')
      },
      {
        path: 'reset',
        name: 'reset',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/ResetPW')
      }
    ]
  },

  // 错误页
  {
    path: '/403',
    name: 'Exception403',
    component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/403'),
    meta: { title: '403' }
  },
  {
    path: '/404',
    name: 'Exception404',
    component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/404'),
    meta: { title: '404' }
  },
  {
    path: '/500',
    name: 'Exception500',
    component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/500'),
    meta: { title: '500' }
  },

  // 菜单设置页，是一个空壳
  {
    path: '/set-menu',
    name: 'SetMenu',
    component: () => import('@/views/SetMenu'),
    meta: { title: '菜单设置' }
  }
]
