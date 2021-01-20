<template>
  <draggable
    v-bind="dragOptions"
    tag="div"
    class="item-container"
    :list="list"
    :value="value"
    @input="emitter"
    :move="handleMove"
  >
    <div class="item-group" :key="el.path" v-for="el in realValue">
      <a-popover
        :title="el.meta.title"
        :visible="el.showAttribute"
        trigger="click"
        @visibleChange="visibleChange(el, $event)"
      >
        <a-card bordered hoverable>
          <a-card-meta :description="el.meta.title">
            <NestedIcon slot="avatar" :icon="el.meta.icon" />
          </a-card-meta>
          <div class="hidden-icon-wrap" v-if="el.children.length > 0" @click.stop="handleFoldStatus(el)">
            <a-icon :type="el._show ? 'up' : 'down'"></a-icon>
          </div>
        </a-card>
        <div slot="content" style="width: 240px">
          <a-tag @click.stop="copyRoutePath(el.path)">
            {{ el.path }}
          </a-tag>
          <a-divider style="margin: 12px 0" dashed />
          <a-input addon-before="标题" size="small" class="common-row" v-model="el.backup.meta.title"></a-input>
          <a-input addon-before="图标" size="small" class="common-row" v-model="el.backup.meta.icon"></a-input>
          <a-divider style="margin: 12px 0" dashed />
          <a-row justify="space-between" type="flex" class="common-row">
            <a-col>在菜单栏中隐藏</a-col>
            <a-col><a-switch size="small" v-model="el.backup.hidden" /></a-col>
          </a-row>
          <a-row justify="space-between" type="flex" class="common-row">
            <a-col>是否在saas版中显示</a-col>
            <a-col><a-switch size="small" v-model="el.backup.copy" /></a-col>
          </a-row>
          <a-row justify="space-between" type="flex" class="common-row">
            <a-col>在面包屑中隐藏</a-col>
            <a-col><a-switch size="small" v-model="el.backup.meta.hiddenHeaderContent" /></a-col>
          </a-row>
          <a-row justify="space-between" type="flex" class="common-row">
            <a-col>缓存路由</a-col>
            <a-col><a-switch size="small" v-model="el.backup.meta.keepAlive" /></a-col>
          </a-row>
          <a-row justify="space-between" type="flex" class="common-row">
            <a-col>重定向</a-col>
            <a-col><a-switch size="small" v-model="el.backup.needRedirect" /></a-col>
          </a-row>
          <a-input v-if="el.backup.needRedirect" size="small" class="common-row" v-model="el.backup.redirect"></a-input>
          <a-row justify="space-between" type="flex" class="common-row">
            <a-col>重置路由名</a-col>
            <a-col><a-switch size="small" v-model="el.backup.needRename" /></a-col>
          </a-row>
          <a-input v-if="el.backup.needRename" size="small" class="common-row" v-model="el.backup.name"></a-input>
          <a-divider style="margin: 12px 0" dashed />
          <a-button type="primary" block size="small" @click="changeRouteInfo(el)"> 确定 </a-button>
        </div>
      </a-popover>
      <nested class="item-sub" :list="el.children" :needJudgeMove="needJudgeMove" v-show="el._show" />
    </div>
  </draggable>
</template>

<script>
import draggable from 'vuedraggable'
import { backupRouteInfo } from './utils'
import { NestedIcon } from './component'

export default {
  name: 'Nested',
  inject: ['currentDynamicRouter'],
  data() {
    return {}
  },
  props: {
    value: {
      required: false,
      type: Array,
      default: null
    },
    list: {
      required: false,
      type: Array,
      default: null
    },
    needJudgeMove: Boolean
  },
  components: {
    draggable,
    NestedIcon
  },
  computed: {
    dragOptions() {
      return {
        animation: 0,
        group: 'people',
        disabled: false,
        ghostClass: 'ghost'
      }
    },
    realValue() {
      return this.value ? this.value : this.list
    },
    currentDynamicPaths() {
      const { value } = this.currentDynamicRouter
      const paths = []
      const loopSearch = routes => {
        routes.forEach(r => {
          paths.push(r.path)
          if (r.children && r.children.length > 0) {
            loopSearch(r.children)
          }
        })
      }
      loopSearch(value)
      return paths
    }
  },
  methods: {
    copyRoutePath(path) {
      this.$copyText(path).then(
        () => this.$message.success(`复制路径成功`),
        () => this.$message.error(`复制路径失败`)
      )
    },
    visibleChange(route, visible) {
      route.showAttribute = visible
      if (visible) backupRouteInfo(route)
      else route.backup = { meta: {} }
    },
    changeRouteInfo(route) {
      for (const key in route.backup) {
        const backupValue = route.backup[key]
        route[key] = backupValue
      }
      route.showAttribute = false
    },
    handleMove(e) {
      if (!this.needJudgeMove) return true
      const { element: moveBlock } = e.draggedContext
      const paths = [moveBlock.path]
      const loop = routes => {
        routes.forEach(r => {
          paths.push(r.path)
          if (r.children && r.children.length > 0) {
            loop(r.children)
          }
        })
      }
      if (moveBlock.children && moveBlock.children.length > 0) loop(moveBlock.children)
      const len = paths.length
      for (let i = 0; i < len; i++) {
        if (this.currentDynamicPaths.includes(paths[i])) {
          return false
        }
      }
      return true
    },
    emitter(value) {
      this.$emit('input', value)
    },
    handleFoldStatus(el) {
      this.$set(el, '_show', !el._show)
    }
  }
}
</script>

<style lang="less" scoped>
.item-container {
  margin: 0;
  /deep/ .ant-card-bordered {
    margin-bottom: 5px;
  }
  /deep/ .ant-card-body {
    padding: 10px;
    display: flex;
    align-items: center;
    .ant-card-meta {
      flex: 1;
    }
  }

  .hidden-icon-wrap {
    width: 30px;
    text-align: end;
  }
}
.item-sub {
  margin: 0 0 0 2rem;
}

.common-row {
  margin-bottom: 5px;
}

.icons {
  display: flex;
  justify-content: flex-end;
  flex: 1;
}
</style>
