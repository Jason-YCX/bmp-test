<template>
  <global-footer class="footer custom-render">
    <template v-slot:links>
      <a target="_blank">语汐网络</a>
    </template>
    <template v-slot:copyright>
      <a target="_blank" href="https://growingcloud.cn/about_us/contacts/">Powered by 趣增长</a>
    </template>
  </global-footer>
</template>

<script>
import { GlobalFooter } from '@ant-design-vue/pro-layout'

export default {
  name: 'ProGlobalFooter',
  components: {
    GlobalFooter
  }
}
</script>
