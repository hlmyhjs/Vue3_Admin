<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="24" :xs="24">
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button
              v-hasPermi="['mall:home:banner:add']"
              type="primary"
              size="small"
              plain
              icon="Plus"
              :disabled="total > 9"
              @click="handleAdd"
              >新增</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-hasPermi="['mall:home:banner:edit']"
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
              v-hasPermi="['mall:home:banner:remove']"
              type="danger"
              size="small"
              plain
              icon="Delete"
              :disabled="multiple"
              @click="handleDelete"
              >删除</el-button
            >
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" :columns="columns" @queryTable="getList"></right-toolbar>
        </el-row>

        <!-- 表格 -->
        <el-table v-loading="loading" border :data="bannerList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column v-if="columns[0].visible" key="id" label="图片编号" align="center" width="120" prop="id" />
          <el-table-column
            v-if="columns[1].visible"
            key="navigate_url"
            label="跳转链接"
            align="center"
            prop="navigate_url"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="columns[2].visible"
            key="img_url"
            label="图片"
            align="center"
            prop="img_url"
            :show-overflow-tooltip="true"
            width="120"
          >
            <template #default="scope">
              <el-image
                style="width: 80px"
                :src="scope.row.img_url"
                :preview-src-list="[scope.row.img_url]"
                :initial-index="4"
                fit="cover"
              />
            </template>
          </el-table-column>
          <el-table-column v-if="columns[0].visible" key="id" label="显示顺序" align="center" width="120" prop="sort" />
          <el-table-column v-if="columns[4].visible" key="sort" label="商品ID" align="center" prop="goods_id" width="120" />
          <el-table-column v-if="columns[5].visible" key="status" label="状态" align="center" width="120">
            <template #default="scope">
              <el-switch
                v-model="scope.row.status"
                v-hasPermi="['mall:home:banner:edit']"
                :active-value="true"
                :inactive-value="false"
                :disabled="initData.indexOf(scope.row.id) > -1"
                @change="handleStatusChange(scope.row)"
              ></el-switch>
            </template>
          </el-table-column>
          <el-table-column v-if="columns[6].visible" label="创建时间" align="center" prop="created_at">
            <template #default="scope">
              <span>{{ parseTime(scope.row.created_at) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="250" class-name="small-padding fixed-width">
            <template #default="scope">
              <el-button
                v-hasPermi="['mall:home:banner:edit']"
                type="primary"
                size="small"
                icon="Edit"
                text
                :disabled="initData.indexOf(scope.row.id) > -1"
                @click="handleUpdate(scope.row)"
                >修改</el-button
              >
              <el-button
                v-hasPermi="['mall:home:banner:remove']"
                type="primary"
                size="small"
                icon="Delete"
                text
                :disabled="initData.indexOf(scope.row.id) > -1"
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

    <!-- 添加或修改配置对话框 -->
    <el-dialog v-model="open" :title="title" append-to-body>
      <el-form ref="editFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="图片地址" prop="img_url">
          <el-tabs v-model="activeName" type="border-card" style="width: 100%" class="demo-tabs">
            <el-tab-pane label="填写地址" name="first">
              <el-input v-model="form.img_url" placeholder="请输入图片地址" />
            </el-tab-pane>
            <el-tab-pane label="在线上传" name="second">
              <el-upload
                class="goods-uploader"
                action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
                :show-file-list="false"
                :on-success="handleAvatarSuccess"
                :before-upload="beforeAvatarUpload"
              >
                <img v-if="form.img_url" :src="form.img_url" class="img" />
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              </el-upload>
            </el-tab-pane>
          </el-tabs>
        </el-form-item>
        <el-form-item label="跳转链接" prop="navigate_url">
          <el-input v-model="form.navigate_url" placeholder="请输入跳转链接" />
        </el-form-item>
        <el-form-item label="显示顺序" prop="sort">
          <el-input-number v-model="form.sort" class="mx-4" :min="1" :max="10" />
        </el-form-item>
        <el-form-item label="商品 ID" prop="goods_id">
          <el-input-number v-model="form.goods_id" class="mx-4" :min="1" :max="999999" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in sys_show_hide" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
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

<script setup name="Home">
import { changeStatus, listBanner, delBanner, getBanner, updateBanner, addbanner } from '@/api/mall/home/banner'

const { proxy } = getCurrentInstance()
const { sys_show_hide } = proxy.useDict('sys_show_hide')

const bannerList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref('')
const dateRange = ref([])
const activeName = ref('first')
const initData = [1, 2, 3]
// 列显隐信息
const columns = ref([
  { key: 0, label: `商品编号`, visible: true },
  { key: 1, label: `商品名称`, visible: true },
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
    navigate_url: undefined,
    goods_kind: undefined,
    status: undefined,
    created_at: []
  },
  rules: {
    img_url: [
      {
        required: true,
        message: '图片地址不能为空',
        trigger: ['blur']
      }
    ]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询列表 */
function getList() {
  loading.value = true
  listBanner(proxy.addDateRange(queryParams.value, dateRange.value)).then((res) => {
    loading.value = false
    bannerList.value = res.data.list
    total.value = res.data.total
  })
}

const check = (arr) => arr.filter((val) => initData.indexOf(val) > -1)
/** 删除按钮操作 */
function handleDelete(row) {
  const id = row.id || ids.value
  let validId
  if (typeof id === 'number') {
    validId = id
  } else if (id.length === 1) {
    validId = id[0]
  } else {
    proxy.$modal.msgWarning(`${check(id)}属于原始数据不允许该项操作, 请先添加新数据`)
    return
  }
  if (initData.indexOf(validId) !== -1) {
    proxy.$modal.msgWarning('原始数据不允许该项操作, 请先添加新数据')
    return
  }
  proxy.$modal
    .confirm('是否确认删除编号为"' + id + '"的轮播图？')
    .then(function () {
      return delBanner(id)
    })
    .then((res) => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
    .catch(() => {})
}

/** 状态修改  */
function handleStatusChange(row) {
  const text = row.status === true ? '显示' : '隐藏'
  proxy.$modal
    .confirm('确认要' + text + '' + ' id为: ' + row.id + ' 这张图片吗吗?')
    .then(function () {
      return changeStatus(row.id, row.status)
    })
    .then(() => {
      proxy.$modal.msgSuccess(text + '成功')
    })
    .catch(function () {
      row.status = row.status !== true
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
    id: undefined,
    navigate_url: undefined,
    img_url: undefined,
    sort: 1,
    goods_id: undefined,
    sales: undefined,
    status: '0',
    goods_kind: undefined
  }
  proxy.resetForm('userRef')
}
/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}
/** 新增按钮操作 */
function handleAdd() {
  reset()
  form.value.status = '1'
  open.value = true
  title.value = '添加轮播图'
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const id = row.id || ids.value
  const validId = typeof id === 'number' ? id : id[0]
  if (initData.indexOf(validId) !== -1) {
    proxy.$modal.msgWarning('原始数据不允许该项操作, 请先添加新数据')
    return
  }
  getBanner(id).then(async (response) => {
    form.value = response.data
    form.value.status = Number(response.data.status) + ''
    open.value = true
    title.value = '修改轮播图'
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['editFormRef'].validate((valid) => {
    if (valid) {
      if (form.value.id != undefined) {
        updateBanner(form.value).then((response) => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        delete form.value.id
        addbanner(form.value).then((response) => {
          proxy.$modal.msgSuccess('新增成功')
          open.value = false
          getList()
        })
      }
    }
  })
}

// 图片上传
const imageUrl = ref('')

const handleAvatarSuccess = (response, uploadFile) => {
  imageUrl.value = URL.createObjectURL(uploadFile.raw)
}

const beforeAvatarUpload = (rawFile) => {
  if (rawFile.type !== 'image/jpeg') {
    // eslint-disable-next-line no-undef
    ElMessage.error('Avatar picture must be JPG format!')
    return false
  } else if (rawFile.size / 1024 / 1024 > 2) {
    // eslint-disable-next-line no-undef
    ElMessage.error('Avatar picture size can not exceed 2MB!')
    return false
  }
  return true
}
getList()
</script>

<style lang="scss">
.goods-uploader {
  .img {
    width: 100%;
    height: 100%;
    display: block;
  }
  .el-upload {
    width: 100%;
    border: 1px dashed var(--el-border-color);
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: var(--el-transition-duration-fast);

    &:hover {
      border-color: var(--el-color-primary);
    }
  }
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 150px;
  height: 150px;
  text-align: center;
}

.el-table {
  th.el-table__cell,
  td.el-table__cell {
    // 设置position 使得 子元素不与其产生新的层叠关系
    position: static !important;
  }
}
</style>
