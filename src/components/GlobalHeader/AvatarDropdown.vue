<template>
  <a-dropdown v-if="currentUser && currentUser.userName" placement="bottomRight">
    <span class="ant-pro-account-avatar">
      <a-avatar
        size="small"
        src="https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png"
        class="antd-pro-global-header-index-avatar"
      />
      <span>{{ currentUser.userName }}</span>
    </span>
    <template v-slot:overlay>
      <a-menu class="ant-pro-drop-down menu" :selected-keys="[]">
        <a-menu-item v-if="menu" key="settings" @click="handleExchangePW">
          <a-icon type="setting" />
          修改密码
        </a-menu-item>
        <a-menu-divider v-if="menu" />
        <a-menu-item key="logout" @click="handleLogout">
          <a-icon type="logout" />
          退出登录
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
  <span v-else>
    <a-spin size="small" :style="{ marginLeft: 8, marginRight: 8 }" />
  </span>
</template>

<script>
import { Modal } from 'ant-design-vue'

export default {
  name: 'AvatarDropdown',
  props: {
    currentUser: {
      type: Object,
      default: () => null
    },
    menu: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    handleToCenter() {
      this.$router.push({ path: '/account/center' })
    },
    handleExchangePW() {
      this.$router.push({ path: '/user/reset' })
    },
    handleLogout(e) {
      Modal.confirm({
        title: '消息',
        content: '你确定要退出登录吗？',
        onOk: () => {
          return this.$store.dispatch('Logout').then(() => {
            this.$router.push({ name: 'login' })
          })
        },
        onCancel() {}
      })
    }
  }
}
</script>

<style lang="less" scoped>
.ant-pro-drop-down {
  /deep/ .action {
    margin-right: 8px;
  }
  /deep/ .ant-dropdown-menu-item {
    min-width: 160px;
  }
}
</style>
