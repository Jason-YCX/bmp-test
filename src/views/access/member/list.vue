<template>
  <a-card :bordered="false">
    <a-row type="flex" align="middle" justify="space-between">
      <a-col>
        <a-button type="primary" @click="go2Detail">新增成员</a-button>
      </a-col>
      <a-col>
        <a-input-search
          placeholder="用户名/手机号"
          enter-button="搜索"
          @search="onSearch"
          :loading="searchLoading"
          v-model="indistinct"
        ></a-input-search>
      </a-col>
    </a-row>
    <s-table
      style="margin-top: 30px"
      :rowKey="r => r.id"
      :columns="memberTableColumns"
      :data="getMemberList"
      showPagination="auto"
      ref="table"
    >
      <template #index="text, record, index">
        <span>{{ index + 1 }}</span>
      </template>
      <template #status="text, record, index">
        <a-badge color="volcano" text="已禁用" v-if="record.status === 0" />
        <a-badge color="green" text="使用中" v-else />
      </template>
      <template #action="text, record, index">
        <span>
          <a @click="viewDetail(record.id)">编辑</a>
          <a-divider type="vertical" />
          <span @click="changeStatus(record.id, record.status)">
            <a v-if="record.status === 0">启用</a>
            <span class="danger-action" v-else>禁用</span>
          </span>
        </span>
      </template>
    </s-table>
  </a-card>
</template>

<script>
import { STable } from '@/components'
import { memberTableColumns } from '../utils'
import mixin from '../mixin'

export default {
  name: 'MemberList',
  components: {
    STable
  },
  mixins: [mixin],
  data() {
    return {
      searchLoading: false,
      indistinct: '',
      memberTableColumns
    }
  },
  methods: {
    onSearch() {
      this.$refs.table.refresh(true)
    }
  }
}
</script>
<style lang="less" scoped>
@import '~ant-design-vue/dist/antd.less';
.danger-action {
  color: @error-color;
  cursor: pointer;
}
</style>
