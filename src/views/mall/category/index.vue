<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryRef" :model="queryParams" :inline="true">
      <el-form-item label="分类名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入分类名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="显示状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="分类状态" clearable>
          <el-option v-for="dict in sys_show_hide" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button v-hasPermi="['mall:category:add']" type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain icon="Sort" @click="toggleExpandAll">展开/折叠</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table
      v-if="refreshTable"
      v-loading="loading"
      height="640"
      :data="CategoryList"
      row-key="id"
      border
      :default-expand-all="isExpandAll"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    >
      <el-table-column prop="name" label="分类名称" :show-overflow-tooltip="true" min-width="125"></el-table-column>
      <el-table-column prop="icon" label="图片" align="center" min-width="120">
        <template #default="scope">
          <el-image
            style="width: 100px; height: 50px"
            :src="scope.row.pic"
            :preview-src-list="[scope.row.pic]"
            :initial-index="4"
            fit="cover"
          />
        </template>
      </el-table-column>
      <el-table-column prop="level" label="级别" align="center" :show-overflow-tooltip="true">
        <template #default="scope">
          <el-tag v-if="scope.row.level === 1">一级</el-tag>
          <el-tag v-else class="ml-2" type="success">二级</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" align="center" width="80"></el-table-column>
      <el-table-column prop="home_show" label="首页导航" :show-overflow-tooltip="true" align="center">
        <template #default="scope">
          <el-switch
            v-if="scope.row.level === 2"
            v-model="scope.row.home_show"
            v-hasPermi="['mall:category:edit']"
            :active-value="true"
            :inactive-value="false"
            @change="handleHomeShow(scope.row)"
          ></el-switch>
          <span v-else> — </span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" align="center">
        <template #default="scope">
          <el-switch
            v-model="scope.row.status"
            v-hasPermi="['mall:category:edit']"
            :active-value="true"
            :inactive-value="false"
            @change="handleStatusChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" min-width="105">
        <template #default="scope">
          <span>{{ parseTime(scope.row.created_at) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="200" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            v-hasPermi="['mall:category:edit']"
            type="primary"
            text
            icon="Edit"
            size="small"
            @click="handleUpdate(scope.row)"
            >修改</el-button
          >
          <el-button
            v-show="scope.row.level === 1"
            v-hasPermi="['mall:category:add']"
            type="primary"
            text
            icon="Plus"
            size="small"
            @click="handleAdd(scope.row)"
            >新增</el-button
          >
          <el-button
            v-hasPermi="['mall:category:remove']"
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

    <!-- 添加或修改菜单对话框 -->
    <el-dialog v-model="open" :title="title" :width="diaLogWidth" append-to-body>
      <el-form ref="CategoryRef" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="分类图片" prop="pic">
              <el-upload
                class="goods-uploader"
                action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
                :show-file-list="false"
                :on-success="handleAvatarSuccess"
                :before-upload="beforeAvatarUpload"
              >
                <img v-if="form.pic" :src="form.pic" class="img" />
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              </el-upload>
            </el-form-item>
            <el-form-item label="菜单名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入分类名称" />
            </el-form-item>
            <el-form-item label="上级分类" prop="pid">
              <el-tree-select
                v-model="form.pid"
                :data="CategoryOptions"
                :props="{ value: 'id', label: 'name', children: 'children' }"
                value-key="id"
                placeholder="选择上级菜单"
                :render-after-expand="false"
                check-strictly
              />
            </el-form-item>
            <el-form-item label="显示排序" prop="sort">
              <el-input-number v-model="form.sort" :min="1" :max="20" />
            </el-form-item>
            <el-form-item label="是否显示">
              <el-switch v-model="form.status" :active-value="true" :inactive-value="false"></el-switch>
            </el-form-item>
            <el-form-item v-show="form.level === 2" label="首页展示">
              <el-switch v-model="form.home_show" :active-value="true" :inactive-value="false"></el-switch>
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
    <choose-category ref="ChooseCategoryRef" />
  </div>
</template>

<script setup name="Category">
import ChooseCategory from './components/ChooseCategory.vue'
import { useWindowSize } from '@vueuse/core'
// import { toast, showLoading, hideLoading } from './components/util'
import { toast, hideLoading } from './components/util'
import {
  addCategory,
  updateCategory,
  changeStatus,
  changeShowHome,
  delCategory,
  getCategory,
  listCategory,
  categoryFirstList,
  addToRecommend,
  removeRecommend
} from '@/api/mall/category'

const { proxy } = getCurrentInstance()
const { sys_show_hide } = proxy.useDict('sys_show_hide', 'sys_normal_disable')

const CategoryList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const title = ref('')
const CategoryOptions = ref([])
const isExpandAll = ref(false)
const refreshTable = ref(true)
const ChooseCategoryRef = ref(null)

const data = reactive({
  form: {},
  queryParams: {
    name: undefined,
    visible: undefined
  },
  rules: {
    name: [{ required: true, message: '分类名称不能为空', trigger: 'blur' }],
    sort: [{ required: true, message: '显示顺序不能为空', trigger: 'blur' }],
    pid: [{ required: true, message: '上级分类不能为空', trigger: 'blur' }]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询菜单列表 */
function getList() {
  loading.value = true
  listCategory(queryParams.value).then((response) => {
    CategoryList.value = response.data
    loading.value = false
  })
}
/** 查询菜单下拉树结构 */
function getTreeselect() {
  CategoryOptions.value = []
  categoryFirstList().then((res) => {
    const Category = { id: 0, name: '主类目', children: [] }
    Category.children = res.data
    CategoryOptions.value.push(Category)
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
    id: undefined,
    pid: 0,
    name: undefined,
    sort: 1,
    status: true
  }
  proxy.resetForm('CategoryRef')
}
/** 搜索按钮操作 */
function handleQuery() {
  getList()
}
/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm('queryRef')
  handleQuery()
}
/** 新增按钮操作 */
async function handleAdd(row) {
  if (row.id === 238) {
    // 热门分类单独处理
    // const pid = row.id
    ChooseCategoryRef.value.open((sIds) => {
      // showLoading(true)
      addToRecommend({ sIds })
        .then((res) => {
          getList()
          toast('添加成功')
        })
        .finally(() => hideLoading())
    })
    return
  }
  reset()
  if (CategoryOptions.value.length === 0) {
    await getTreeselect()
  }
  if (row != null && row.id) {
    form.value.pid = row.id
  } else {
    form.value.pid = 0
    form.value.level = 1
  }

  open.value = true
  title.value = '添加菜单'
}
/** 展开/折叠操作 */
function toggleExpandAll() {
  refreshTable.value = false
  isExpandAll.value = !isExpandAll.value
  nextTick(() => {
    refreshTable.value = true
  })
}
/** 修改按钮操作 */
async function handleUpdate(row) {
  reset()
  if (CategoryOptions.value.length === 0) {
    await getTreeselect()
  }
  getCategory(row.id).then((response) => {
    form.value = response.data
    open.value = true
    title.value = '修改菜单'
  })
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['CategoryRef'].validate((valid) => {
    if (valid) {
      if (form.value.id != undefined) {
        updateCategory(form.value).then((response) => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        addCategory(form.value).then((response) => {
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
  if (row.id === 238) return // 热门分类不能删除
  if (row.hot) {
    // 如果属于热门分类
    proxy.$modal
      .confirm('确认将【' + row.name + '】移除热门分类?')
      .then(function () {
        return removeRecommend({ id: row.id })
      })
      .then(() => {
        getList()
        proxy.$modal.msgSuccess('移除成功')
      })
      .catch(() => {})
    return
  }
  proxy.$modal
    .confirm('是否确认删除"' + row.name + '"这个分类?')
    .then(function () {
      return delCategory(row.id)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
    .catch(() => {})
}

/** 状态修改  */
function handleStatusChange(row) {
  const text = row.status === true ? '显示' : '隐藏'
  proxy.$modal
    .confirm('确认要' + text + '"' + row.name + '"这个分类吗?')
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
/** 首页展示 */
function handleHomeShow(row) {
  const text = row.home_show === true ? '在商城首页展示' : '在商城首页隐藏'
  proxy.$modal
    .confirm('确认要' + text + '"' + row.name + '"这个分类吗?')
    .then(function () {
      return changeShowHome(row.id, row.home_show)
    })
    .then(() => {
      proxy.$modal.msgSuccess(text + '成功')
    })
    .catch(function () {
      row.home_show = row.home_show !== true
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

const { width } = useWindowSize()
const WIDTH = 992
const diaLogWidth = ref('500px')
watch(width, (newWidth) => {
  diaLogWidth.value = newWidth - 1 < WIDTH ? '98%' : '500px'
})

getList()
</script>

<style lang="scss">
.goods-uploader {
  width: 100%;
  .img {
    height: 126px;
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
  width: 100%;
  height: 100px;
  text-align: center;
}

.el-table {
  th.el-table__cell,
  td.el-table__cell {
    position: static !important;
  }
}
</style>
