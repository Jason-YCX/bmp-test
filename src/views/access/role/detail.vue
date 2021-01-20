<template>
  <a-card :bordered="false">
    <a-row type="flex" align="middle" style="margin-bottom: 20px">
      <a-col flex="120px">角色名称：</a-col>
      <a-col flex="auto">
        <a-input placeholder="请填写角色名" v-model="roleName" :disabled="isView && !isEditing" />
      </a-col>
    </a-row>

    <a-row type="flex">
      <a-col flex="120px" style="line-height: 39px">路由权限：</a-col>
      <a-col flex="1" v-for="(item, index) in menus" :key="item.id">
        <a-tree
          checkable
          :disabled="isView && !isEditing"
          :treeData="item"
          v-model="checkedKeys4Menu[index]"
          :replaceFields="replaceFields"
        ></a-tree>
      </a-col>
    </a-row>

    <div style="display: flex;margin-top: 20px">
      <template v-if="!isView">
        <a-button :loading="loading" type="primary" @click="submit">新增</a-button>
        <a-button @click="goBack" style="margin-left: 10px">返回</a-button>
      </template>
      <template v-else-if="isView && isEditing">
        <a-button :loading="loading" type="primary" @click="submit">确认</a-button>
        <a-button style="margin-left: 10px" @click="cancelEdit">取消</a-button>
      </template>
      <template v-else>
        <a-button type="primary" @click="isEditing = true">修改</a-button>
        <a-button @click="goBack" style="margin-left: 10px">返回</a-button>
      </template>
    </div>
  </a-card>
</template>

<script>
import {
  fetchAllMenu,
  addRole as addRoleApi,
  getRoleDetail as roleDetailApi,
  updateRole as updateRoleApi
} from '@/api/access'
import { menu2treeData } from '../utils'
let defaultCheckedKeys = []
let backupName = ''
export default {
  name: 'AccessRoleAdd',
  data() {
    return {
      roleName: '',
      menus: [],
      replaceFields: {
        key: 'id'
      },
      checkedKeys4Menu: {},
      loading: false,
      operation: 'add',
      isEditing: false,
      idCollect: {}
    }
  },
  computed: {
    // 当前是否是查看详情页面
    isView() {
      return !!this.$route.params.id
    }
  },
  async created() {
    await this.getMenus()
    const { id } = this.$route.params
    if (id) this.getRoleDetail(id)
  },
  methods: {
    async getMenus() {
      const response = await fetchAllMenu().catch(err => err)
      const [ok, result] = this.$requestOk(response)
      if (!ok) return
      const idCollect = {}
      const menus = result.map((item, index) => {
        idCollect[index] = []
        menu2treeData(item, idCollect[index])
        this.$set(this.checkedKeys4Menu, index, [])
        return [item]
      })
      this.menus = menus
      this.idCollect = idCollect
    },

    goBack() {
      this.$router.go(-1)
    },

    async submit() {
      this.loading = true
      const { roleName, menus, isView } = this
      if (!roleName) return this.$message.warning('请输入角色名')
      const menuId = []
      const loopFilter = (menu, checkedKeys = []) => {
        const len = menu.length
        for (let i = 0; i < len; i++) {
          const { id, children } = menu[i]
          if (checkedKeys.includes(id)) {
            menuId.push(id)
          }
          if (children && children.length > 0) {
            const childrenIds = children.map(c => c.id)
            const parentIdIsChecked = childrenIds.some(id => checkedKeys.includes(id))
            if (parentIdIsChecked) menuId.push(id)
            loopFilter(children, checkedKeys)
          }
        }
      }
      menus.forEach((m, index) => {
        const checkedKeys = this.checkedKeys4Menu[index]
        // 挑选出每一个一级菜单被选择的`checkedKeys`的key，
        // 以及如果一个子菜单被选择，那么它的父菜单也就被选择
        loopFilter(m, checkedKeys)
      })
      const api = isView ? updateRoleApi : addRoleApi
      const params = { roleName, menuId: Array.from(new Set(menuId)) }
      if (isView) params.id = this.$route.params.id
      const response = await api(params).catch(err => err)
      const [ok] = this.$requestOk(response)
      this.loading = false
      if (!ok) return
      this.$message.success(`${isView ? '修改' : '新增'}角色信息成功！`)
      this.goBack()
    },

    async getRoleDetail(id) {
      const response = await roleDetailApi(id).catch(err => err)
      const [ok, result] = this.$requestOk(response)
      if (!ok) {
        return this.$message.error('获取角色详情失败')
      }
      const { menuList, roleName } = result
      this.roleName = roleName
      backupName = roleName
      defaultCheckedKeys = menuList.map(m => m.id)
      this.getDefaultCheckedKeys()
    },

    cancelEdit() {
      this.isEditing = false
      this.roleName = backupName
      this.getDefaultCheckedKeys()
    },

    getDefaultCheckedKeys() {
      // `key`即是每一个一级菜单的索引值
      for (const key in this.idCollect) {
        this.$set(this.checkedKeys4Menu, key, [])
        const firstClassMenuIds = this.idCollect[key]
        firstClassMenuIds.forEach(id => {
          if (defaultCheckedKeys.includes(id)) {
            this.checkedKeys4Menu[key].push(id)
          }
        })
      }
    }
  }
}
</script>
