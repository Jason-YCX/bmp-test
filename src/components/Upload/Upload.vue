<template>
  <div style="display: flex">
    <a-upload
      :fileList="fileList"
      :customRequest="_customRequest"
      :beforeUpload="_beforeUpload"
      :multiple="true"
      listType="picture-card"
      @change="handleChange"
      @preview="handlePreview"
      :disabled="disabled"
    >
      <div v-if="fileList.length < maxLen">
        <a-icon type="plus" />
        <div class="ant-upload-text">上传</div>
      </div>
    </a-upload>
    <a-modal :visible="previewVisible" :footer="null" @cancel="handleCancel">
      <img alt="example" style="width: 100%" :src="previewImage" />
    </a-modal>
  </div>
</template>

<script>
import axios from 'axios'
import message from 'ant-design-vue/es/message'

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })
}

export default {
  name: 'SUpload',
  props: {
    beforeUpload: Function,
    customRequest: Function,
    defaultValue: {
      type: Array,
      validator(val) {
        if (!val || val.length === 0) {
          return true
        } else {
          const fail = val.some((v) => !v.uid || !v.name || !v.url)
          if (fail)
            console.error('SUpload组件的`value`字段中的数组的对象格式为 {uid: String, name: String, url: String}')
          return !fail
        }
      },
    },
    value: Array,
    maxSize: Number,
    maxLen: {
      type: Number,
      default: 10000,
    },
    accpetType: Array,
    limitRect: Boolean,
    widthRange: {
      type: Array,
      default() {
        return [0, 1000]
      },
    },
    heightRange: {
      type: Array,
      default() {
        return [0, 1000]
      },
    },
    disabled: Boolean,
    url: {
      type: String,
      required: true,
    },
    headers: Object,
  },
  data() {
    return {
      previewVisible: false,
      previewImage: '',
      fileList: this.value,
      oversize: [],
      overNum: false,
    }
  },
  model: {
    prop: 'value',
    event: 'change',
  },
  watch: {
    defaultValue(val) {
      this.fileList = val
      this.$emit('change', val)
    },
  },
  methods: {
    _beforeUpload(file, files) {
      if (typeof this.beforeUpload === 'function') return this.beforeUpload(file, files)
      // 默认操作
      const hasUploadLen = this.value ? this.value.length : 0
      if (files.length + this.value.length > this.maxLen) {
        !this.overNum && message.error('超出最大上传数量', 2, () => (this.overNum = false))
        this.overNum = true
        return false
      }
      if (this.accpetType.length > 0 && !this.accpetType.includes(file.type)) {
        message.error(`${file.name}的格式错误`)
        file.status = 'error'
        file.response = '上传失败：格式错误'
        return false
      }
      if (typeof this.maxSize === 'number' && file.size / 1024 / 1024 > this.maxSize) {
        message.error(`${file.name}的资源大小超过限制`)
        file.status = 'error'
        file.response = '上传失败：资源大小超过限制'
        return false
      }
      return this.checkImageWH(file)
    },

    _customRequest(options) {
      if (typeof this.customRequest === 'function') return this.customRequest(options)
      const { url, headers } = this
      // 默认操作
      const { onSuccess, onError, file, onProgress } = options
      let formData = new FormData()
      formData.append('files', file)
      axios
        .request({
          url,
          headers,
          method: 'post',
          data: formData,
          onUploadProgress: ({ total, loaded }) => {
            const percent = Math.round((loaded / total) * 100).toFixed(2)
            onProgress({ percent: Number(percent) }, file)
          },
        })
        .then((res) => {
          if (res.data.code === 0) {
            let urlList = res.data.result
            for (let i = 0; i < urlList.length; i++) {
              const detail = urlList[i]
              onSuccess(detail)
            }
          } else {
            message.error('上传错误，请重试')
            onError()
          }
        })
        .catch((err) => {
          console.error(err)
          onError()
        })
    },
    handleChange({ fileList }) {
      this.fileList = fileList.filter((f) => f.status !== undefined)
      const returnFileList = this.fileList.map((f) => ({ ...f, ...(f.response || {}) }))

      this.$emit('change', returnFileList)
    },
    handleCancel() {
      this.previewVisible = false
    },
    async handlePreview(file) {
      if (!file.url && !file.preview) {
        file.preview = await getBase64(file.originFileObj)
      }
      this.previewImage = file.url || file.preview
      this.previewVisible = true
    },

    checkImageWH(file) {
      let vm = this
      return new Promise(function (resolve, reject) {
        let filereader = new FileReader()
        filereader.onload = (e) => {
          let src = e.target.result
          const image = new Image()
          image.onload = function () {
            const pass = vm.validRect(this.width, this.height)
            if (!pass) {
              message.error('请上传符合尺寸规范的图片')
              reject()
            } else {
              resolve(pass)
            }
          }
          image.onerror = reject
          image.src = src
        }
        filereader.readAsDataURL(file)
      })
    },

    validRect(width, height) {
      const { limitRect, widthRange, heightRange } = this
      if (!limitRect) return true
      const validFn = (target, range) => {
        if (Array.isArray(range)) {
          const min = range[0]
          const max = range[1]
          if (typeof min === 'number') {
            if (target < min) return false
          }
          if (typeof max === 'number') {
            if (target > max) return false
          }
          return true
        }
        return true
      }
      const widthRight = validFn(width, widthRange)
      const heightRight = validFn(height, heightRange)
      if (!widthRight || !heightRight) return false
      return true
    },
  },
}
</script>
