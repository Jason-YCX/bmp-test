<template>
  <div class="main user-layout-register">
    <h3>
      <span>忘记密码</span>
    </h3>
    <a-form ref="formRegister" :form="form" id="formRegister">
      <a-form-item>
        <a-input
          size="large"
          type="text"
          placeholder="用户名"
          v-decorator="[
            'userName',
            {
              rules: [{ required: true, message: '请输入用户名' }],
              validateTrigger: ['change', 'blur']
            }
          ]"
        ></a-input>
      </a-form-item>

      <a-popover
        placement="rightTop"
        :trigger="['focus']"
        :getPopupContainer="trigger => trigger.parentElement"
        v-model="state.passwordLevelChecked"
      >
        <template slot="content">
          <div :style="{ width: '240px' }">
            <div :class="['user-register', passwordLevelClass]">
              强度：
              <span>{{ passwordLevelName }}</span>
            </div>
            <a-progress
              :percent="state.percent"
              :showInfo="false"
              :strokeColor="passwordLevelColor"
            />
            <div style="margin-top: 10px;">
              <span>请至少输入 6 个字符。请不要使用容易被猜到的密码。</span>
            </div>
          </div>
        </template>
        <a-form-item>
          <a-input-password
            size="large"
            placeholder="至少6位密码，区分大小写"
            v-decorator="[
              'password',
              {
                rules: [
                  { required: true, message: '至少6位密码，区分大小写' },
                  { validator: this.handlePasswordLevel }
                ],
                validateTrigger: ['change', 'blur']
              }
            ]"
          ></a-input-password>
        </a-form-item>
      </a-popover>

      <a-form-item>
        <a-input-password
          size="large"
          placeholder="确认密码"
          v-decorator="[
            'password2',
            {
              rules: [{ required: true, message: '至少6位密码，区分大小写' }, { validator: this.handlePasswordCheck }],
              validateTrigger: ['change', 'blur']
            }
          ]"
        ></a-input-password>
      </a-form-item>

      <a-form-item>
        <a-input
          size="large"
          placeholder="11 位手机号"
          v-decorator="[
            'mobile',
            {
              rules: [
                { required: true, message: '请输入正确的手机号', pattern: /^1[3456789]\d{9}$/ },
                { validator: this.handlePhoneCheck }
              ],
              validateTrigger: ['change', 'blur']
            }
          ]"
        >
          <a-select slot="addonBefore" size="large" defaultValue="+86">
            <a-select-option value="+86">+86</a-select-option>
            <a-select-option value="+87">+87</a-select-option>
          </a-select>
        </a-input>
      </a-form-item>
      <!--<a-input-group size="large" compact>
            <a-select style="width: 20%" size="large" defaultValue="+86">
              <a-select-option value="+86">+86</a-select-option>
              <a-select-option value="+87">+87</a-select-option>
            </a-select>
            <a-input style="width: 80%" size="large" placeholder="11 位手机号"></a-input>
      </a-input-group>-->

      <a-row :gutter="16">
        <a-col class="gutter-row" :span="16">
          <a-form-item>
            <a-input
              size="large"
              type="text"
              placeholder="验证码"
              v-decorator="[
                'captcha',
                { rules: [{ required: true, message: '请输入验证码' }], validateTrigger: 'blur' }
              ]"
            >
              <a-icon slot="prefix" type="mail" :style="{ color: 'rgba(0,0,0,.25)' }" />
            </a-input>
          </a-form-item>
        </a-col>
        <a-col class="gutter-row" :span="8">
          <a-button
            class="getCaptcha"
            size="large"
            :disabled="state.smsSendBtn"
            @click.stop.prevent="getCaptcha"
            v-text="(!state.smsSendBtn && '获取验证码') || state.time + ' s'"
          ></a-button>
        </a-col>
      </a-row>

      <a-form-item>
        <a-button
          size="large"
          type="primary"
          htmlType="submit"
          class="register-button"
          :loading="registerBtn"
          @click.stop.prevent="handleSubmit"
          :disabled="registerBtn"
        >重置密码</a-button>
        <a class="login" @click="goToLogin">使用已有账户登录</a>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import { getSmsCaptcha, resetPassword } from '@/api/login'
import { encrypt } from '@/utils/util'

const levelNames = {
  0: '低',
  1: '低',
  2: '中',
  3: '强'
}
const levelClass = {
  0: 'error',
  1: 'error',
  2: 'warning',
  3: 'success'
}
const levelColor = {
  0: '#ff0000',
  1: '#ff0000',
  2: '#ff7e05',
  3: '#52c41a'
}
export default {
  name: 'Forget',
  components: {},
  mixins: [],
  data() {
    return {
      form: this.$form.createForm(this),

      state: {
        time: 60,
        smsSendBtn: false,
        passwordLevel: 0,
        passwordLevelChecked: false,
        percent: 10,
        progressColor: '#FF0000'
      },
      registerBtn: false
    }
  },
  computed: {
    passwordLevelClass() {
      return levelClass[this.state.passwordLevel]
    },
    passwordLevelName() {
      return levelNames[this.state.passwordLevel]
    },
    passwordLevelColor() {
      return levelColor[this.state.passwordLevel]
    }
  },
  methods: {
    handlePasswordLevel(rule, value, callback) {
      let level = 0

      // 判断这个字符串中有没有数字
      if (/[0-9]/.test(value)) {
        level++
      }
      // 判断字符串中有没有字母
      if (/[a-zA-Z]/.test(value)) {
        level++
      }
      // 判断字符串中有没有特殊符号
      if (/[^0-9a-zA-Z_]/.test(value)) {
        level++
      }
      this.state.passwordLevel = level
      this.state.percent = level * 30
      if (level >= 2) {
        if (level >= 3) {
          this.state.percent = 100
        }
        callback()
      } else {
        if (level === 0) {
          this.state.percent = 10
        }
        callback(new Error('密码强度不够'))
      }
    },

    handlePasswordCheck(rule, value, callback) {
      const password = this.form.getFieldValue('password')
      console.log('value', value)
      if (value === undefined) {
        callback(new Error('请输入密码'))
      }
      if (value && password && value.trim() !== password.trim()) {
        callback(new Error('两次密码不一致'))
      }
      callback()
    },

    handlePhoneCheck(rule, value, callback) {
      console.log('handlePhoneCheck, rule:', rule)
      console.log('handlePhoneCheck, value', value)
      console.log('handlePhoneCheck, callback', callback)

      callback()
    },

    handleSubmit() {
      const {
        form: { validateFields },
        state,
        $router,
        $requestOk,
        $notification
      } = this
      validateFields(['userName', 'mobile', 'captcha', 'password'], { force: true }, (err, values) => {
        if (!err) {
          const { userName, mobile: phone, password, captcha: verifyCode } = values
          const params = {
            userName,
            phone,
            newPassword: encrypt(password),
            verifyCode
          }
          resetPassword(params)
            .then(res => {
              const [ok] = $requestOk(res)
              if (ok) {
                state.passwordLevelChecked = false
                $notification['success']({
                  message: '提示',
                  description: '成功重置密码！请重新登陆',
                  duration: 2
                })
                setTimeout(() => {
                  $router.push({ name: 'login' })
                }, 1000)
              } else {
                this.registerBtn = false
              }
            })
            .catch(() => {
              this.registerBtn = false
            })
        }
      })
    },

    getCaptcha(e) {
      e.preventDefault()
      const {
        form: { validateFields },
        state,
        $message,
        $notification,
        $requestOk
      } = this
      validateFields(['mobile', 'userName'], { force: true }, (err, values) => {
        if (!err) {
          const { mobile: phone, userName } = values
          state.smsSendBtn = true

          const interval = window.setInterval(() => {
            if (state.time-- <= 0) {
              state.time = 60
              state.smsSendBtn = false
              window.clearInterval(interval)
            }
          }, 1000)

          const hide = $message.loading('验证码发送中..', 0)

          getSmsCaptcha({ phone, userName })
            .then(res => {
              const [ok, result] = $requestOk(res)
              if (ok) {
                $notification['success']({
                  message: '提示',
                  description: '验证码已发送',
                  duration: 8
                })
              } else {
                throw new Error(result)
              }
            })
            .catch(() => {
              clearInterval(interval)
              state.time = 60
              state.smsSendBtn = false
              this.registerBtn = false
            })
            .finally(() => {
              hide()
            })
        }
      })
    },

    resetCountdown() {},

    goToLogin() {
      this.$store.dispatch('Logout').then(() => {
        this.$router.push({ name: 'login' })
      })
    }
  },
  watch: {
    'state.passwordLevel'(val) {
      console.log(val)
    }
  }
}
</script>
<style lang="less">
.user-register {
  &.error {
    color: #ff0000;
  }

  &.warning {
    color: #ff7e05;
  }

  &.success {
    color: #52c41a;
  }
}

.user-layout-register {
  .ant-input-group-addon:first-child {
    background-color: #fff;
  }
}
</style>
<style lang="less" scoped>
.user-layout-register {
  & > h3 {
    font-size: 16px;
    margin-bottom: 20px;
  }

  .getCaptcha {
    display: block;
    width: 100%;
    height: 40px;
  }

  .register-button {
    width: 50%;
  }

  .login {
    float: right;
    line-height: 40px;
  }
}
</style>
