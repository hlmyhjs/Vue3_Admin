<template>
  <el-form ref="pwdRef" :model="user" :rules="rules" label-width="80px">
    <el-form-item label="旧密码" prop="oldPassword">
      <el-input v-model="user.oldPassword" placeholder="请输入旧密码" type="password" show-password />
    </el-form-item>
    <el-form-item label="新密码" prop="newPassword">
      <el-input v-model="user.newPassword" placeholder="请输入新密码" type="password" show-password />
    </el-form-item>
    <el-form-item label="确认密码" prop="confirmPassword">
      <el-input v-model="user.confirmPassword" placeholder="请确认新密码" type="password" show-password />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submit">保存</el-button>
      <el-button type="danger" @click="close">关闭</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { updateUserPwd } from '@/api/system/user'
import useUserStore from '@/store/modules/user'
import { encrypt } from '@/utils/jsencrypt'

const userStore = useUserStore()
const { proxy } = getCurrentInstance()

const user = reactive({
  oldPassword: undefined,
  newPassword: undefined,
  confirmPassword: undefined
})

const equalToPassword = (rule, value, callback) => {
  if (user.newPassword !== value) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const validateNewPwd = (rule, value, callback) => {
  if (!/^(?![0-9]+$)(?![a-z]+$)(?![A-Z]+$)[0-9A-Za-z]{6,12}$/.test(value)) {
    callback(new Error('密码需由6-12位字母和数字组成'))
  } else {
    callback()
  }
}

const rules = ref({
  oldPassword: [{ required: true, message: '旧密码不能为空', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '新密码不能为空', trigger: 'blur' },
    {
      required: true,
      validator: validateNewPwd,
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, message: '确认密码不能为空', trigger: 'blur' },
    { required: true, validator: equalToPassword, trigger: 'blur' }
  ]
})

/** 提交按钮 */
function submit() {
  proxy.$refs.pwdRef.validate((valid) => {
    if (valid) {
      const { oldPassword, newPassword } = user
      updateUserPwd(encrypt(oldPassword), encrypt(newPassword)).then((response) => {
        proxy.$modal.msgSuccess('修改成功')

        let timer = null
        clearTimeout(timer)
        timer = setTimeout(() => {
          userStore.logOut().then(() => {
            location.href = '/index'
          })
        }, 1000)
      })
    }
  })
}
/** 关闭按钮 */
function close() {
  proxy.$tab.closePage()
}
</script>
