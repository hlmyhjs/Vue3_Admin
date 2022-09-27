<template>
  <div class="table-box">
    <TablePro ref="proTable" :columns="columns" :request-api="listUser" :init-param="initParam" :data-callback="dataCallback">
      <!-- 表格 header 按钮 -->
      <template #tableHeader="scope">
        <el-button v-hasPermi="['system:user:add']" type="primary" :icon="CirclePlus" @click="openDrawer('新增')">新增</el-button>
        <el-button
          v-hasPermi="['system:user:remove']"
          type="danger"
          :icon="Delete"
          plain
          :disabled="!scope.isSelected"
          @click="batchDelete(scope.selectedListIds)"
        >
          删除
        </el-button>
        <el-button v-hasPermi="['system:user:import']" type="primary" :icon="Upload" plain @click="batchAdd">导入</el-button>
        <el-button v-hasPermi="['system:user:export']" type="primary" :icon="Download" plain @click="downloadFile"
          >导出</el-button
        >
      </template>
      <!-- Expand -->
      <template #expand="scope">
        {{ scope.row }}
      </template>
      <!-- 用户状态 slot -->
      <template #status="scope">
        <!-- 如果插槽的值为 el-switch，第一次加载会默认触发 switch 的 @change 方法，所有在外层包一个盒子，点击触发盒子 click 方法（暂时只能这样解决） -->
        <div @click="changeStatus(scope.row)">
          <el-switch
            v-if="scope.row.id !== 1"
            v-model="scope.row.status"
            v-hasPermi="['system:user:edit']"
            :active-value="1"
            :inactive-value="0"
            :disabled="scope.row.id === 1"
          />
        </div>
      </template>
      <!-- 表格操作 -->
      <template #operation="scope">
        <div v-if="scope.row.id !== 1">
          <!-- <el-button type="primary" size="small" link :icon="View" @click="openDrawer('查看', scope.row)">查看</el-button> -->
          <el-button
            v-hasPermi="['system:user:edit']"
            type="primary"
            size="small"
            link
            :icon="EditPen"
            @click="openDrawer('编辑', scope.row)"
            >编辑</el-button
          >
          <el-button
            v-hasPermi="['system:user:remove']"
            type="primary"
            size="small"
            link
            :icon="Delete"
            @click="deleteAccount(scope.row)"
            >删除</el-button
          >
          <el-button
            v-hasPermi="['system:user:edit']"
            type="primary"
            size="small"
            link
            :icon="More"
            @click="handleMore(scope.row)"
            >更多</el-button
          >
        </div>
      </template>
    </TablePro>
    <UserDrawer ref="drawerRef" />
    <UserDialog
      ref="UserDialogRef"
      v-model="formData"
      :dialog-form-visible="dialogFormVisible"
      width="40%"
      title="更多"
      :form="dialogForm"
      @dialogCancel="dialogCancel"
      @dialogConfirm="dialogConfirm"
      @dialogClose="dialogClose"
    />
    <ImportExcel ref="dialogRef" />
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { useHandleData } from '@/hooks/useHandleData'
// import { useDownload } from '@/hooks/useDownload'
import TablePro from '@/components/TablePro/index.vue'
import {
  listUser,
  addUser,
  delUser,
  updateUser,
  changeUserStatus,
  // exportUserInfo,
  BatchAddUser,
  downloadTemplate,
  getRoleList
} from '@/api/tablePro'
import ImportExcel from '@/components/ImportExcel/index.vue'
import UserDrawer from './components/UserDrawer.vue'
import UserDialog from './components/UserDialog.vue'
// import { CirclePlus, Delete, EditPen, Download, Upload, View, Refresh, More } from '@element-plus/icons-vue'
import { CirclePlus, Delete, EditPen, Download, Upload, More } from '@element-plus/icons-vue'

const { proxy } = getCurrentInstance()
const { sys_normal_disable, sys_user_sex } = proxy.useDict('sys_normal_disable', 'sys_user_sex')

// 获取 ProTable 元素，调用其获取刷新数据方法（还能获取到当前查询参数，方便导出携带参数）
const proTable = ref()

// 如果表格需要初始化请求参数，直接定义传给 ProTable(之后每次请求都会自动带上该参数，此参数更改之后也会一直带上，改变此参数会自动刷新表格数据)
const initParam = reactive({
  type: 1
})

// dataCallback 是对于返回的表格数据做处理，如果你后台返回的数据不是 datalist && total && pageNum && pageSize 这些字段，那么你可以在这里进行处理成这些字段
const dataCallback = (data) => {
  return {
    datalist: data.list,
    total: data.total,
    pageNum: data.pageNum,
    pageSize: data.pageSize
  }
}

// 表格配置项
const columns = [
  { type: 'selection', width: 60, selectable: (row) => row.id !== 1 },
  { type: 'index', label: '#', width: 80 },
  { type: 'expand', label: 'Expand', width: 80 },
  { prop: 'username', label: '用户名', minWidth: 130, search: true },
  { prop: 'nickname', label: '昵称', minWidth: 130, search: true },
  { prop: 'email', label: '邮箱', minWidth: 200, search: true },
  {
    prop: 'status',
    label: '用户状态',
    minWidth: 100,
    search: true,
    searchType: 'select',
    enum: sys_normal_disable,
    searchProps: { label: 'userLabel', value: 'userStatus' }
  },
  {
    prop: 'created_at',
    label: '创建时间',
    minWidth: 200,
    sortable: true,
    search: true,
    searchType: 'daterange',
    // searchProps: {
    //   disabledDate: (time) => time.getTime() < Date.now() - 8.64e7
    // },
    searchInitParam: ['2022-08-30 00:00:00', '2022-08-20 23:59:59']
  },
  { prop: 'operation', label: '操作', minWidth: 200 }
]

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref()
const openDrawer = (title, rowData = { avatar: '' }) => {
  const params = {
    title,
    rowData: { ...rowData },
    isView: title === '查看',
    apiUrl: title === '新增' ? addUser : title === '编辑' ? updateUser : '',
    getTableList: proTable.value.getTableList,
    sexOption: sys_user_sex,
    userStatus: sys_normal_disable
  }
  params.rowData.status = rowData.status + ''
  drawerRef.value.acceptParams(params)
}

// 删除用户信息
const deleteAccount = async (params) => {
  // await useHandleData(delUser, { id: [params.id] }, `删除【${params.username}】用户`)
  await useHandleData(delUser, params.id, `删除【${params.username}】用户`)
  proTable.value.getTableList()
}

// 批量删除用户信息
const batchDelete = async (ids) => {
  // await useHandleData(delUser, { id }, '删除所选用户信息')
  await useHandleData(delUser, ids, '删除所选用户信息')
  proTable.value.getTableList()
}

// 切换用户状态
const changeStatus = async (row) => {
  await useHandleData(changeUserStatus, { id: row.id, status: row.status === 1 ? 1 : 0 }, `切换【${row.username}】用户状态`)
  proTable.value.getTableList()
}

// 导出用户列表
const downloadFile = async () => {
  // useDownload(exportUserInfo, '用户列表', proTable.value.searchParam)
  proxy.download('system/user/export', {}, `user_${new Date().getTime()}.xlsx`)
}

// 批量添加用户
const dialogRef = ref()
const batchAdd = () => {
  const params = {
    title: '用户',
    tempApi: downloadTemplate,
    importApi: BatchAddUser,
    getTableList: proTable.value.getTableList
  }
  dialogRef.value.acceptParams(params)
}

/*************************附加dialog***********************/
const roleList = ref([])
const queryRoleList = async () => {
  const roles = await getRoleList()
  roleList.value = roles.data.list
}
queryRoleList()

const dialogForm = ref({
  formItem: [
    { field: 'username', type: 'input', label: '用户名', placeholder: '请输入用户名', disabled: true },
    {
      field: 'password',
      type: 'password',
      label: '修改密码',
      placeholder: '请输入密码',
      isHidden: false,
      clearable: true
    },
    {
      field: 'role_id',
      type: 'select',
      label: '分配角色',
      placeholder: '请选择',
      clearable: true,
      options: roleList
    }
  ],
  labelWidth: '80px'
})

const dialogFormVisible = ref(false)
const formData = ref({})

const resetForm = () => {
  formData.value.id = undefined
  formData.value.username = undefined
  formData.value.password = undefined
  formData.value.role_id = undefined
}

const handleMore = async (row) => {
  resetForm()
  formData.value.id = row.id
  formData.value.username = row.username
  formData.value.role_id = row.role_id
  if (!roleList.value.length) {
    await queryRoleList()
    dialogFormVisible.value = true
  } else {
    dialogFormVisible.value = true
  }
}

const dialogConfirm = async () => {
  dialogFormVisible.value = false
  delete formData.value.username
  const res = await updateUser(formData.value)
  ElMessage.success(res.msg)
  proTable.value.getTableList()
}
const dialogCancel = () => {
  dialogFormVisible.value = false
}
const dialogClose = () => {
  dialogFormVisible.value = false
}
</script>
