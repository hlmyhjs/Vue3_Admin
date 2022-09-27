<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="register">
    <el-form ref="registerRef" :model="registerForm" :rules="registerRules" class="register-form">
      <h3 class="title">立即注册</h3>
      <el-form-item prop="username">
        <el-input v-model="registerForm.username" type="text" size="large" auto-complete="off" placeholder="账号">
          <template #prefix><svg-icon icon-class="user" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          v-model="registerForm.password"
          type="password"
          size="large"
          auto-complete="off"
          placeholder="密码"
          @keyup.enter="handleRegister"
        >
          <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="confirmPassword">
        <el-input
          v-model="registerForm.confirmPassword"
          type="password"
          size="large"
          auto-complete="off"
          placeholder="确认密码"
          @keyup.enter="handleRegister"
        >
          <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="email">
        <el-input v-model="registerForm.email" type="text" size="large" auto-complete="off" placeholder="QQ邮箱(用于找回密码)">
          <template #prefix><svg-icon icon-class="email" class="el-input__icon input-icon" /></template>
        </el-input>
      </el-form-item>
      <el-form-item prop="verifyCode">
        <el-input
          v-model="registerForm.verifyCode"
          size="large"
          auto-complete="off"
          placeholder="请输入邮箱验证码"
          @keyup.enter="handleRegister"
        >
          <!-- <template #append><el-button type="primary" @click="getEmailCaptcha">获取验证码</el-button></template> -->
          <template #append
            ><el-button @click="getEmailCaptcha">发送验证码{{ 60 }}s</el-button></template
          >
        </el-input>
      </el-form-item>
      <el-form-item v-if="captchaEnabled" prop="code">
        <el-input
          v-model="registerForm.code"
          size="large"
          auto-complete="off"
          placeholder="验证码"
          style="width: 63%"
          @keyup.enter="handleRegister"
        >
          <template #prefix><svg-icon icon-class="validCode" class="el-input__icon input-icon" /></template>
        </el-input>
        <div class="register-code">
          <img :src="codeUrl" class="register-code-img" @click="getCode" />
        </div>
      </el-form-item>
      <el-form-item style="width: 100%">
        <el-button :loading="loading" size="large" type="primary" style="width: 100%" @click.prevent="handleRegister">
          <span v-if="!loading">注 册</span>
          <span v-else>注 册 中...</span>
        </el-button>
        <div style="float: right">
          <router-link class="link-type" :to="'/login'">使用已有账户登录</router-link>
        </div>
      </el-form-item>
    </el-form>
    <!--  底部  -->
    <div class="el-register-footer">
      <span>Copyright © 2018-2022 All Rights Reserved.</span>
    </div>
  </div>
</template>

<script setup>
import { ElMessageBox } from 'element-plus'
import { getCodeImg, register, emailCaptcha } from '@/api/login'

const router = useRouter()
const { proxy } = getCurrentInstance()

const registerForm = ref({
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  verifyCode: '',
  code: '',
  uuid: ''
})

const equalToPassword = (rule, value, callback) => {
  if (registerForm.value.password !== value) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const validateRegisterPass = (rule, value, callback) => {
  if (!/^(?![0-9]+$)(?![a-z]+$)(?![A-Z]+$)[0-9A-Za-z]{6,12}$/.test(value)) {
    callback(new Error('密码需由6-12位字母和数字组成'))
  } else {
    callback()
  }
}

const registerRules = {
  username: [
    { required: true, trigger: 'blur', message: '请输入您的账号' },
    {
      min: 4,
      max: 20,
      message: '用户账号长度必须介于 4 和 20 之间',
      trigger: 'blur'
    }
  ],
  password: [
    {
      required: true,
      trigger: 'blur',
      message: '请输入您的密码'
    },
    {
      required: true,
      validator: validateRegisterPass,
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, trigger: 'blur', message: '请再次输入您的密码' },
    { required: true, validator: equalToPassword, trigger: 'blur' }
  ],
  email: [
    { required: true, message: '邮箱地址不能为空', trigger: 'blur' },
    {
      type: 'email',
      message: '请输入正确的邮箱地址',
      trigger: ['blur', 'change']
    }
  ],
  verifyCode: [],
  code: [{ required: true, trigger: 'change', message: '请输入验证码' }]
}

const codeUrl = ref('')
const loading = ref(false)
const captchaEnabled = ref(true)

function handleRegister() {
  proxy.$refs.registerRef.validate((valid) => {
    if (valid) {
      loading.value = true
      register(registerForm.value)
        .then((res) => {
          const username = registerForm.value.username
          ElMessageBox.alert("<font color='red'>恭喜你，您的账号 " + username + ' 注册成功！</font>', '系统提示', {
            dangerouslyUseHTMLString: true,
            type: 'success'
          })
            .then(() => {
              router.push('/login')
            })
            .catch(() => {})
        })
        .catch(() => {
          loading.value = false
          if (captchaEnabled) {
            getCode()
          }
        })
    }
  })
}

function getCode() {
  getCodeImg().then((res) => {
    captchaEnabled.value = res.captchaEnabled === undefined ? true : res.captchaEnabled
    if (captchaEnabled.value) {
      // codeUrl.value = "data:image/gif;base64," + res.img;
      codeUrl.value = 'data:image/svg+xml;base64,' + res.img
      registerForm.value.uuid = res.uuid
    }
  })
}

function getEmailCaptcha() {
  proxy.$refs.registerRef.validate((valid) => {
    if (valid) {
      loading.value = true
      emailCaptcha(registerForm.value).then((res) => {
        console.log('发送验证码成功')
      })
    }
  })
}

getCode()
</script>

<style lang="scss" scoped>
.register {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-image: url('../assets/images/login-bg.svg');
  background-size: cover;
}
.title {
  margin: 0px auto 30px auto;
  text-align: center;
  color: #707070;
}

.register-form {
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
}
.register-tip {
  font-size: 13px;
  text-align: center;
  color: #bfbfbf;
}
.register-code {
  width: 33%;
  height: 40px;
  float: right;
  img {
    cursor: pointer;
    vertical-align: middle;
  }
}
.el-register-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #fff;
  font-family: Arial;
  font-size: 12px;
  letter-spacing: 1px;
}
.register-code-img {
  height: 40px;
  padding-left: 12px;
}
</style>
