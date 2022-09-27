<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!--用户数据-->
      <el-col :span="24" :xs="24">
        <!-- 搜索 -->
        <el-form v-show="showSearch" ref="queryRef" :model="queryParams" :inline="true" label-width="68px">
          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="queryParams.username"
              placeholder="请输入用户名称"
              clearable
              style="width: 240px"
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="电话" prop="mobile">
            <el-input
              v-model="queryParams.mobile"
              placeholder="请输入手机号码"
              clearable
              style="width: 240px"
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="用户状态" clearable style="width: 240px">
              <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="创建时间" style="width: 308px">
            <el-date-picker
              v-model="dateRange"
              value-format="YYYY-MM-DD"
              type="daterange"
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            ></el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button v-hasPermi="['mall:user:add']" type="primary" size="small" plain icon="Plus" @click="handleAdd"
              >新增</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-hasPermi="['mall:user:edit']"
              type="success"
              size="small"
              plain
              icon="Edit"
              :disabled="single"
              @click="handleUpdate"
              >修改</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-hasPermi="['mall:user:remove']"
              type="danger"
              size="small"
              plain
              icon="Delete"
              :disabled="multiple"
              @click="handleDelete"
              >删除</el-button
            >
          </el-col>
          <!-- <el-col :span="1.5">
            <el-button type="info" size="small" plain icon="Upload" @click="handleImport" v-hasPermi="['mall:user:import']">导入</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" size="small" plain icon="Download" @click="handleExport" v-hasPermi="['mall:user:export']">导出</el-button>
          </el-col> -->
          <right-toolbar v-model:showSearch="showSearch" :columns="columns" @queryTable="getList"></right-toolbar>
        </el-row>

        <!-- 表格 -->
        <el-table v-loading="loading" height="530" border :data="userList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" :selectable="selectable" width="50" align="center" />
          <el-table-column v-if="columns[0].visible" key="id" label="用户编号" align="center" prop="id" />
          <el-table-column
            v-if="columns[1].visible"
            key="username"
            label="用户名"
            align="center"
            prop="username"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="columns[2].visible"
            key="nickname"
            label="昵称"
            align="center"
            prop="nickname"
            :show-overflow-tooltip="true"
          />
          <el-table-column v-if="columns[4].visible" key="mobile" label="手机号码" align="center" prop="mobile" width="120" />
          <el-table-column
            v-if="columns[3].visible"
            key="email"
            label="邮箱"
            align="center"
            prop="email"
            :show-overflow-tooltip="true"
          />
          <el-table-column v-if="columns[5].visible" key="status" label="状态" align="center">
            <template #default="scope">
              <el-switch
                v-model="scope.row.status"
                v-hasPermi="['mall:user:edit']"
                :active-value="true"
                :inactive-value="false"
                :disabled="scope.row.id === 1"
                @change="handleStatusChange(scope.row)"
              ></el-switch>
            </template>
          </el-table-column>
          <el-table-column v-if="columns[6].visible" label="创建时间" align="center" prop="createTime" width="160">
            <template #default="scope">
              <span>{{ parseTime(scope.row.created_at) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="250" class-name="small-padding fixed-width">
            <template #default="scope">
              <el-button
                v-if="scope.row.id !== 1"
                v-hasPermi="['mall:user:edit']"
                type="primary"
                size="small"
                icon="Edit"
                text
                @click="handleUpdate(scope.row)"
                >修改</el-button
              >
              <el-button
                v-if="scope.row.id !== 1"
                v-hasPermi="['mall:user:remove']"
                type="primary"
                size="small"
                icon="Delete"
                text
                @click="handleDelete(scope.row)"
                >删除</el-button
              >
              <el-dropdown
                v-if="scope.row.id !== 1"
                v-hasPermi="['mall:user:resetPwd']"
                size="small"
                style="padding: 5px 0"
                @command="(command) => handleCommand(command, scope.row)"
              >
                <span class="el-dropdown-link">
                  <el-icon class="el-icon--right"> <arrow-down /></el-icon>
                  更多
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="handleResetPwd" icon="Lock">重置密码</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>
        <pagination
          v-show="total > 0"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          :total="total"
          @pagination="getList"
        />
      </el-col>
    </el-row>

    <!-- 添加或修改用户配置对话框 -->
    <form-drawer ref="formDrawerRef" :title="title" @submit="submitForm">
      <el-form ref="userRef" :model="form" :rules="rules" label-width="80px" :inline="false" size="default">
        <el-form-item label="头像" prop="avatar">
          <el-upload
            class="goods-uploader"
            action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
            :show-file-list="false"
          >
            <img v-if="form.avatar" :src="form.avatar" class="img" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <template v-if="!form.id">
          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="form.username"
              :disabled="form.id"
              onkeyup="value=value.replace(/[^\x00-\xff]/g, '')"
              maxlength="30"
            />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="form.password" :disabled="form.id" maxlength="30" show-password />
          </el-form-item>
        </template>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="请输入用户昵称" maxlength="30" />
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="form.mobile" placeholder="请输入手机号码" maxlength="11" />
        </el-form-item>
        <el-form-item label="累计消费" prop="accumulate_money">
          <el-input v-model="form.accumulate_money" disabled maxlength="20" />
        </el-form-item>
        <el-form-item label="最后登录IP" label-width="100" prop="last_ip">
          <el-input v-model="form.last_ip" disabled />
        </el-form-item>
        <el-form-item label="最后登录时间" label-width="100" prop="accumulate_money">
          <el-input v-model="form.last_time" disabled />
        </el-form-item>
        <el-form-item label="等级" prop="level_id">
          <el-select v-model="form.level_id" placeholder="请选择用户等级">
            <el-option v-for="item in selectList" :key="item.id" :label="item.level_name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="性别">
          <el-select v-model="form.sex" placeholder="请选择">
            <el-option v-for="dict in sys_user_sex" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" :rows="3" type="textarea" placeholder="请输入内容"></el-input>
        </el-form-item>
      </el-form>
    </form-drawer>

    <!-- 用户导入对话框 -->
    <el-dialog v-model="upload.open" :title="upload.title" width="400px" append-to-body>
      <el-upload
        ref="uploadRef"
        :limit="1"
        accept=".xlsx, .xls"
        :headers="upload.headers"
        :action="upload.url + '?updateSupport=' + upload.updateSupport"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :auto-upload="false"
        drag
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip text-center">
            <div class="el-upload__tip"><el-checkbox v-model="upload.updateSupport" />是否更新已经存在的用户数据</div>
            <span>仅允许导入xls、xlsx格式文件。</span>
            <el-link type="primary" :underline="false" style="font-size: 12px; vertical-align: baseline" @click="importTemplate"
              >下载模板</el-link
            >
          </div>
        </template>
      </el-upload>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitFileForm">确 定</el-button>
          <el-button @click="upload.open = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="User">
import FormDrawer from '@/components/FormDrawer'
import { getToken } from '@/utils/auth'
import { changeUserStatus, listUser, resetUserPwd, delUser, getUser, updateUser, addUser, levelSelectList } from '@/api/mall/user'

const { proxy } = getCurrentInstance()
const { sys_normal_disable, sys_user_sex } = proxy.useDict('sys_normal_disable', 'sys_user_sex')

const userList = ref([])
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref('')
const dateRange = ref([])
const initPassword = ref(undefined)
const selectList = ref([])
/*** 用户导入参数 */
const upload = reactive({
  // 是否显示弹出层（用户导入）
  open: false,
  // 弹出层标题（用户导入）
  title: '',
  // 是否禁用上传
  isUploading: false,
  // 是否更新已经存在的用户数据
  updateSupport: 0,
  // 设置上传的请求头部
  headers: { Authorization: 'Bearer ' + getToken() },
  // 上传的地址
  url: import.meta.env.VITE_APP_BASE_API + '/system/user/importData'
})
// 列显隐信息
const columns = ref([
  { key: 0, label: `用户编号`, visible: true },
  { key: 1, label: `用户名称`, visible: true },
  { key: 2, label: `用户昵称`, visible: true },
  { key: 3, label: `部门`, visible: true },
  { key: 4, label: `手机号码`, visible: true },
  { key: 5, label: `状态`, visible: true },
  { key: 6, label: `创建时间`, visible: true }
])

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    username: undefined,
    mobile: undefined,
    status: undefined
  },
  rules: {
    username: [
      { required: true, message: '用户名称不能为空', trigger: 'blur' },
      {
        min: 4,
        max: 20,
        message: '用户名称长度必须介于 4 和 20 之间',
        trigger: 'blur'
      }
    ],
    nickname: [{ message: '用户昵称不能为空', trigger: 'blur' }],
    password: [
      { required: true, message: '用户密码不能为空', trigger: 'blur' },
      {
        message: '密码需由6-12位字母和数字组成',
        trigger: 'blur',
        pattern: /^(?![0-9]+$)(?![a-z]+$)(?![A-Z]+$)[0-9A-Za-z]{6,12}$/
      }
    ],
    email: [
      {
        type: 'email',
        message: '请输入正确的邮箱地址',
        trigger: ['blur', 'change']
      }
    ],
    mobile: [
      {
        pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
        message: '请输入正确的手机号码',
        trigger: 'blur'
      }
    ]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询用户列表 */
function getList() {
  loading.value = true
  listUser(proxy.addDateRange(queryParams.value, dateRange.value)).then((res) => {
    loading.value = false
    userList.value = res.data.list
    total.value = res.data.total
  })
}
/** 用户等级下拉列表 */
async function getLevelSelectList() {
  const res = await levelSelectList()
  selectList.value = res.data
}
/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}
/** 重置按钮操作 */
function resetQuery() {
  dateRange.value = []
  proxy.resetForm('queryRef')
  handleQuery()
}
/** 删除按钮操作 */
function handleDelete(row) {
  const id = row.id || ids.value
  proxy.$modal
    .confirm('是否确认删除用户编号为"' + id + '"的数据项？')
    .then(function () {
      return delUser(id)
    })
    .then((res) => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
    .catch(() => {})
}
/** 导出按钮操作 */
// function handleExport() {
//   proxy.download(
//     'system/user/export',
//     {
//       ...queryParams.value
//     },
//     `user_${new Date().getTime()}.xlsx`
//   )
// }
/** 用户状态修改  */
function handleStatusChange(row) {
  const text = row.status === true ? '启用' : '停用'
  proxy.$modal
    .confirm('确认要"' + text + '""' + row.username + '"用户吗?')
    .then(function () {
      return changeUserStatus(row.id, row.status)
    })
    .then(() => {
      proxy.$modal.msgSuccess(text + '成功')
    })
    .catch(function () {
      row.status = row.status === true ? 0 : true
    })
}
/** 更多操作 */
function handleCommand(command, row) {
  switch (command) {
    case 'handleResetPwd':
      handleResetPwd(row)
      break
    case 'handleAuthRole':
      handleAuthRole(row)
      break
    default:
      break
  }
}

const currentUserRole = reactive({
  id: undefined,
  username: undefined,
  role_id: undefined
})
const dialogFormVisible = ref(false)
/** 打开角色分配dialog */
function handleAuthRole(row) {
  dialogFormVisible.value = !dialogFormVisible.value
  reset()
  // initRoleList()
  currentUserRole.id = row.id
  currentUserRole.username = row.username
  currentUserRole.role_id = row.role_id
}

/** 重置密码按钮操作 */
function handleResetPwd(row) {
  proxy
    .$prompt('请输入"' + row.username + '"的新密码', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      closeOnClickModal: false,
      inputPattern: /^(?![0-9]+$)(?![a-z]+$)(?![A-Z]+$)[0-9A-Za-z]{6,12}$/,
      inputErrorMessage: '密码需由6-12位字母和数字组成'
    })
    .then(({ value }) => {
      resetUserPwd(row.id, value).then((response) => {
        proxy.$modal.msgSuccess('修改成功，新密码是：' + value)
      })
    })
    .catch(() => {})
}
/** 选择条数  */
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

// 禁止选中某一项
const selectable = (row, index) => row.id !== 1

/** 导入按钮操作 */
// function handleImport() {
//   upload.title = '用户导入'
//   upload.open = true
// }
/** 下载模板操作 */
function importTemplate() {
  proxy.download('system/member/importTemplate', {}, `user_template_${new Date().getTime()}.xlsx`)
}
/**文件上传中处理 */
const handleFileUploadProgress = (event, file, fileList) => {
  upload.isUploading = true
}
/** 文件上传成功处理 */
const handleFileSuccess = (response, file, fileList) => {
  upload.open = false
  upload.isUploading = false
  proxy.$refs['uploadRef'].handleRemove(file)
  proxy.$alert(
    "<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" + response.msg + '</div>',
    '导入结果',
    { dangerouslyUseHTMLString: true }
  )
  getList()
}
/** 提交上传文件 */
function submitFileForm() {
  proxy.$refs['uploadRef'].submit()
}

/** 重置操作表单 */
function reset() {
  form.value = {
    accumulate_money: undefined,
    avatar: undefined,
    created_at: undefined,
    email: undefined,
    id: undefined,
    is_admin: undefined,
    last_ip: undefined,
    last_time: undefined,
    level_id: undefined,
    mobile: undefined,
    nickname: undefined,
    remark: undefined,
    sex: undefined,
    status: undefined,
    username: undefined
  }
  proxy.resetForm('userRef')
}
/** 取消按钮 */
// function cancel() {
//   open.value = false
//   reset()
// }
/** 新增按钮操作 */
function handleAdd() {
  reset()
  // initRoleList()
  form.value.status = '1'
  formDrawerRef.value.open()
  title.value = '添加用户'
  form.value.password = initPassword.value
  // 默认头像
  form.value.avatar = 'https://img.gejiba.com/images/77fd22e5aca8a7e659eb8bbc88cd0514.th.jpg'
}

const formDrawerRef = ref(null)
/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const userId = row.id || ids.value
  getUser(userId).then(async (response) => {
    form.value = response.data
    form.value.sex = Number(response.data.sex) + ''
    form.value.status = Number(response.data.status) + ''
    formDrawerRef.value.open()
    title.value = '修改用户'
    form.password = ''
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['userRef'].validate((valid) => {
    if (valid) {
      if (form.value.id != undefined) {
        updateUser(form.value).then((response) => {
          proxy.$modal.msgSuccess('修改成功')
          formDrawerRef.value.close()
          getList()
        })
      } else {
        addUser(form.value).then((response) => {
          proxy.$modal.msgSuccess('新增成功')
          formDrawerRef.value.close()
          getList()
        })
      }
    }
  })
}

getList()
getLevelSelectList()
</script>

<style lang="scss">
.goods-uploader .img {
  width: 70px;
  height: 70px;
  display: block;
}
.goods-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.goods-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 20px;
  color: #8c939d;
  width: 70px;
  height: 70px;
  text-align: center;
}
</style>
