<template>
  <div>
    <a-result status="403" title="未进行菜单初始化设置" sub-title="请点击右侧按钮进行菜单设置"></a-result>
    <utils-drawer v-if="showUtilsDrawer" />
  </div>
</template>

<script>
import UtilsDrawer from '@/components/UtilsDrawer'
export default {
  name: 'SetMenu',
  components: {
    UtilsDrawer
  },
  data() {
    return {
      showUtilsDrawer: process.env.VUE_APP_SET_ROUTE === 'true'
    }
  }
}
</script>
