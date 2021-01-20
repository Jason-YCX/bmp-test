<template>
  <div>
    <a-card :bordered="false">
      <a-row type="flex" justify="space-between" style="margin-bottom: 20px">
        <a-col>
          <a-button type="primary" @click="go2AddRole">新增角色</a-button>
        </a-col>
      </a-row>
      <s-table
        ref="roleTable"
        size="default"
        :rowKey="r => r.id"
        :columns="roleTableColumns"
        :data="getRoleList"
        showPagination="auto"
      >
        <template #index="text, record, index">
          <span>{{ index + 1 }}</span>
        </template>
        <template #members="text, record, index">
          <span>{{ record.members.join(',') || '-' }}</span>
        </template>
        <template #action="text, record, index">
          <span>
            <a @click="viewAccess(record.id)">查看权限</a>
            <a-divider type="vertical" />
            <a @click="viewMember(record.id)">查看成员</a>
          </span>
        </template>
      </s-table>
    </a-card>
    <a-modal v-model="visible" title="成员列表" :width="850" destroyOnClose>
      <s-table
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
    </a-modal>
  </div>
</template>

<script>
import { fetchRoleList } from '@/api/access'
import { STable } from '@/components'
import { roleTableColumns, memberTableColumns } from '../utils'
import mixin from '../mixin'

export default {
  name: 'RoleList',
  components: {
    STable
  },
  mixins: [mixin],
  data() {
    return {
      roleList: [],
      roleTableColumns,
      memberTableColumns,
      roleTotalCount: 0,
      roleTotalPage: 0,
      roleCurrentPage: 1,
      tableLoading: false,
      visible: false,
      getRoleList: params => fetchRoleList(params)
    }
  },
  mounted() {},
  methods: {
    go2AddRole() {
      this.$router.push({ path: '/access/role/detail' })
    },
    viewAccess(id) {
      this.$router.push({ path: `/access/role/detail/${id}` })
    },
    viewMember(id) {
      this.visible = true
      this.roleId = id
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
