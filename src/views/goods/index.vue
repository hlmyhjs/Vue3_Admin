<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="24" :xs="24">
        <!-- 搜索 -->
        <el-form v-show="showSearch" ref="queryRef" :model="queryParams" :inline="true" label-width="68px">
          <el-form-item label="商品编号" prop="id">
            <el-input
              v-model="queryParams.id"
              placeholder="请输入商品编号"
              clearable
              style="width: 240px"
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="商品名称" prop="goods_name">
            <el-input
              v-model="queryParams.goods_name"
              placeholder="请输入商品名称"
              clearable
              style="width: 240px"
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="分类" prop="goods_kind">
            <el-select v-model="queryParams.goods_kind" clearable placeholder="请选择商品分类" style="width: 240px">
              <el-option v-for="item in kindOptions" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="商品状态" clearable style="width: 240px">
              <el-option v-for="dict in sys_goods_status" :key="dict.value" :label="dict.label" :value="dict.value" />
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
            <el-button v-hasPermi="['mall:goods:add']" type="primary" size="small" plain icon="Plus" @click="handleAdd"
              >新增</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-hasPermi="['mall:goods:edit']"
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
              v-hasPermi="['mall:goods:remove']"
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
            <el-button type="info" size="small" plain icon="Upload" @click="handleImport" v-hasPermi="['mall:goods:import']">导入</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" size="small" plain icon="Download" @click="handleExport" v-hasPermi="['mall:goods:export']">导出</el-button>
          </el-col> -->
          <right-toolbar v-model:showSearch="showSearch" :columns="columns" @queryTable="getList"></right-toolbar>
        </el-row>

        <!-- 表格 -->
        <el-table v-loading="loading" height="565" border :data="goodsList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" :selectable="selectable" width="50" align="center" />
          <el-table-column v-if="columns[0].visible" key="id" label="商品编号" align="center" width="120" prop="id" />
          <el-table-column
            v-if="columns[1].visible"
            key="goods_name"
            label="商品名称"
            align="center"
            prop="goods_name"
            :show-overflow-tooltip="true"
          />
          <el-table-column
            v-if="columns[2].visible"
            key="goods_img"
            label="图片"
            align="center"
            prop="goods_img"
            :show-overflow-tooltip="true"
            width="120"
          >
            <template #default="scope">
              <el-image
                style="width: 50px; height: 50px"
                :src="scope.row.goods_img"
                :preview-src-list="[scope.row.goods_img]"
                :initial-index="4"
                fit="cover"
              />
            </template>
          </el-table-column>
          <el-table-column
            v-if="columns[4].visible"
            key="goods_stock"
            label="库存"
            align="center"
            prop="goods_stock"
            width="120"
          />
          <el-table-column v-if="columns[4].visible" key="sales" label="销量" align="center" prop="goods_stock" width="120" />
          <el-table-column v-if="columns[5].visible" key="status" label="状态" align="center" width="120">
            <template #default="scope">
              <el-switch
                v-model="scope.row.status"
                v-hasPermi="['mall:goods:status']"
                :active-value="true"
                :inactive-value="false"
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
                v-if="scope.row.id !== 1"
                v-hasPermi="['mall:goods:edit']"
                type="primary"
                size="small"
                icon="Edit"
                text
                @click="handleUpdate(scope.row)"
                >修改</el-button
              >
              <el-button
                v-if="scope.row.id !== 1"
                v-hasPermi="['mall:goods:remove']"
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

    <!-- 添加或修改商品配置对话框 -->
    <form-drawer ref="formDrawerRef" :title="title" @submit="submitForm">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px" :inline="false" size="default">
        <el-form-item label="封面图片" prop="goods_img">
          <el-upload
            class="goods-uploader"
            action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="form.goods_img" :src="form.goods_img" class="img" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="商品分类" prop="goods_kind">
          <el-select v-model="form.goods_kind" placeholder="请选择商品分类">
            <el-option v-for="item in kindOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="商品名称" prop="goods_name">
          <el-input v-model="form.goods_name" placeholder="请输入商品名称，不能超过60个字符" />
        </el-form-item>
        <el-form-item label="库存" prop="goods_stock">
          <el-input v-model="form.goods_stock" type="number">
            <template #append>件</template>
          </el-input>
        </el-form-item>
        <el-form-item label="销量" prop="sales">
          <el-input v-model="form.sales" type="number">
            <template #append>件</template>
          </el-input>
        </el-form-item>
        <el-form-item label="原价" prop="old_price">
          <el-input v-model="form.old_price" type="number">
            <template #append>元</template>
          </el-input>
        </el-form-item>
        <el-form-item label="售价" prop="price">
          <el-input v-model="form.price" type="number">
            <template #append>元</template>
          </el-input>
        </el-form-item>
        <el-form-item label="标签" prop="tag">
          <el-tag>Tag 1</el-tag>
          <el-tag class="ml-2" type="success">Tag 2</el-tag>
          <el-tag class="ml-2" type="info">Tag 3</el-tag>
          <el-tag class="ml-2" type="warning">Tag 4</el-tag>
          <el-tag class="ml-2" type="danger">Tag 5</el-tag>
        </el-form-item>
        <el-form-item label="是否上架" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="true" border>上架</el-radio>
            <el-radio :label="false" border>下架</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="商品描述" prop="desc">
          <el-input
            v-model="form.desc"
            type="textarea"
            :rows="3"
            placeholder="选填，商品卖点简述，例如：此款商品美观大方 性价比较高 不容错过"
          />
        </el-form-item>
      </el-form>
    </form-drawer>

    <!-- 商品导入对话框 -->
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
import { changeUserStatus, listGoods, delGoods, getGoods, updateGoods, addGoods, getKindList } from '@/api/goods'

const { proxy } = getCurrentInstance()
const { sys_goods_status } = proxy.useDict('sys_goods_status')

const goodsList = ref([])
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref('')
const dateRange = ref([])
const kindOptions = ref([])
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
    id: undefined,
    goods_name: undefined,
    goods_kind: undefined,
    status: undefined,
    created_at: []
  },
  rules: {
    goods_name: [
      { required: true, message: '商品名称不能为空', trigger: 'blur' },
      {
        min: 4,
        max: 50,
        message: '商品名称称长度必须介于 4 和 50 之间',
        trigger: 'blur'
      }
    ],
    goods_img: [
      {
        required: true,
        message: '请上传商品图片',
        trigger: ['blur']
      }
    ],
    goods_stock: [
      {
        required: true,
        message: '请输入商品库存',
        trigger: ['blur']
      }
    ],
    price: [
      {
        required: true,
        message: '请输入商品价格',
        trigger: ['blur']
      }
    ]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询商品列表 */
function getList() {
  loading.value = true
  listGoods(proxy.addDateRange(queryParams.value, dateRange.value)).then((res) => {
    loading.value = false
    goodsList.value = res.data.list
    total.value = res.data.total
  })
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
    .confirm('是否确认删除编号为"' + id + '"的商品？')
    .then(function () {
      return delGoods(id)
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
//     'mall/goods/export',
//     {
//       ...queryParams.value
//     },
//     `goods_${new Date().getTime()}.xlsx`
//   )
// }
/** 商品状态修改  */
function handleStatusChange(row) {
  const text = row.status === true ? '上架' : '下架'
  proxy.$modal
    .confirm('确认要"' + text + '""' + row.goods_name + '"这个商品吗?')
    .then(function () {
      return changeUserStatus(row.id, row.status)
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

// 禁止选中某一项
const selectable = (row, index) => row.id !== 1

/** 导入按钮操作 */
// function handleImport() {
//   upload.title = '用户导入'
//   upload.open = true
// }
/** 下载模板操作 */
function importTemplate() {
  // console.log('下载模板');
  // return
  proxy.download('system/user/importTemplate', {}, `user_template_${new Date().getTime()}.xlsx`)
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

/** 初始化分类数据 */
const initKindList = async () => {
  // 判断数据是否存在，存在不获取，不存在则获取
  if (kindOptions.value.length === 0) {
    const { data } = await getKindList()
    kindOptions.value = data
  }
}
/** 重置操作表单 */
function reset() {
  form.value = {
    id: undefined,
    goods_name: undefined,
    goods_img: undefined,
    goods_stock: undefined,
    sales: undefined,
    status: '0',
    goods_kind: undefined
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
  initKindList()
  form.value.status = true
  // 默认图片
  form.value.goods_img = 'https://img.gejiba.com/images/77fd22e5aca8a7e659eb8bbc88cd0514.th.jpg'
  formDrawerRef.value.open()
  title.value = '添加商品'
}

const formDrawerRef = ref(null)
/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  if (!kindOptions.value.length) initKindList()
  const goodsId = row.id || ids.value
  getGoods(goodsId).then(async (response) => {
    form.value = response.data
    formDrawerRef.value.open()
    title.value = '修改商品'
  })
}

const formRef = ref(null)
/** 提交按钮 */
function submitForm() {
  // proxy.$refs['formDrawerRef'].validate((valid) => {
  formRef.value.validate((valid) => {
    if (valid) {
      if (form.value.id != undefined) {
        updateGoods(form.value).then((response) => {
          proxy.$modal.msgSuccess('修改成功')
          formDrawerRef.value.close()
          getList()
        })
      } else {
        delete form.value.id
        form.value.price = Number(form.value.price)
        form.value.goods_stock = Number(form.value.goods_stock)
        addGoods(form.value).then((response) => {
          proxy.$modal.msgSuccess('新增成功')
          formDrawerRef.value.close()
          getList()
        })
      }
    }
  })
}

// 商品图片上传
const imageUrl = ref('')

const handleAvatarSuccess = (response, uploadFile) => {
  imageUrl.value = URL.createObjectURL(uploadFile.raw)
}

const beforeAvatarUpload = (rawFile) => {
  console.log(rawFile)
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

initKindList()
getList()
</script>

<style lang="scss">
.goods-uploader .img {
  width: 150px;
  // height: 150px;
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
