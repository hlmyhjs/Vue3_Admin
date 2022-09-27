<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!--用户数据-->
      <el-col :span="24" :xs="24">
        <!-- 搜索 -->
        <el-form v-show="showSearch" ref="queryRef" :model="queryParams" :inline="true" label-width="68px">
          <el-form-item label="订单编号" prop="order_number">
            <el-input
              v-model="queryParams.order_number"
              placeholder="请输入订单编号"
              clearable
              style="width: 240px"
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="下单账号" prop="user_id">
            <el-input
              v-model="queryParams.user_id"
              placeholder="请输入下单账号"
              clearable
              style="width: 240px"
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="订单状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="订单状态" clearable style="width: 240px">
              <el-option v-for="order in mall_order_status" :key="order.value" :label="order.label" :value="order.value" />
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
            <el-button
              v-hasPermi="['mall:order:remove']"
              type="danger"
              size="small"
              plain
              icon="Delete"
              :disabled="multiple"
              @click="handleDelete"
              >删除订单</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button v-hasPermi="['mall:order:export']" type="warning" size="small" plain icon="Download" @click="handleExport"
              >导出</el-button
            >
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" :columns="columns" @queryTable="getList"></right-toolbar>
        </el-row>

        <!-- 表格 -->
        <el-table v-loading="loading" height="455" border :data="orderList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" :selectable="selectable" width="50" align="center" />
          <el-table-column v-if="columns[0].visible" label="编号" align="center" min-width="80" prop="id" />
          <el-table-column
            v-if="columns[1].visible"
            label="订单编号"
            align="center"
            prop="order_number"
            :show-overflow-tooltip="true"
            min-width="210"
          />
          <el-table-column
            v-if="columns[2].visible"
            label="订单总价"
            align="center"
            prop="total"
            :show-overflow-tooltip="true"
            min-width="110"
          />
          <el-table-column v-if="columns[4].visible" label="下单账号" align="center" prop="user_id" min-width="110" />
          <el-table-column v-if="columns[5].visible" label="订单状态" align="center" min-width="100">
            <template #default="scope">
              <el-tag v-if="scope.row.status === 0" type="danger">待支付</el-tag>
              <el-tag v-else-if="scope.row.status === 1" class="ml-2">待发货</el-tag>
              <el-tag v-else-if="scope.row.status === 2" class="ml-2" type="warning">已发货</el-tag>
              <el-tag v-else-if="scope.row.status === 3" class="ml-2" type="success">已完成</el-tag>
              <el-tag v-else class="ml-2" type="info">已关闭</el-tag>
            </template>
          </el-table-column>
          <el-table-column v-if="columns[6].visible" label="创建时间" align="center" prop="createTime" min-width="160">
            <template #default="scope">
              <span>{{ parseTime(scope.row.created_at) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" min-width="250" align="center" class-name="small-padding fixed-width">
            <template #default="scope">
              <el-button
                v-hasPermi="['mall:order:detail']"
                type="success"
                size="small"
                icon="Tickets"
                text
                @click="orderDetail(scope.row)"
                >订单详情</el-button
              >
              <el-button
                v-if="scope.row.status === 1"
                v-hasPermi="['mall:order:ship']"
                type="primary"
                size="small"
                icon="Van"
                text
                @click="handleDeliver(scope.row.id)"
                >订单发货</el-button
              >
              <el-button
                v-hasPermi="['mall:order:remove']"
                type="danger"
                size="small"
                icon="Delete"
                text
                @click="handleDelete(scope.row)"
                >删除订单</el-button
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

    <!-- 订单详情 -->
    <form-drawer ref="formDrawerRef" :title="title" size="60%" :show-actions="false">
      <div class="detail-container">
        <div class="order-step">
          <el-steps :active="formatStepStatus(form.status)" finish-status="success" align-center>
            <el-step title="提交订单" :description="parseTime(form.created_at)"></el-step>
            <el-step title="支付订单" :description="parseTime(form.payment_time)"></el-step>
            <el-step title="平台发货" :description="parseTime(form.delivery_time)"></el-step>
            <el-step title="确认收货" :description="parseTime(form.receive_time)"></el-step>
            <el-step title="完成评价" :description="parseTime(form.comment_time)"></el-step>
          </el-steps>
        </div>
        <el-card id="print-container" shadow="never" style="margin-top: 15px" class="order-container">
          <div class="title">
            <div class="left">
              <el-icon><Warning /></el-icon>
              <span class="color-danger">当前订单状态：{{ formatStatus(form.status) }}</span>
            </div>
            <div class="right">
              <el-button v-print="printObj" type="primary" size="small" :loading="printLoading">打印订单</el-button>
            </div>
          </div>
          <div class="info-box">
            <el-descriptions title="基本信息" direction="vertical" :column="3" border>
              <el-descriptions-item align="center" label="订单编号">{{ form?.order_number || '暂无' }}</el-descriptions-item>
              <el-descriptions-item align="center" label="用户账号">{{
                form?.userInfo?.username || '暂无'
              }}</el-descriptions-item>
              <el-descriptions-item align="center" label="支付方式" min-width="140px">{{
                form?.pay_type === 1 ? '支付宝' : '微信'
              }}</el-descriptions-item>
              <el-descriptions-item align="center" label="快递公司">{{ form?.delivery_company || '暂无' }}</el-descriptions-item>
              <el-descriptions-item align="center" label="物流单号">{{ form?.delivery_sn || '暂无' }}</el-descriptions-item>
              <el-descriptions-item align="center" label="自动确认收货时间" min-width="140px">{{
                form?.auto_confirm_day || '15天'
              }}</el-descriptions-item>
            </el-descriptions>
          </div>
          <div class="info-box">
            <el-descriptions title="收货地址信息" direction="vertical" :column="3" border>
              <el-descriptions-item align="center" label="收货人">{{ form?.addressInfo?.name || '暂无' }}</el-descriptions-item>
              <el-descriptions-item align="center" label="联系电话">{{ form?.addressInfo?.tel || '暂无' }}</el-descriptions-item>
              <el-descriptions-item align="center" label="城市">{{ form?.addressInfo?.city || '暂无' }}</el-descriptions-item>
              <el-descriptions-item label="详细地址">{{ addressFormat(form?.addressInfo) }} </el-descriptions-item>
            </el-descriptions>
          </div>
          <div class="info-box">
            <div class="goods-card">
              <div class="goods-card-title">商品信息</div>
              <div class="goods-card-item">
                <el-table :data="formatGoods(form.goods_info)" border style="width: 100%">
                  <el-table-column prop="small_image" align="center" label="图片">
                    <template #default="scope">
                      <el-image
                        style="width: 70px; height: 70px"
                        :src="scope.row.small_image"
                        :preview-src-list="[scope.row.small_image]"
                        :initial-index="4"
                        fit="cover"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column prop="name" label="商品名称" align="center" />
                  <el-table-column prop="num" align="center" label="数量" />
                  <el-table-column prop="price" align="center" label="价格" />
                </el-table>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </form-drawer>

    <!-- 订单发货 -->
    <el-dialog v-model="dialogFormVisible" title="订单发货">
      <el-form ref="deliveryFromRef" :model="submitData" :rules="rules">
        <el-form-item label="快递公司" label-width="80px" prop="delivery_company">
          <el-select v-model="submitData.delivery_company" clearable class="m-2" placeholder="请选择">
            <el-option v-for="item in deliveryCompanyData" :key="item.id" :label="item.name" :value="item.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="快递单号" label-width="80px" prop="delivery_sn">
          <el-input v-model="submitData.delivery_sn" clearable onkeyup="this.value = this.value.replace(/[^\d.]/g,'');" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="User">
import FormDrawer from '@/components/FormDrawer'
import { list, detail, deliverGoods, remove } from '@/api/mall/order'

const { proxy } = getCurrentInstance()
const { mall_order_status } = proxy.useDict('sys_normal_disable', 'mall_order_status')

const orderList = ref([])
// const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref('')
const dateRange = ref([])
const printLoading = ref(false)

// 列显隐信息
const columns = ref([
  { key: 0, label: `用户编号`, visible: true },
  { key: 1, label: `订单编号`, visible: true },
  { key: 2, label: `用户订单总价`, visible: true },
  { key: 3, label: `部门`, visible: true },
  { key: 4, label: `下单账号`, visible: true },
  { key: 5, label: `状态`, visible: true },
  { key: 6, label: `创建时间`, visible: true }
])

const deliveryCompanyData = ref([
  { id: 1, name: '百世快递' },
  { id: 2, name: '申通快递' },
  { id: 3, name: '顺丰快递' },
  { id: 4, name: '天天快递' },
  { id: 5, name: '韵达快递' },
  { id: 6, name: '邮政快递' },
  { id: 7, name: '圆通快递' },
  { id: 8, name: '中通快递' },
  { id: 9, name: '宅急送' }
])

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    order_number: undefined,
    user_id: undefined,
    status: undefined
  },
  rules: {
    delivery_company: [{ required: true, message: '请选择一个快递公司', trigger: 'blur' }],
    delivery_sn: [{ required: true, min: 4, max: 20, message: '快递单号度必须介于 4 和 20 之间', trigger: 'blur' }]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询用户列表 */
function getList() {
  loading.value = true
  list(proxy.addDateRange(queryParams.value, dateRange.value)).then((res) => {
    loading.value = false
    orderList.value = res.data.list
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
    .confirm('是否确认删除订单: ' + id + '')
    .then(function () {
      return remove(id)
    })
    .then((res) => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
    .catch(() => {})
}
/** 导出按钮操作 */
function handleExport() {
  proxy.download(
    'mall/order/export',
    {
      ...queryParams.value
    },
    `order_${new Date().getTime()}.xlsx`
  )
}

const submitData = reactive({
  id: undefined,
  delivery_company: undefined,
  delivery_sn: undefined
})
const dialogFormVisible = ref(false)
/** 打开发货dialog */
function handleDeliver(id) {
  submitData.delivery_company = undefined
  submitData.delivery_sn = undefined
  submitData.id = undefined
  dialogFormVisible.value = true
  submitData.id = id
}

/** 选择条数  */
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

// 禁止选中某一项
const selectable = (row, index) => row.id !== 1

/** 重置操作表单 */
function reset() {
  form.value = {
    delivery_company: undefined,
    delivery_sn: undefined
  }
  proxy.resetForm('deliveryFromRef')
}

const formDrawerRef = ref(null)
/** 修改按钮操作 */
function orderDetail(row) {
  reset()
  const id = row.id || ids.value
  detail(id).then(async (response) => {
    form.value = response.data
    formDrawerRef.value.open()
    title.value = '订单详情'
    form.password = ''
  })
}

function formatStepStatus(value) {
  if (value === 0) {
    //待发货
    return 1
  } else if (value === 1) {
    //已发货
    return 2
  } else if (value === 2) {
    //已完成
    return 3
  } else if (value === 3) {
    //已完成
    return 4
  } else {
    //待付款、已关闭、无限订单
    return 5
  }
}

function formatStatus(value) {
  if (value === 0) {
    return '待支付'
  } else if (value === 1) {
    return '待发货'
  } else if (value === 2) {
    return '已发货'
  } else if (value === 3) {
    return '已完成'
  } else if (value === 4) {
    return '已关闭'
  } else {
    return '待支付'
  }
}

function addressFormat(addr) {
  return addr ? `${addr?.province} ${addr?.city} ${addr?.county} ${addr?.addressDetail}` : '暂无'
}

function formatGoods(goodsInfo) {
  return goodsInfo && JSON.parse(goodsInfo)
}

// 创建打印对象
const printObj = {
  // 打印区域
  id: 'print-container',
  // 打印标题
  popTitle: '订单信息',
  // 打印前
  beforeOpenCallback(vue) {
    printLoading.value = true
  },
  // 执行打印
  openCallback(vue) {
    printLoading.value = false
  }
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs['deliveryFromRef'].validate((valid) => {
    if (valid) {
      deliverGoods(submitData).then((res) => {
        proxy.$modal.msgSuccess('发货成功')
        dialogFormVisible.value = false
        getList()
      })
    }
  })
}

getList()
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

// 订单详情
.detail-container {
  margin: 20px auto;
  .order-container {
    .title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f2f6fc;
      height: 60px;
      margin: -20px -20px 0;
      padding: 0 20px;
      .left {
        color: #f56c6c;
        i {
          vertical-align: text-top;
          margin-right: 5px;
        }
      }
    }
    .info-box {
      margin-top: 20px;
    }
  }
}

.goods-card {
  .goods-card-title {
    color: var(--el-text-color-primary);
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 16px;
  }
}

.el-table {
  th.el-table__cell,
  td.el-table__cell {
    position: static !important;
  }
}
</style>
