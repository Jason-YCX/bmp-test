import { fetchCmsUserList, changeCmsUserStatus, getCmsUserByRole } from '@/api/access'
export default {
  data() {
    return {
      getMemberList: parameter => {
        const queryParams = { indistinct: this.indistinct }
        if (this.roleId) queryParams.roleId = this.roleId
        const requestParameters = Object.assign({}, parameter, queryParams)
        return this.roleId ? getCmsUserByRole(requestParameters) : fetchCmsUserList(requestParameters)
      }
    }
  },
  methods: {
    go2Detail() {
      this.$router.push({ path: '/access/member/detail' })
    },
    viewDetail(id) {
      this.$router.push({ path: `/access/member/detail/${id}` })
    },
    async changeStatus(id, status) {
      const response = await changeCmsUserStatus(id).catch(err => err)
      const [ok] = this.$requestOk(response)
      if (!ok) return
      this.$message.success(`${status === 0 ? '启用' : '禁用'}成功`)
      this.$refs.table.refresh()
    }
  }
}
