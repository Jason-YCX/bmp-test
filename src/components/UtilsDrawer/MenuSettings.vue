<template>
  <div class="menu-wrap">
    <div class="menu-container">
      <div class="menu-column">
        <h3>动态路由</h3>
        <div style="padding: 0 10px">
          <nested class="col-8" v-model="serviceRoutes" />
        </div>
      </div>
      <div class="menu-column">
        <h3>可配置路由</h3>
        <a-collapse v-model="activeKey" :bordered="false">
          <a-collapse-panel
            v-for="(router, index) in bftRoutes"
            :key="`${index}`"
            :style="{ border: 0 }"
          >
            <div slot="header">
              {{ `${router.name} ${router.key || ''}`}}
              <a-tooltip :title="router.description" v-if="router.description">
                <a-icon type="question-circle"></a-icon>
              </a-tooltip>
            </div>
            <nested class="col-8" v-model="router.routes" :needJudgeMove="true" />
          </a-collapse-panel>
        </a-collapse>
      </div>
    </div>
    <div class="button-area">
      <a-button type="primary" :loading="loading" @click="handleUploadMenu">上传至数据库</a-button>
      <a-button style="margin-left: 10px" @click="copyRouter">拷贝配置</a-button>
      <a-button type="danger" style="margin-left: 10px" @click="resetRouter">重置配置</a-button>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import draggable from 'vuedraggable'
import clonedeep from 'lodash.clonedeep'
import Nested from './Nested'
import { localRoutes } from '../../config/router.config'
import { getAllDynamicRouter, getMicroMenu, saveMenu } from '@/api/access'
import { handleInputRoutes, handleOutputRouters } from './utils'
const currentDynamicRouter = Vue.observable({
  value: []
})
export default {
  name: 'NestedSettins',
  components: {
    Nested,
    draggable
  },
  data() {
    return {
      activeKey: '0',
      loading: false,
      bftRoutes: [],
      serviceRoutes: []
    }
  },
  provide() {
    return {
      currentDynamicRouter
    }
  },
  watch: {
    serviceRoutes: {
      handler(value) {
        currentDynamicRouter.value = value
      },
      deep: true,
      immediate: true
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      // 处理左侧的动态路由
      this.handleDynamicRoutes()
      // 处理右侧的备选菜单栏
      this.handleBftRoutes()
    },
    handleBftRoutes() {
      // 先处理项目自身配置在本地的路由配置
      const backupLocalRoutes = clonedeep(localRoutes)
      handleInputRoutes(backupLocalRoutes, false)
      this.bftRoutes.push({
        name: '本地路由',
        routes: backupLocalRoutes,
        description: '本地项目创建的路由'
      })
      getMicroMenu()
        .then(res => {
          const { code, result: microRoutes } = res.result
          if (code !== 0) throw new Error('获取菜单失败')
          for (const key in microRoutes) {
            const microRoute = microRoutes[key]
            microRoute.key = key
            handleInputRoutes(microRoute.routes, key)
            this.bftRoutes = this.bftRoutes.concat([microRoute])
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    async handleDynamicRoutes() {
      const response = await getAllDynamicRouter().catch(err => err)
      const [ok, rawDynamicRouter] = this.$requestOk(response)
      if (!ok) return this.$message.warning('获取路由列表失败')
      this.serviceRoutes = handleInputRoutes(clonedeep(rawDynamicRouter), false)
    },
    getStringifyRoutes() {
      const r = handleOutputRouters(clonedeep(this.serviceRoutes))
      return `${JSON.stringify(r)}`
    },
    copyRouter() {
      const r4str = this.getStringifyRoutes()
      this.$copyText(r4str).then(
        () => this.$message.success(`复制成功`),
        () => this.$message.error(`复制失败`)
      )
    },
    handleUploadMenu() {
      this.loading = true
      const r = handleOutputRouters(clonedeep(this.serviceRoutes))
      saveMenu(r)
        .then(res => {
          this.$message.success('上传成功，请刷新浏览器')
        })
        .catch(err => {
          console.log(err)
          this.$message.error(`上传失败`)
        })
        .finally(() => {
          this.loading = false
        })
    },
    resetRouter() {
      this.bftRoutes = []
      this.serviceRoutes = []
      this.init()
    }
  }
}
</script>

<style lang="less" scoped>
.menu-wrap {
  position: relative;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.menu-container {
  display: flex;
  position: relative;
  height: calc(100vh - 15%);
  width: 100%;
}

.button-area {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.menu-column {
  height: 100%;
  overflow-y: scroll;
  flex: 1;
  position: relative;
  & > h3 {
    position: -webkit-sticky; /* Safari */
    position: sticky;
    top: 0;
    z-index: 1;
    width: 100%;
    background: white;
    text-align: center;
    height: 30px;
    line-height: 30px;
    margin-bottom: 0;
  }
  .nested-container {
    padding: 10px;
  }
}
</style>
