<template>
  <div class="setting-drawer">
    <a-drawer width="600" placement="right" @close="onClose" :closable="false" :visible="visible">
      <div class="setting-drawer-index-content" style="height: 100%">
        <menu-settings />
      </div>
      <div class="setting-drawer-index-handle" @click="toggle" slot="handle">
        <a-icon type="tool" v-if="!visible" />
        <a-icon type="close" :style="{ fontSize: '16px' }" v-else />
      </div>
    </a-drawer>
  </div>
</template>

<script>
import MenuSettings from './MenuSettings'
export default {
  name: 'UtilsDrawer',
  components: {
    MenuSettings
  },
  data() {
    return {
      visible: false
    }
  },
  methods: {
    onClose() {},
    toggle() {
      this.visible = !this.visible
    }
  }
}
</script>

<style lang="less" scoped>
/deep/ .ant-drawer-body {
  height: 100%;
}

.setting-drawer-index-content {
  .setting-drawer-index-blockChecbox {
    display: flex;

    .setting-drawer-index-item {
      margin-right: 16px;
      position: relative;
      border-radius: 4px;
      cursor: pointer;

      img {
        width: 48px;
      }

      .setting-drawer-index-selectIcon {
        position: absolute;
        top: 0;
        right: 0;
        width: 100%;
        padding-top: 30px;
        padding-left: 24px;
        height: 100%;
        color: #1890ff;
        font-size: 14px;
        font-weight: 700;
      }
    }
  }
  .setting-drawer-theme-color-colorBlock {
    width: 20px;
    height: 20px;
    border-radius: 2px;
    float: left;
    cursor: pointer;
    margin-right: 8px;
    padding-left: 0px;
    padding-right: 0px;
    text-align: center;
    color: #fff;
    font-weight: 700;

    i {
      font-size: 14px;
    }
  }
}

.setting-drawer-index-handle {
  position: absolute;
  top: 300px;
  background: rgb(19, 194, 194);
  width: 48px;
  height: 48px;
  right: 600px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  pointer-events: auto;
  z-index: 1;
  text-align: center;
  font-size: 16px;
  border-radius: 4px 0 0 4px;

  i {
    color: rgb(255, 255, 255);
    font-size: 20px;
  }
}
</style>
