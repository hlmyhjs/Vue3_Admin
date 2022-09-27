<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryRef" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="参数名称" prop="config_name">
        <el-input
          v-model="queryParams.config_name"
          placeholder="请输入参数名称"
          clearable
          style="width: 240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="参数键名" prop="config_key">
        <el-input
          v-model="queryParams.config_key"
          placeholder="请输入参数键名"
          clearable
          style="width: 240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="系统内置" prop="config_type">
        <el-select v-model="queryParams.config_type" placeholder="系统内置" clearable>
          <el-option v-for="dict in sys_yes_no" :key="dict.value" :label="dict.label" :value="dict.value" />
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
        <el-button v-hasPermi="['system:config:add']" type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-hasPermi="['system:config:edit']" type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          >修改</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['system:config:remove']"
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          >删除</el-button
        >
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['system:config:export']">导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Refresh" @click="handleRefreshCache">刷新缓存</el-button>
      </el-col> -->
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" height="455" border :data="configList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="参数主键" align="center" prop="config_id" />
      <el-table-column label="参数名称" align="center" prop="config_name" :show-overflow-tooltip="true" />
      <el-table-column label="参数键名" align="center" prop="config_key" :show-overflow-tooltip="true" />
      <el-table-column label="参数键值" align="center" prop="config_value" />
      <el-table-column label="系统内置" align="center" prop="config_type">
        <template #default="scope">
          <dict-tag :options="sys_yes_no" :value="scope.row.config_type" />
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />
      <el-table-column label="创建时间" align="center" prop="created_at" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.created_at) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            v-hasPermi="['system:config:edit']"
            type="primary"
            text
            size="small"
            icon="Edit"
            @click="handleUpdate(scope.row)"
            >修改</el-button
          >
          <el-button
            v-hasPermi="['system:config:remove']"
            type="primary"
            text
            size="small"
            icon="Delete"
            @click="handleDelete(scope.row)"
            >删除</el-button
          >
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

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog v-model="open" :title="title" :width="diaLogWidth" append-to-body>
      <el-form ref="configRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="参数名称" prop="config_name">
          <el-input v-model="form.config_name" placeholder="请输入参数名称" />
        </el-form-item>
        <el-form-item label="参数键名" prop="config_key">
          <el-input v-model="form.config_key" placeholder="请输入参数键名" />
        </el-form-item>
        <el-form-item label="参数键值" prop="config_value">
          <el-input v-model="form.config_value" placeholder="请输入参数键值" />
        </el-form-item>
        <el-form-item label="系统内置" prop="config_type">
          <el-radio-group v-model="form.config_type">
            <el-radio v-for="dict in sys_yes_no" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Config">
import { useWindowSize } from '@vueuse/core'
import { listConfig, getConfig, delConfig, addConfig, updateConfig } from '@/api/system/config'

const { proxy } = getCurrentInstance()
const { sys_yes_no } = proxy.useDict('sys_yes_no')

const configList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref('')
const dateRange = ref([])

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    config_name: undefined,
    config_key: undefined,
    config_type: undefined
  },
  rules: {
    config_name: [{ required: true, message: '参数名称不能为空', trigger: 'blur' }],
    config_key: [{ required: true, message: '参数键名不能为空', trigger: 'blur' }],
    config_value: [{ required: true, message: '参数键值不能为空', trigger: 'blur' }]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询参数列表 */
function getList() {
  loading.value = true
  listConfig(proxy.addDateRange(queryParams.value, dateRange.value)).then((response) => {
    configList.value = response.data.list
    total.value = response.data.total
    loading.value = false
  })
}
/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}
/** 表单重置 */
function reset() {
  form.value = {
    config_id: undefined,
    config_name: undefined,
    config_key: undefined,
    config_value: undefined,
    config_type: 'Y',
    remark: undefined
  }
  proxy.resetForm('configRef')
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
/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.config_id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}
/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加参数'
}
/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const config_id = row.config_id || ids.value
  getConfig(config_id).then((response) => {
    form.value = response.data
    open.value = true
    title.value = '修改参数'
  })
}
/** 提交按钮 */
function submitForm() {
  proxy.$refs['configRef'].validate((valid) => {
    if (valid) {
      if (form.value.config_id != undefined) {
        updateConfig(form.value).then((response) => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addConfig(form.value).then((response) => {
          proxy.$modal.msgSuccess('新增成功')
          open.value = false
          getList()
        })
      }
    }
  })
}
/** 删除按钮操作 */
function handleDelete(row) {
  const config_ids = row.config_id || ids.value
  proxy.$modal
    .confirm('是否确认删除参数编号为"' + config_ids + '"的数据项？')
    .then(function () {
      return delConfig(config_ids)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
    .catch(() => {})
}
/** 导出按钮操作 */
// function handleExport() {
//   proxy.download(
//     'system/config/export',
//     {
//       ...queryParams.value
//     },
//     `config_${new Date().getTime()}.xlsx`
//   )
// }
/** 刷新缓存按钮操作 */
// function handleRefreshCache() {
//   refreshCache().then(() => {
//     proxy.$modal.msgSuccess('刷新缓存成功')
//   })
// }

const { width } = useWindowSize()
const WIDTH = 992
const diaLogWidth = ref('500px')
watch(width, (newWidth) => {
  diaLogWidth.value = newWidth - 1 < WIDTH ? '98%' : '500px'
})

getList()
</script>
