<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="login">
    <div class="login-content">
      <el-form ref="loginRef" :model="loginForm" :rules="loginRules" class="login-form">
        <div class="login-title">
          <h3 class="title">{{ $t('login.title') }}</h3>
          <language></language>
        </div>
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" type="text" size="large" auto-complete="off" placeholder="账号">
            <template #prefix><svg-icon icon-class="user" class="el-input__icon input-icon" /></template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            :type="passwordType"
            size="large"
            auto-complete="off"
            placeholder="密码"
            @keyup.enter="handleLogin"
          >
            <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
          </el-input>
          <span class="show-pwd">
            <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" color="#889aa4" @click="onChangePwdType" />
          </span>
        </el-form-item>
        <el-form-item v-if="captchaEnabled" prop="code">
          <el-input
            v-model="loginForm.code"
            size="large"
            auto-complete="off"
            placeholder="验证码"
            style="width: 63%"
            @keyup.enter="handleLogin"
          >
            <template #prefix><svg-icon icon-class="validCode" class="el-input__icon input-icon" /></template>
          </el-input>
          <div class="login-code">
            <img :src="codeUrl" class="login-code-img" @click="getCode" />
          </div>
        </el-form-item>
        <el-checkbox v-model="loginForm.rememberMe" style="margin: 0px 0px 20px 0px">记住密码</el-checkbox>
        <el-form-item style="width: 100%">
          <el-button :loading="loading" size="large" type="primary" style="width: 100%" @click.prevent="handleLogin">
            <span v-if="!loading">{{ $t('login.loginBtn') }}</span>
            <span v-else>登 录 中...</span>
          </el-button>
          <div class="register">
            <router-link v-if="register" class="link-type" :to="'/register'">立即注册</router-link>
            <router-link v-if="resetPwd" class="link-type" :to="'/resetPwd'">忘记密码</router-link>
          </div>
        </el-form-item>
      </el-form>
      <div v-if="isShowtips" class="tips" v-html="$t('login.desc')"></div>
    </div>
    <!--  底部  -->
    <div class="el-login-footer">
      <span>Copyright © 2018-2022 All Rights Reserved.</span>
    </div>
  </div>
</template>

<script setup>
import i18n from '@/i18n'
import language from '@/components/Language'
import { getCodeImg } from '@/api/login'
import Cookies from 'js-cookie'
import { encrypt, decrypt } from '@/utils/jsencrypt'
import useUserStore from '@/store/modules/user'

const userStore = useUserStore()
const router = useRouter()
const { proxy } = getCurrentInstance()

const loginForm = ref({
  username: 'super-admin',
  password: '12345p',
  rememberMe: false,
  code: '',
  uuid: ''
})

const validateLoginForm = () => (rule, value, callback) =>
  rule.field === 'username'
    ? !value
      ? callback(new Error(i18n.global.t('login.usernameRule')))
      : callback()
    : value.length < 6
    ? callback(new Error(i18n.global.t('login.passwordRule')))
    : callback()

const loginRules = {
  // username: [{ required: true, trigger: "blur", message: "请输入您的账号" }],
  username: [{ required: true, trigger: 'blur', validator: validateLoginForm() }],
  // password: [{ required: true, trigger: "blur", message: "请输入您的密码" }],
  password: [{ required: true, trigger: 'blur', validator: validateLoginForm() }],
  code: [{ required: true, trigger: 'change', message: '请输入验证码' }]
}

const codeUrl = ref('')
const loading = ref(false)
// 验证码开关
const captchaEnabled = ref(true)
// 注册开关
const register = ref(false)
const redirect = ref(undefined)
// 忘记密码开关
const resetPwd = ref(false)
// 账号提示开关
const isShowtips = ref(true)

function handleLogin() {
  proxy.$refs.loginRef.validate((valid) => {
    if (valid) {
      loading.value = true
      // 勾选了需要记住密码设置在 cookie 中设置记住用户名和密码
      if (loginForm.value.rememberMe) {
        Cookies.set('username', loginForm.value.username, { expires: 30 })
        Cookies.set('password', encrypt(loginForm.value.password), {
          expires: 30
        })
        Cookies.set('rememberMe', loginForm.value.rememberMe, { expires: 30 })
      } else {
        // 否则移除
        Cookies.remove('username')
        Cookies.remove('password')
        Cookies.remove('rememberMe')
      }

      const { username, password, code } = loginForm.value
      const submitForm = {
        username,
        password: encrypt(password), // 密码加密
        // password, // 密码不加密
        // encrypt: false // 密码不加密
        verifyCode: code
      }
      // 调用action的登录方法
      userStore
        // .login(loginForm.value)
        .login(submitForm)
        .then(() => {
          router.push({ path: redirect.value || '/' })
        })
        .catch(() => {
          loading.value = false
          // 重新获取验证码
          if (captchaEnabled.value) {
            getCode()
          }
        })
    }
  })
}

// 处理密码框文本显示状态
const passwordType = ref('password')
const onChangePwdType = () => {
  passwordType.value = passwordType.value === 'password' ? 'text' : 'password'
}

function getCode() {
  getCodeImg().then((res) => {
    captchaEnabled.value = res.captchaEnabled === undefined ? true : res.captchaEnabled
    if (captchaEnabled.value) {
      // codeUrl.value = "data:image/gif;base64," + res.img;
      codeUrl.value = 'data:image/svg+xml;base64,' + res.img
      loginForm.value.uuid = res.uuid
    }
  })
}

function getCookie() {
  const username = Cookies.get('username')
  const password = Cookies.get('password')
  const rememberMe = Cookies.get('rememberMe')
  loginForm.value = {
    username: username === undefined ? loginForm.value.username : username,
    password: password === undefined ? loginForm.value.password : decrypt(password),
    rememberMe: rememberMe === undefined ? false : Boolean(rememberMe)
  }
}

getCode()
getCookie()
</script>

<style lang="scss" scoped>
.login {
  height: 100%;
  background-image: url('../assets/images/login-bg.svg');
  background-size: cover;

  .login-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    .login-form {
      border-radius: 6px;
      background: #ffffff;
      width: 400px;
      padding: 25px 25px 5px 25px;
      box-shadow: var(--el-box-shadow-light);
      .el-input {
        height: 40px;
        input {
          height: 40px;
        }
      }
      .input-icon {
        height: 39px;
        width: 14px;
        margin-left: 0px;
      }
      .login-title {
        position: relative;
        .title {
          margin: 0px auto 30px auto;
          text-align: center;
          color: #707070;
        }
        .language {
          position: absolute;
          top: 0px;
          right: 0;
          background-color: #fff;
          font-size: 22px;
          padding: 0 8px;
          border-radius: 4px;
          cursor: pointer;
        }
      }
    }
  }
}

.login-tip {
  font-size: 13px;
  text-align: center;
  color: #bfbfbf;
}
.login-code {
  width: 33%;
  height: 40px;
  float: right;
  img {
    cursor: pointer;
    vertical-align: middle;
  }
}
.el-login-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #707070;
  font-family: Arial;
  font-size: 12px;
  letter-spacing: 1px;
}
.login-code-img {
  height: 40px;
  padding-left: 12px;
}
.register {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 5px;
}

.show-pwd {
  position: absolute;
  right: 10px;
  font-size: 13px;
  cursor: pointer;
  user-select: none;
}

.tips {
  margin-top: 10px;
  color: #707070;
}
</style>
