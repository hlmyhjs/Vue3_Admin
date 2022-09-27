<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!--用户数据-->
      <el-col :span="24" :xs="24">
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button v-hasPermi="['mall:grade:add']" type="primary" size="small" plain icon="Plus" @click="handleAdd"
              >新增</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-hasPermi="['mall:grade:edit']"
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
              v-hasPermi="['mall:grade:remove']"
              type="danger"
              size="small"
              plain
              icon="Delete"
              :disabled="multiple"
              @click="handleDelete"
              >删除</el-button
            >
          </el-col>
        </el-row>

        <!-- 表格 -->
        <el-table v-loading="loading" border :data="levelList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column key="id" label="等级编号" align="center" prop="id" />
          <el-table-column key="level_name" label="等级名称" align="center" prop="level_name" :show-overflow-tooltip="true" />
          <el-table-column key="level_value" label="等级值" align="center" prop="level_value" :show-overflow-tooltip="true" />
          <el-table-column key="amount" label="消费额度" align="center" prop="amount" width="120" />
          <el-table-column key="discount" label="折扣率" align="center" prop="discount" :show-overflow-tooltip="true" />
          <el-table-column key="status" label="状态" align="center">
            <template #default="scope">
              <el-switch
                v-model="scope.row.status"
                v-hasPermi="['mall:grade:edit']"
                :active-value="true"
                :inactive-value="false"
                @change="handleStatusChange(scope.row)"
              ></el-switch>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="center" prop="createTime" width="160">
            <template #default="scope">
              <span>{{ parseTime(scope.row.created_at) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="250" class-name="small-padding fixed-width">
            <template #default="scope">
              <el-button
                v-hasPermi="['mall:grade:edit']"
                type="primary"
                size="small"
                icon="Edit"
                text
                @click="handleUpdate(scope.row)"
                >修改</el-button
              >
              <el-button
                v-hasPermi="['mall:grade:remove']"
                type="primary"
                size="small"
                icon="Delete"
                text
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
      </el-col>
    </el-row>

    <el-dialog v-model="open" :title="title">
      <el-form ref="levelRef" :model="form" :rules="rules" label-width="80px" :inline="false" size="default">
        <el-form-item label="等级名称" prop="level_name">
          <el-input v-model="form.level_name"></el-input>
        </el-form-item>
        <el-form-item label="等级值" prop="level_value">
          <el-input v-model="form.level_value" type="number" style="width: 50%"></el-input>
        </el-form-item>
        <el-form-item label="是否启用" prop="status">
          <el-switch v-model="form.status" :active-value="true" :inactive-value="false"></el-switch>
        </el-form-item>
        <el-form-item label="升级条件">
          <div class="mb-2">
            <small class="text-xs mr-2">累计消费满</small>
            <el-input v-model="form.amount" type="number" placeholder="累计消费" style="width: 50%">
              <template #append>元</template>
            </el-input>
            <small class="text-xs flex text-gray-400"> 设置会员等级所需要的累计消费必须大于等于0,单位：元 </small>
          </div>
        </el-form-item>
        <el-form-item label="折扣率(%)">
          <el-input v-model="form.discount" type="number" placeholder="折扣率" style="width: 50%">
            <template #append>%</template>
          </el-input>
          <small class="text-gray-400 leading-tight flex">
            折扣率单位为百分比，如输入90，表示该会员等级的用户可以以商品原价的90%购买
          </small>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancel">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="User">
import { list, detail, create, update, changeStatus, remove } from '@/api/mall/grade'

const { proxy } = getCurrentInstance()

const levelList = ref([])
const open = ref(false)
const loading = ref(true)
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
    level_name: undefined,
    amount: undefined,
    status: undefined
  },
  rules: {
    level_name: [
      { required: true, message: '等级名称不能为空', trigger: 'blur' },
      {
        min: 4,
        max: 10,
        message: '等级长度必须介于 4 和 10 之间',
        trigger: 'blur'
      }
    ]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询列表 */
function getList() {
  loading.value = true
  list(proxy.addDateRange(queryParams.value, dateRange.value)).then((res) => {
    loading.value = false
    levelList.value = res.data.list
    total.value = res.data.total
  })
}

/** 删除按钮操作 */
function handleDelete(row) {
  const id = row.id || ids.value
  proxy.$modal
    .confirm('是否确认删除编号为"' + id + '"的等级吗？')
    .then(function () {
      return remove(id)
    })
    .then((res) => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
    .catch(() => {})
}

/** 状态修改  */
function handleStatusChange(row) {
  const text = row.status === true ? '启用' : '停用'
  proxy.$modal
    .confirm('确认要' + text + '' + row.level_name + '吗?')
    .then(function () {
      return changeStatus(row.id, row.status)
    })
    .then(() => {
      proxy.$modal.msgSuccess(text + '成功')
    })
    .catch(function () {
      row.status = row.status === true ? 0 : true
    })
}

/** 选择条数  */
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 重置操作表单 */
function reset() {
  form.value = {
    created_at: undefined,
    discount: undefined,
    id: undefined,
    level_id: undefined,
    amount: undefined,
    level_value: undefined,
    remark: undefined,
    level_name: undefined
  }
  proxy.resetForm('levelRef')
}
/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}
/** 新增按钮操作 */
function handleAdd() {
  reset()
  form.value.status = true
  open.value = true
  title.value = '添加等级'
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const id = row.id || ids.value
  detail(id).then(async (response) => {
    form.value = response.data
    open.value = true
    title.value = '修改等级'
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['levelRef'].validate((valid) => {
    if (valid) {
      if (form.value.id != undefined) {
        update(form.value).then((response) => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        create(form.value).then((response) => {
          proxy.$modal.msgSuccess('新增成功')
          open.value = false
          getList()
        })
      }
    }
  })
}

getList()
</script>
