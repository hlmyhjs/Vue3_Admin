<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="24" :xs="24">
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button
              v-hasPermi="['mall:home:recommend:add']"
              type="primary"
              size="default"
              plain
              icon="Plus"
              :disabled="total > 10"
              @click="handleAdd"
              >新增推荐</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button
              v-hasPermi="['mall:home:recommend:remove']"
              type="danger"
              size="default"
              plain
              icon="Delete"
              :disabled="single"
              @click="handleDelete"
              >移除推荐</el-button
            >
          </el-col>
        </el-row>
        <el-row>
          <span style="font-size: 12px; color: #888"
            ><i style="vertical-align: sub; color: red">*</i> tip: 单击选中商品后点击左上角可移出推荐列表</span
          >
        </el-row>

        <!-- 表格 -->
        <el-table
          v-loading="loading"
          height="640"
          highlight-current-row
          border
          :data="RecommendList"
          @current-change="handleSelectionChange"
        >
          <el-table-column key="id" label="商品编号" align="center" width="100" prop="id" />
          <el-table-column key="goods_name" label="商品名称" align="center" min-width="205" prop="goods_name" />
          <el-table-column
            key="goods_img"
            label="封面图"
            align="center"
            prop="goods_img"
            :show-overflow-tooltip="true"
            width="150"
          >
            <template #default="scope">
              <el-image
                style="width: 60px"
                :src="scope.row.goods_img"
                :preview-src-list="[scope.row.goods_img]"
                :initial-index="4"
                fit="cover"
              />
            </template>
          </el-table-column>
          <el-table-column key="sales" label="销量" align="center" prop="sales" :show-overflow-tooltip="true" min-width="100">
          </el-table-column>
          <el-table-column key="id" label="显示顺序" align="center" min-width="200" prop="recommend_sort">
            <template #default="scope">
              <el-input-number
                v-model="scope.row.recommend_sort"
                :min="1"
                :max="10"
                @change="handleChange(scope.$index, scope.row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="center" prop="created_at" min-width="125">
            <template #default="scope">
              <span>{{ parseTime(scope.row.created_at) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" min-width="120" class-name="small-padding fixed-width">
            <template #default="scope">
              <el-button
                v-hasPermi="['mall:home:recommend:remove']"
                v-Disabled="scope.row.id"
                type="primary"
                icon="Delete"
                text
                @click="handleDelete(scope.row)"
                >移除推荐</el-button
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
      <el-form ref="editFormRef" :model="queryParams" label-width="80px">
        <el-form-item label="商品名称" prop="goods_name">
          <el-input v-model="queryParams.goods_name" placeholder="请输入商品名称" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="商品编号" prop="id">
          <el-input
            v-model="queryParams.id"
            onkeyup="value=value.replace(/[^\d]/g,'').replace(/^0{1,}/g,'')"
            placeholder="请输入商品编号"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="商品分类" prop="goods_kind">
          <el-select v-model="queryParams.goods_kind" clearable placeholder="请选择商品分类">
            <el-option v-for="item in kindOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
      <span style="font-size: 12px; color: #888"
        ><i style="vertical-align: sub; color: red">*</i> tip: 单击选中商品后点击右下角确定添加推荐</span
      >
      <el-table
        :data="tableData"
        border
        height="250"
        highlight-current-row
        style="width: 100%"
        @current-change="handleCurrentChange"
      >
        <el-table-column prop="id" align="center" width="80" label="商品编号" />
        <el-table-column prop="goods_name" align="center" label="商品名称" />
        <el-table-column prop="goods_img" align="center" width="125" label="商品图片">
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
      </el-table>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="confirmAdd">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Home">
import { changeRecommend_sort, listRecommend, delRecommend, listGoods, addRecommend } from '@/api/mall/home/recommend'
import { getKindList } from '@/api/goods'

const { proxy } = getCurrentInstance()

const RecommendList = ref([])
const open = ref(false)
const loading = ref(true)
const ids = ref([])
const single = ref(true)
const total = ref(0)
const title = ref('')
const dateRange = ref([])
const kindOptions = ref([])
const tableData = ref([])
const recommendId = ref(null)

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    id: undefined,
    goods_name: undefined,
    goods_kind: undefined,
    created_at: []
  }
})

const { queryParams, form } = toRefs(data)

const vDisabled = {
  mounted: (el, binding) => {
    const initData = [61293, 45880, 52702, 53741, 62334, 62296, 55410, 62841, 54296]
    if (initData.indexOf(binding.value) !== -1) {
      el.disabled = true
    }
  }
}

/** 查询列表 */
function getList() {
  loading.value = true
  listRecommend(proxy.addDateRange(queryParams.value, dateRange.value)).then((res) => {
    loading.value = false
    RecommendList.value = res.data.list
    total.value = res.data.total
  })
}

const getGoodsList = async () => {
  const {
    data: { list }
  } = await listGoods(queryParams.value)
  tableData.value = list
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1
  getGoodsList()
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm('editFormRef')
  handleQuery()
}

/** 初始化分类数据 */
const initKindList = async () => {
  // 判断数据是否存在，存在不获取，不存在则获取
  if (kindOptions.value.length === 0) {
    const { data } = await getKindList()
    kindOptions.value = data
  }
}

/** 删除按钮操作 */
function handleDelete(row) {
  const id = row.id || ids.value
  const initData = [61293, 45880, 52702, 53741, 62334, 62296, 55410, 62841, 54296]
  if (initData.indexOf(id) !== -1) {
    proxy.$modal.msgWarning('原始数据不允许该项操作, 请先添加新数据')
    return
  }
  proxy.$modal
    .confirm('是否确认将商品"' + id + '"移出推荐列表？')
    .then(function () {
      return delRecommend(id)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('移出成功')
    })
    .catch(() => {})
}

/** 选择条数  */
function handleSelectionChange(row) {
  ids.value = row?.id
  single.value = !row?.id
}

/** 单选 */
const handleCurrentChange = (currentRow) => {
  recommendId.value = currentRow?.id
}

/** 重置操作表单 */
function reset() {
  form.value = {
    id: undefined,
    navigator_url: undefined,
    goods_img: undefined,
    sort: 1,
    goods_kind: undefined,
    goods_name: undefined
  }
  proxy.resetForm('editFormRef')
}
/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}
/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = '添加推荐'
  initKindList()
  if (!tableData.value.length) getGoodsList()
}

/** 修改显示顺序 */
const handleChange = async (index, row) => {
  const sort = row.recommend_sort
  if (sort < 1 || sort > 10) {
    proxy.$modal.msgWarning('请输入1-10之间的数')
    return
  }
  await changeRecommend_sort(row.id, sort)
  getList()
}

// 确认添加推荐商品
const confirmAdd = async () => {
  if (recommendId.value) {
    const res = await addRecommend(recommendId.value)
    if (res.success) {
      proxy.$modal.msgSuccess('新增成功')
      tableData.value = []
      reset()
      open.value = false
      getList()
    }
  } else {
    proxy.$modal.msgWarning('请先选择要添加到推荐列表的商品')
  }
}

getList()
</script>

<style lang="scss">
.el-table {
  th.el-table__cell,
  td.el-table__cell {
    // 设置position 使得 子元素不与其产生新的层叠关系
    position: static !important;
  }
}
</style>
