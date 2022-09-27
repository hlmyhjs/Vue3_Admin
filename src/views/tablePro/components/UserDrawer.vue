<template>
  <el-drawer v-model="drawerVisible" :destroy-on-close="true" size="500px" :title="`${drawerData.title}用户`">
    <el-form
      ref="ruleFormRef"
      :rules="rules"
      :disabled="drawerData.isView"
      :model="drawerData.rowData"
      label-width="100px"
      label-suffix=" :"
      :hide-required-asterisk="drawerData.isView"
    >
      <el-form-item label="头像" prop="avatar">
        <UploadImg
          v-model:imageUrl="drawerData.rowData.avatar"
          :disabled="drawerData.isView"
          :file-size="3"
          :upload-style="{ width: '130px', height: '130px' }"
          @check-validate="checkValidate('avatar')"
        >
          <template #tip> 头像大小不能超过 3M </template>
        </UploadImg>
      </el-form-item>
      <div v-if="!drawerData.rowData.id">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="drawerData.rowData.username" placeholder="请填写用户名" clearable></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="drawerData.rowData.password" placeholder="请填写密码" clearable></el-input>
        </el-form-item>
      </div>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="drawerData.rowData.email" placeholder="请填写用户邮箱" clearable></el-input>
      </el-form-item>
      <el-form-item label="昵称" prop="nickname">
        <el-input v-model="drawerData.rowData.nickname" placeholder="请填写昵称" clearable></el-input>
      </el-form-item>
      <el-form-item label="电话" prop="mobile">
        <el-input v-model="drawerData.rowData.mobile" placeholder="请填写电话" clearable></el-input>
      </el-form-item>
      <el-form-item label="性别" prop="sex">
        <el-select v-model="drawerData.rowData.sex" placeholder="请选择性别" clearable>
          <el-option v-for="item in drawerData.sexOption" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="drawerData.rowData.status">
          <el-radio v-for="dict in drawerData.userStatus" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="简介" prop="instruction">
        <el-input
          v-model="drawerData.rowData.instruction"
          :rows="3"
          type="textarea"
          placeholder="请填写简介信息"
          clearable
        ></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="drawerVisible = false">取消</el-button>
      <el-button v-show="!drawerData.isView" type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-drawer>
</template>

<script setup name="UserDrawer">
import { ElMessage } from 'element-plus'
import UploadImg from '@/components/ImageUpload/UploadImg.vue'

const rules = reactive({
  avatar: [{ required: true, message: '请上传用户头像', trigger: 'change' }],
  username: [
    { required: true, message: '用户名称不能为空', trigger: 'blur' },
    {
      min: 4,
      max: 20,
      message: '用户名称长度必须介于 4 和 20 之间',
      trigger: 'blur'
    }
  ],
  password: [
    { required: true, message: '用户密码不能为空', trigger: 'blur' },
    {
      message: '密码需由6-12位字母和数字组成',
      trigger: 'blur',
      pattern: /^(?![0-9]+$)(?![a-z]+$)(?![A-Z]+$)[0-9A-Za-z]{6,12}$/
    }
  ],
  email: [{ type: 'email', required: true, message: '请填写正确邮箱', trigger: 'change' }],
  status: [{ required: true, message: '请选择用户状态', trigger: 'change' }],
  mobile: [
    {
      pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
      message: '请输入正确的手机号码',
      trigger: 'blur'
    }
  ]
})

// drawer框状态
const drawerVisible = ref(false)
const drawerData = ref({
  isView: false,
  title: ''
})

// 接收父组件传过来的参数
const acceptParams = (params) => {
  drawerData.value = params
  drawerVisible.value = true
}

const ruleFormRef = ref()
// 提交数据（新增/编辑）
const handleSubmit = () => {
  ruleFormRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      await drawerData.value.apiUrl(drawerData.value.rowData)
      ElMessage.success({ message: `${drawerData.value.title}用户成功！` })
      drawerData.value.getTableList()
      drawerVisible.value = false
    } catch (error) {
      console.log(error)
    }
  })
}

// 公共校验方法（图片上传成功触发重新校验）
const checkValidate = (val) => {
  ruleFormRef.value.validateField(val, () => {})
}

defineExpose({
  acceptParams
})
</script>
