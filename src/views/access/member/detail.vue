<template>
  <a-card :bordered="false">
    <a-form id="form" :form="form" @submit="handleSubmit">
      <a-form-item label="真实姓名">
        <a-input
          :disabled="isView && !isEditing"
          v-decorator="[
            'realName',
            {
              rules: [{ required: true, message: '请输入真实姓名!' }]
            }
          ]"
          style="width: 200px"
        >
        </a-input>
      </a-form-item>
      <a-form-item label="手机号">
        <a-input
          :disabled="isView && !isEditing"
          v-decorator="[
            'phone',
            {
              rules: [{ required: true, message: '请输入正确的手机号!', pattern: /^1[3456789]\d{9}$/ }]
            }
          ]"
          style="width: 200px"
        >
        </a-input>
      </a-form-item>
      <a-form-item label="账号">
        <a-input
          :disabled="isView && !isEditing"
          v-decorator="[
            'userName',
            {
              rules: [{ required: true, message: '请输入账号!' }, { validator: handleuserNameOrEmail }]
            }
          ]"
          style="width: 200px"
        >
        </a-input>
      </a-form-item>
      <a-form-item label="角色">
        <a-checkbox-group
          :disabled="isView && !isEditing"
          size="small"
          v-decorator="[
            'roleId',
            {
              rules: [{ type: 'array', required: true, message: '请选择角色!' }]
            }
          ]"
          :options="roleOptions"
        >
        </a-checkbox-group>
      </a-form-item>
      <a-form-item v-if="isView && !isEditing">
        <!-- <a-button type="primary" @click="switchEditing">修改</a-button> -->
        <a-button @click.stop.prevent="isEditing = true" type="primary" style="margin-left: 10px">修改</a-button>
        <a-button @click="goBack" style="margin-left: 10px">返回</a-button>
      </a-form-item>
      <a-form-item v-if="!isView">
        <a-button type="primary" :loading="loading" htmlType="submit">
          确认
        </a-button>
        <a-button style="margin-left: 20px" @click="goBack">返回</a-button>
      </a-form-item>
      <a-form-item v-if="isView && isEditing">
        <a-button :loading="loading" type="primary" htmlType="submit">确认</a-button>
        <a-button style="margin-left: 10px" @click="cancelEdit">取消</a-button>
      </a-form-item>
    </a-form>
  </a-card>
</template>
<script>
import {
  fetchRoleList,
  addMember as addMemberApi,
  getCmsUser as getCmsUserApi,
  updateMemberInfo as updateMemberInfoApi
} from '@/api/access'
import { fmtCheckbox } from '../utils'
let backupField = {}
export default {
  name: 'AccessMemberDetail',
  data() {
    return {
      formItemLayout: {
        labelCol: {
          xs: { span: 24 },
          sm: { span: 2 }
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 8 }
        }
      },
      loading: false,
      roleOptions: [],
      form: this.$form.createForm(this),
      isEditing: false
    }
  },
  computed: {
    // 当前是否是查看详情页面
    isView() {
      return !!this.$route.params.id
    }
  },
  async created() {
    await this.getRoleList()
    const { id } = this.$route.params
    if (id) this.getMemberDetail(id)
  },
  methods: {
    async getRoleList() {
      const response = await fetchRoleList().catch(err => err)
      const [ok, result] = this.$requestOk(response)
      if (!ok) return
      this.roleOptions = fmtCheckbox(result)
    },
    async getMemberDetail(id) {
      const response = await getCmsUserApi(id).catch(err => err)
      const [ok, result] = this.$requestOk(response)
      if (!ok) return
      const { authRoleList, realName, userName, phone } = result
      const roleId = authRoleList.map(r => r.id)
      backupField = { realName, userName, phone, roleId }
      this.form.setFieldsValue(backupField)
    },
    handleuserNameOrEmail(_, value, callback) {
      const regex = /^[0-9a-zA-Z]*$/
      if (regex.test(value)) {
        callback()
      } else {
        const errTip = '请输入以英文和数字组成的账户名！'
        callback(errTip)
      }
    },
    handleSubmit(e) {
      e.preventDefault()
      const { isView } = this
      const { id } = this.$route.params
      /* space-before-function-paren: 0 */
      this.form.validateFields(async (err, fieldsValue) => {
        if (err) return
        const { phone, realName, roleId, userName } = fieldsValue
        this.loading = true
        const api = isView ? updateMemberInfoApi : addMemberApi
        const params = { phone, realName, roleId, userName }
        if (isView) params.id = id
        const response = await api(params).catch(err => err)
        const [ok] = this.$requestOk(response)
        this.loading = false
        if (!ok) return
        this.$message.success(`${isView ? '修改' : '新增'}成员信息成功！`)
        this.$router.go(-1)
      })
    },
    goBack() {
      this.$router.go(-1)
    },
    switchEditing() {
      this.isEditing = true
    },
    cancelEdit() {
      this.isEditing = false
      this.form.setFieldsValue(backupField)
    }
  }
}
</script>
