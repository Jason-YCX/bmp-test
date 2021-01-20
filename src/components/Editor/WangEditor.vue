<template>
  <div :class="prefixCls" class="s-wang-editor">
    <div ref="editor" class="editor-wrapper"></div>
    <a-spin class="spin-wrap" v-if="spin"></a-spin>
  </div>
</template>

<script>
import WEditor from 'wangeditor'
import axios from 'axios'

export default {
  name: 'SWangEditor',
  props: {
    prefixCls: {
      type: String,
      default: 'ant-editor-wang',
    },
    // eslint-disable-next-line
    value: {
      type: String,
    },
    customUploadImg: Function,
    disabled: Boolean,
    url: {
      type: String,
      required: true,
    },
    headers: Object,
  },
  model: {
    prop: 'value',
    event: 'change',
  },
  data() {
    return {
      editor: null,
      editorContent: this.value,
      spin: false,
    }
  },
  watch: {
    disabled(val) {
      this.editor.$textElem.attr('contenteditable', !val)
    },
    value(val) {
      this.editor && this.editor.txt.html(val)
    },
  },
  mounted() {
    this.initEditor()
  },
  methods: {
    initEditor() {
      this.editor = new WEditor(this.$refs.editor)
      this.editor.customConfig.menus = [
        'head', // 标题
        'bold', // 粗体
        'fontSize', // 字号
        'fontName', // 字体
        'italic', // 斜体
        'underline', // 下划线
        'strikeThrough', // 删除线
        'foreColor', // 文字颜色
        'backColor', // 背景颜色
        'link', // 插入链接
        'list', // 列表
        'justify', // 对齐方式
        'quote', // 引用
        'emoticon', // 表情
        'image', // 插入图片
        'table', // 表格
        'video', // 插入视频
        'code', // 插入代码
      ]
      // this.editor.customConfig.uploadImgMaxSize = 1;
      this.editor.customConfig.zIndex = 100
      this.editor.customConfig.onchangeTimeout = 20
      this.editor.customConfig.uploadVideoServer = 'uploadVideo'
      this.editor.customConfig.customUploadVideo = this.editor.customConfig.customUploadImg = (files, insert) => {
        // files 是 input 中选中的文件列表
        // insert 是获取图片 url 后，插入到编辑器的方法
        // 上传代码返回结果之后，将图片插入到编辑器中
        if (typeof this.customUploadImg === 'function') return this.customUploadImg(this, files, insert)
        const { url, headers } = this
        let formData = new FormData()
        for (let i = 0; i < files.length; i++) {
          formData.append('files', files[i])
        }
        this.spin = true
        axios
          .request({
            url,
            headers,
            method: 'post',
            data: formData,
          })
          .then((res) => {
            if (res.data.code === 0) {
              let urlList = res.data.result
              for (let i = 0; i < urlList.length; i++) {
                insert(urlList[i].url)
              }
              this.spin = false
            } else {
              this.$message.error('上传异常')
              this.spin = false
            }
          })
          .catch((err) => {
            console.error(err)
            this.$message.error('上传异常')
            this.spin = false
          })
      }
      this.editor.customConfig.onchange = (html) => {
        // 编辑器为空的时候还会存在p标签，所以这里强制为空
        this.editorContent = html === '<p><br></p>' ? '' : html
        this.$emit('change', this.editorContent)
      }
      this.editor.create()
      this.editor.txt.html(this.editorContent)
      this.editor.$textElem.attr('contenteditable', !this.disabled)
    },
  },
}
</script>

<style lang="less" scoped>
.s-wang-editor {
  position: relative;
  .editor-wrapper {
    /deep/.w-e-toolbar {
      display: flex;
      padding: 0 5px;
      flex-wrap: wrap !important;
    }
  }
  .spin-wrap {
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 101;
    display: flex;
    align-items: center;
    justify-content: center;
    background: hsla(0, 0%, 100%, 0.9);
    cursor: not-allowed;
  }
}
</style>
