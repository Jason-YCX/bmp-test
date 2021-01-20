<template>
  <div class="main">
    <a-form id="formLogin" class="user-layout-login" ref="formLogin" :form="form" @submit="handleSubmit">
      <a-tabs :tabBarStyle="{ textAlign: 'center', borderBottom: 'unset' }">
        <a-tab-pane key="tab1" tab="账号密码登录">
          <a-alert v-if="isLoginError" type="error" showIcon style="margin-bottom: 24px" :message="loginErrMsg" />
          <a-form-item>
            <a-input
              size="large"
              type="text"
              placeholder="账户"
              v-decorator="[
                'userName',
                {
                  rules: [{ required: true, message: '请输入帐户名' }, { validator: handleuserNameOrEmail }],
                  validateTrigger: 'change'
                }
              ]"
            >
              <a-icon slot="prefix" type="user" :style="{ color: 'rgba(0,0,0,.25)' }" />
            </a-input>
          </a-form-item>

          <a-form-item>
            <a-input-password
              size="large"
              placeholder="密码"
              v-decorator="[
                'password',
                { rules: [{ required: true, message: '请输入密码' }], validateTrigger: 'blur' }
              ]"
            >
              <a-icon slot="prefix" type="lock" :style="{ color: 'rgba(0,0,0,.25)' }" />
            </a-input-password>
          </a-form-item>

          <a-form-item class="captcha-row" v-if="needCaptcha">
            <a-input
              size="large"
              placeholder="验证码"
              v-decorator="[
                'captcha',
                { rules: [{ required: true, message: '请输入验证码' }], validateTrigger: 'blur' }
              ]"
              style="width: 200px"
            >
              <a-icon slot="prefix" type="mail" :style="{ color: 'rgba(0,0,0,.25)' }" />
            </a-input>
            <img class="captcha-img" :src="captchaImgData" @click="fetchImgCaptcha" />
          </a-form-item>
        </a-tab-pane>
      </a-tabs>

      <a-form-item>
        <a-checkbox v-decorator="['rememberMe', { valuePropName: 'checked' }]">自动登录</a-checkbox>
        <div
          :to="{ path: '/user/forget' }"
          class="forge-password"
          style="float: right"
          @click="go2Forget"
          v-if="canUpdatePw"
        >
          忘记密码
        </div>
      </a-form-item>

      <a-form-item style="margin-top: 24px">
        <a-button
          size="large"
          type="primary"
          htmlType="submit"
          class="login-button"
          :loading="state.loginBtn"
          :disabled="state.loginBtn"
          >确定</a-button
        >
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import { timeFix, encrypt } from '@/utils/util'
import { getImgCaptcha } from '@/api/login'
import config from '@/config/defaultSettings'

export default {
  data() {
    return {
      loginBtn: false,
      // login type: 0 email, 1 userName, 2 telephone
      loginType: 0,
      isLoginError: false,
      form: this.$form.createForm(this),
      state: {
        time: 60,
        loginBtn: false,
        // login type: 0 email, 1 userName, 2 telephone
        loginType: 0,
        smsSendBtn: false
      },
      loginErrMsg: '账号或者密码错误',
      captchaImgData: null,
      needCaptcha: false,
      canUpdatePw: config.isFixAppId,
      nonce: null // 跟随验证码一起请求到的随机字符串，如果验证码错误，再次请求验证码，最好也应该那第一次拿到的`none`值
    }
  },
  created() {
    // 是否需要验证码
    config.isFixAppId && this.fetchImgCaptcha()
  },
  methods: {
    ...mapActions(['Login', 'Logout']),
    fetchImgCaptcha() {
      const { nonce } = this
      getImgCaptcha({ nonce })
        .then(res => {
          const [ok, result] = this.$requestOk(res)
          if (ok) {
            const { image, needCaptcha, nonce } = result
            this.needCaptcha = needCaptcha
            this.captchaImgData = 'data:image/jpeg;base64,' + image
            if (!this.nonce) {
              this.nonce = nonce
            }
          } else this.requestFailed(new Error(result))
        })
        .catch(err => {
          this.requestFailed(err.data.message)
        })
    },
    // handler
    handleuserNameOrEmail(rule, value, callback) {
      const { state } = this
      const regex = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/
      if (regex.test(value)) {
        state.loginType = 0
      } else {
        state.loginType = 1
      }
      callback()
    },
    go2Forget() {
      this.$router.push({ name: 'forget' })
    },
    handleSubmit(e) {
      e.preventDefault()
      const {
        form: { validateFields },
        state,
        Login,
        nonce
      } = this

      state.loginBtn = true
      validateFields(['userName', 'password', 'captcha'], { force: true }, (err, values) => {
        if (!err) {
          const { userName, password: pw, captcha } = values
          const password = encrypt(pw)
          Login({ userName, password, captcha, nonce })
            .then(res => this.loginSuccess())
            .catch(err => {
              const errMsg = err.message || err.data.message
              this.isLoginError = true
              this.loginErrMsg = errMsg
              this.requestFailed(errMsg)
            })
            .finally(() => {
              state.loginBtn = false
            })
        } else {
          setTimeout(() => {
            state.loginBtn = false
          }, 600)
        }
      })
    },
    loginSuccess() {
      this.$router.push({ path: '/' })
      // 延迟 1 秒显示欢迎信息
      setTimeout(() => {
        this.$notification.success({
          message: '欢迎',
          description: `${timeFix()}，欢迎回来`
        })
      }, 1000)
      this.isLoginError = false
    },
    requestFailed(err) {
      // this.fetchImgCaptcha()
      this.$notification['error']({
        message: '错误',
        description: err || '请求出现错误，请稍后再试',
        duration: 4
      })
    }
  }
}
</script>

<style lang="less" scoped>
@import '~ant-design-vue/es/style/themes/default.less';
.user-layout-login {
  label {
    font-size: 14px;
  }

  .getCaptcha {
    display: block;
    width: 100%;
    height: 40px;
  }

  .forge-password {
    font-size: 14px;
    color: @primary-color;
    cursor: pointer;
  }

  button.login-button {
    padding: 0 15px;
    font-size: 16px;
    height: 40px;
    width: 100%;
  }

  .user-login-other {
    text-align: left;
    margin-top: 24px;
    line-height: 22px;

    .item-icon {
      font-size: 24px;
      color: rgba(0, 0, 0, 0.2);
      margin-left: 16px;
      vertical-align: middle;
      cursor: pointer;
      transition: color 0.3s;

      &:hover {
        color: #1890ff;
      }
    }

    .register {
      float: right;
    }
  }
}

.captcha-img {
  width: 120px;
  height: 40px;
  padding-left: 40px;
}

.captcha-row {
  display: flex;
  align-items: center;
  // justify-content: space-between;
}
</style>
