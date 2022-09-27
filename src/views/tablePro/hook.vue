<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="table-box">
    <!-- 搜索 -->
    <div v-show="isShowSearch" class="card table-search">
      <el-form ref="formRef" :model="searchParam" :inline="true" label-width="100px">
        <el-form-item label="用户姓名 :">
          <el-input v-model="searchParam.username" placeholder="请输入" clearable></el-input>
        </el-form-item>
        <el-form-item label="邮箱 :">
          <el-input v-model="searchParam.email" placeholder="请输入" clearable></el-input>
        </el-form-item>
        <el-form-item label="状态 :">
          <el-select v-model="searchParam.status" placeholder="请选择" clearable>
            <el-option v-for="item in sys_normal_disable" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <div v-show="searchShow" style="display: inline">
          <el-form-item label="创建时间 :">
            <el-date-picker
              v-model="searchParam.created_at"
              type="daterange"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </el-form-item>
        </div>
      </el-form>
      <div class="search-operation">
        <el-button type="primary" :icon="Search" @click="search">搜索</el-button>
        <el-button :icon="Delete" @click="reset">重置</el-button>
        <el-button type="primary" link class="search-isOpen" @click="searchShow = !searchShow">
          {{ searchShow ? '合并' : '展开' }}
          <el-icon class="el-icon--right">
            <component :is="searchShow ? ArrowUp : ArrowDown"></component>
          </el-icon>
        </el-button>
      </div>
    </div>
    <div class="card table-box">
      <!-- 操作 -->
      <div class="table-header">
        <div class="header-button-lf">
          <el-button v-hasPermi="['system:user:add']" type="primary" :icon="CirclePlus" @click="openDrawer('新增')"
            >新增</el-button
          >
          <el-button v-hasPermi="['system:user:import']" type="primary" :icon="Upload" plain @click="batchAdd">导入</el-button>
          <el-button v-hasPermi="['system:user:export']" type="primary" :icon="Download" plain @click="downloadFile"
            >导出</el-button
          >
          <el-button
            v-hasPermi="['system:user:remove']"
            type="danger"
            :icon="Delete"
            plain
            :disabled="!isSelected"
            @click="batchDelete"
          >
            删除
          </el-button>
        </div>
        <div class="header-button-ri">
          <el-button :icon="Refresh" circle @click="getTableList"> </el-button>
          <el-button :icon="Search" circle @click="isShowSearch = !isShowSearch"> </el-button>
        </div>
      </div>
      <!-- 表格 -->
      <el-table height="525" :data="tableData.list" :border="true" :row-key="getRowKeys" @selection-change="selectionChange">
        <el-table-column type="selection" reserve-selection min-width="60" :selectable="(row) => row.id !== 1" />
        <el-table-column
          prop="username"
          label="用户名"
          :formatter="defaultFormat"
          show-overflow-tooltip
          min-width="140"
        ></el-table-column>
        <el-table-column v-slot="scope" prop="sex" label="性别" show-overflow-tooltip min-width="60">
          {{ scope.row.sex == 1 ? '男' : '女' }}
        </el-table-column>
        <el-table-column
          prop="email"
          label="邮箱"
          :formatter="defaultFormat"
          show-overflow-tooltip
          min-width="240"
        ></el-table-column>
        <el-table-column v-slot="scope" prop="status" label="用户状态" width="180">
          <el-switch
            v-model="scope.row.status"
            v-hasPermi="['system:user:edit']"
            :active-text="scope.row.status === 1 ? '启用' : '禁用'"
            :active-value="1"
            :inactive-value="0"
            :disabled="scope.row.id === 1"
            @change="changeStatus($event, scope.row)"
          />
        </el-table-column>
        <el-table-column
          prop="created_at"
          label="创建时间"
          :formatter="defaultFormat"
          show-overflow-tooltip
          min-width="200"
        ></el-table-column>
        <el-table-column v-slot="scope" label="操作" min-width="250">
          <div v-if="scope.row.id !== 1">
            <el-button type="primary" link :icon="View" @click="openDrawer('查看', scope.row)">查看</el-button>
            <el-button
              v-hasPermi="['system:user:edit']"
              type="primary"
              link
              :icon="EditPen"
              text
              @click="openDrawer('编辑', scope.row)"
              >编辑</el-button
            >
            <el-button
              v-hasPermi="['system:user:remove']"
              type="primary"
              link
              :icon="Delete"
              text
              @click="deleteAccount(scope.row)"
              >删除</el-button
            >
          </div>
        </el-table-column>
        <template #empty>
          <div class="table-empty">
            <div>暂无数据</div>
          </div>
        </template>
      </el-table>
      <el-pagination
        v-model:currentPage="tableData.pageNum"
        v-model:page-size="tableData.pageSize"
        :page-sizes="[10, 20, 30, 50]"
        :small="false"
        :disabled="false"
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="Number(tableData.total)"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    <UserDrawer ref="drawerRef" />
    <ImportExcel ref="dialogRef" />
  </div>
</template>

<script setup name="useHooks">
// import { useDownload } from '@/hooks/useDownload'
import { useHandleData } from '@/hooks/useHandleData'
import { useSelection } from '@/hooks/useSelection'
import { useTable } from '@/hooks/useTable'
import ImportExcel from '@/components/ImportExcel/index.vue'
import UserDrawer from './components/UserDrawer.vue'
import { Refresh, CirclePlus, Delete, Search, EditPen, Download, Upload, View, ArrowDown, ArrowUp } from '@element-plus/icons-vue'
import {
  listUser,
  addUser,
  delUser,
  updateUser,
  changeUserStatus,
  exportUserInfo,
  BatchAddUser
  // downloadTemplate
} from '@/api/tablePro'

const { proxy } = getCurrentInstance()
const { sys_normal_disable, sys_user_sex } = proxy.useDict('sys_normal_disable', 'sys_user_sex')
// 是否展示搜索模块
const isShowSearch = ref(true)

// 是否展示更多搜索内容
const searchShow = ref(false)

// 如果表格需要初始化请求参数，直接定义传给 ProTable(之后每次请求都会自动带上该参数，此参数更改之后也会一直带上，改变此参数会自动刷新表格数据)
const initParam = reactive({
  type: 1
})

// 表格 hooks
// const { tableData, pageable, searchParam, searchInitParam, getTableList, search, reset, handleSizeChange, handleCurrentChange } =
const { tableData, searchParam, getTableList, search, reset, handleSizeChange, handleCurrentChange } = useTable(
  listUser,
  initParam,
  false
)

// 数据多选 hooks
const { isSelected, selectedListIds, selectionChange, getRowKeys } = useSelection()

// 设置搜索表单默认参数
// searchInitParam.value = { createTime: ['2022-04-05 00:00:00', '2022-05-10 23:59:59'] }

// 删除用户信息
const deleteAccount = async (params) => {
  await useHandleData(delUser, params.id, `删除【${params.username}】用户`)
  getTableList()
}

// 切换用户状态
const changeStatus = async (val, row) => {
  await useHandleData(changeUserStatus, { id: row.id, status: row.status === 1 ? 1 : 0 }, `切换【${row.username}】用户状态`)
  getTableList()
}

// 批量删除用户信息
const batchDelete = async () => {
  await useHandleData(delUser, selectedListIds.value, '删除所选用户信息')
  getTableList()
}

// 导出用户列表
const downloadFile = async () => {
  // useDownload(exportUserInfo, '用户列表', searchParam.value)
  proxy.download('system/user/export', {}, `user_${new Date().getTime()}.xlsx`)
}

// 批量添加用户
const dialogRef = ref()
const batchAdd = () => {
  const params = {
    title: '用户',
    tempApi: exportUserInfo,
    importApi: BatchAddUser,
    getTableList // 操作成功之后刷新数据
  }
  dialogRef.value.acceptParams(params)
}

function isArray(val) {
  return val && Array.isArray(val)
}
/**
 * @description 格式化表格单元格默认值
 * @param {Number} row 行
 * @param {Number} col 列
 * @param {String} callValue 当前单元格值
 * @return string
 * */
function defaultFormat(row, col, callValue) {
  // 如果当前值为数组,使用 / 拼接（根据需求自定义）
  if (isArray(callValue)) return callValue.length ? callValue.join(' / ') : '--'
  return callValue ?? '--'
}

// 打开 drawer(新增、查看、编辑)
const drawerRef = ref()
const openDrawer = (title, rowData = { avatar: '' }) => {
  const params = {
    title,
    rowData: { ...rowData },
    isView: title === '查看',
    apiUrl: title === '新增' ? addUser : title === '编辑' ? updateUser : '',
    getTableList,
    sexOption: sys_user_sex,
    userStatus: sys_normal_disable
  }
  params.rowData.status = rowData.status + ''
  drawerRef.value.acceptParams(params)
}
</script>
