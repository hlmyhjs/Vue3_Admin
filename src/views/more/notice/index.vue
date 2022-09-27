<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryRef" :model="queryParams" :inline="true" label-width="68px">
      <el-form-item label="公告标题" prop="notice_title">
        <el-input v-model="queryParams.notice_title" placeholder="请输入公告标题" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="操作人员" prop="creator">
        <el-input v-model="queryParams.creator" placeholder="请输入操作人员" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="类型" prop="notice_type">
        <el-select v-model="queryParams.notice_type" placeholder="公告类型" clearable>
          <el-option v-for="dict in sys_notice_type" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button v-hasPermi="['more:notice:add']" type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button v-hasPermi="['more:notice:edit']" type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          >修改</el-button
        >
      </el-col> -->
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['more:notice:remove']"
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          >删除</el-button
        >
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table ref="tableRef" v-loading="loading" height="455" border :data="noticeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" prop="notice_id" width="100" />
      <el-table-column label="排序" align="center" prop="sort" width="60" />
      <el-table-column label="公告标题" align="center" prop="notice_title" :show-overflow-tooltip="true" />
      <el-table-column label="公告类型" align="center" prop="notice_type" width="100">
        <template #default="scope">
          <dict-tag :options="sys_notice_type" :value="scope.row.notice_type" />
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="100">
        <template #default="scope">
          <dict-tag :options="sys_notice_status" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="创建者" align="center" prop="creator" width="150" />
      <el-table-column label="创建时间" align="center" prop="created_at" width="150">
        <template #default="scope">
          <span>{{ parseTime(scope.row.created_at, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            v-hasPermi="['more:notice:edit']"
            type="primary"
            text
            icon="Edit"
            size="small"
            @click="handleUpdate(scope.row)"
            >修改</el-button
          >
          <el-button
            v-hasPermi="['more:notice:remove']"
            type="primary"
            text
            icon="Delete"
            size="small"
            @click="handleDelete(scope.row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <section class="table-footer" style="display: flex">
      <span style="font-size: 12px; color: rgb(136, 136, 136)">tip: 鼠标上下拖动改变公告排序</span>
      <pagination
        v-show="total > 0"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        :total="total"
        @pagination="getList"
      />
    </section>

    <!-- 添加或修改公告对话框 -->
    <el-dialog v-model="open" :title="title" width="80%" append-to-body>
      <el-form ref="noticeRef" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="公告标题" prop="notice_title">
              <el-input v-model="form.notice_title" placeholder="请输入公告标题" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="公告类型" prop="notice_type">
              <el-select v-model="form.notice_type" placeholder="请选择">
                <el-option v-for="dict in sys_notice_type" :key="dict.value" :label="dict.label" :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in sys_notice_status" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="文本类型">
              <el-radio-group v-model="textType" :disabled="disabled">
                <el-radio
                  v-for="dict in [
                    { label: '普通文本', value: 1 },
                    { label: 'Markdown', value: 2 }
                  ]"
                  :key="dict.value"
                  :label="dict.value"
                  >{{ dict.label }}</el-radio
                >
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item v-if="textType === 1" label="内容">
              <el-input v-model="form.notice_content" :rows="8" type="textarea" placeholder="请输入内容" />
            </el-form-item>
            <el-form-item v-else label-width="0">
              <markdown ref="markdownEditor" v-model="form.notice_content" />
            </el-form-item>
          </el-col>
        </el-row>
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

<script setup name="Notice">
import { listNotice, getNotice, delNotice, addNotice, updateNotice } from '@/api/system/notice'
import { tableRef, initSortable } from './sortable'
import Markdown from './components/markdown.vue'

const { proxy } = getCurrentInstance()
const { sys_notice_status, sys_notice_type } = proxy.useDict('sys_notice_status', 'sys_notice_type')

const noticeList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref('')
const textType = ref(1)
const markdownEditor = ref(null)

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    notice_title: undefined,
    creator: undefined,
    status: undefined
  },
  rules: {
    notice_title: [{ required: true, message: '公告标题不能为空', trigger: 'change' }],
    notice_type: [{ required: true, message: '公告类型不能为空', trigger: 'change' }]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询公告列表 */
function getList() {
  loading.value = true
  listNotice(queryParams.value).then((response) => {
    noticeList.value = response.data.list
    total.value = response.data.total
    loading.value = false
  })
}

onMounted(() => {
  initSortable(noticeList, getList)
})

/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}
/** 表单重置 */
function reset() {
  form.value = {
    notice_id: undefined,
    notice_title: undefined,
    notice_type: undefined,
    notice_content: undefined,
    status: '0'
  }
  proxy.resetForm('noticeRef')
}
/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}
/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm('queryRef')
  handleQuery()
}
/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.notice_id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}
/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加公告'
}

const disabled = ref(false)
/**修改按钮操作 */
function handleUpdate(row) {
  reset()
  disabled.value = true
  textType.value = row.textType
  const notice_id = row.notice_id || ids.value
  getNotice(notice_id).then((response) => {
    form.value = response.data
    open.value = true
    title.value = '修改公告'
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['noticeRef'].validate((valid) => {
    if (valid) {
      if (form.value.notice_id != undefined) {
        updateNotice(form.value).then((response) => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          if (textType.value === 2) {
            markdownEditor.value.reset()
          }
          reset()
          getList()
        })
      } else {
        form.value.textType = textType.value
        addNotice(form.value).then((response) => {
          proxy.$modal.msgSuccess('新增成功')
          open.value = false
          if (textType.value === 2) {
            markdownEditor.value.reset()
          }
          reset()
          getList()
        })
      }
    }
  })
}
/** 删除按钮操作 */
function handleDelete(row) {
  const notice_ids = row.notice_id || ids.value
  proxy.$modal
    .confirm('是否确认删除公告编号为"' + notice_ids + '"的数据项？')
    .then(function () {
      return delNotice(notice_ids)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
    .catch(() => {})
}

getList()
</script>

<style lang="scss" scoped>
:deep(.sortable-ghost) {
  opacity: 0.6;
  color: #fff !important;
  background: #304156 !important;
}

:deep(.el-table tr) {
  // 鼠标移至tbody tr时变为上下箭头
  cursor: s-resize;
}

.el-radio-group > label {
  margin-right: 15px;
}
</style>
