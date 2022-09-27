<template>
  <!-- 查询表单 -->
  <SearchForm
    v-show="isShowSearch"
    :search="search"
    :reset="reset"
    :search-param="searchParam"
    :columns="searchColumns"
  />
  <div class="card table">
    <!-- 表格头部 操作按钮 -->
    <div class="table-header">
      <div class="header-button-lf">
        <slot
          name="tableHeader"
          :selected-list-ids="selectedListIds"
          :select-list="selectedList"
          :is-selected="isSelected"
        ></slot>
      </div>
      <div v-if="toolButton" class="header-button-ri">
        <el-button :icon="Refresh" circle @click="getTableList"> </el-button>
        <el-button :icon="Operation" circle @click="openColSetting"> </el-button>
        <el-button v-if="searchColumns.length" :icon="Search" circle @click="isShowSearch = !isShowSearch"> </el-button>
      </div>
    </div>
    <!-- 表格主体 -->
    <el-table
      ref="tableRef"
      height="525"
      :data="tableData"
      :border="border"
      :row-key="getRowKeys"
      :stripe="stripe"
      :tree-props="{ children: childrenName }"
      @selection-change="selectionChange"
    >
      <template v-for="item in tableColumns" :key="item">
        <!-- selection || index -->
        <el-table-column
          v-if="item.type == 'selection' || item.type == 'index'"
          :type="item.type"
          :reserve-selection="item.type == 'selection'"
          :selectable="item.selectable"
          :label="item.label"
          :width="item.width"
          :min-width="item.minWidth"
          :fixed="item.fixed"
        >
        </el-table-column>
        <!-- expand（展开自定义详细信息，请使用作用域插槽） -->
        <el-table-column
          v-if="item.type == 'expand'"
          v-slot="scope"
          :type="item.type"
          :label="item.label"
          :width="item.width"
          :min-width="item.minWidth"
          :fixed="item.fixed"
        >
          <slot :name="item.type" :row="scope.row"></slot>
        </el-table-column>
        <!-- other -->
        <el-table-column
          v-if="!item.type && item.prop && item.isShow"
          :prop="item.prop"
          :label="item.label"
          :width="item.width"
          :min-width="item.minWidth"
          :sortable="item.sortable"
          :show-overflow-tooltip="item.prop !== 'operation'"
          :resizable="true"
          :fixed="item.fixed"
        >
          <!-- 自定义 header (使用组件渲染 jsx 语法) -->
          <template v-if="item.renderHeader" #header>
            <component :is="item.renderHeader" :row="item"> </component>
          </template>

          <!-- 自定义配置每一列 slot（使用作用域插槽） -->
          <template #default="scope">
            <slot :name="item.prop" :row="scope.row">
              <!-- tag 标签（自带格式化内容） -->
              <el-tag v-if="item.tag" :type="filterEnum(scope.row[item.prop], item.enum, item.searchProps, 'tag')">
                {{
                  item.enum?.length
                    ? filterEnum(scope.row[item.prop], item.enum, item.searchProps)
                    : formatValue(scope.row[item.prop])
                }}
              </el-tag>
              <!-- 文字（自带格式化内容） -->
              <span v-else>
                {{
                  item.enum?.length
                    ? filterEnum(scope.row[item.prop], item.enum, item.searchProps)
                    : formatValue(scope.row[item.prop])
                }}
              </span>
            </slot>
          </template>
        </el-table-column>
      </template>
      <template #empty>
        <div class="table-empty">
          <div>暂无数据</div>
        </div>
      </template>
    </el-table>
    <!-- 分页组件 -->
    <Pagination
      v-if="pagination"
      :pageable="pageable"
      :handle-size-change="handleSizeChange"
      :handle-current-change="handleCurrentChange"
    />
  </div>
  <!-- 列设置 -->
  <ColSetting v-if="toolButton" ref="colRef" :table-ref="tableRef" :col-setting="colSetting" />
</template>

<script setup>
import { useTable } from '@/hooks/useTable'
import { useSelection } from '@/hooks/useSelection'
import { Refresh, Operation, Search } from '@element-plus/icons-vue'
import SearchForm from '@/components/SearchForm/index.vue'
import Pagination from './components/Pagination.vue'
import ColSetting from './components/ColSetting.vue'

// 表格 DOM 元素
const tableRef = ref()

// 是否显示搜索模块
const isShowSearch = ref(true)

const props = defineProps({
  columns: Array,
  requestApi: Function,
  dataCallback: Function,
  pagination: {
    type: Boolean,
    default: true
  },
  initParam: {
    type: Object,
    default: () => {}
  },
  border: {
    type: Boolean,
    default: true
  },
  stripe: {
    type: Boolean,
    default: false
  },
  toolButton: {
    type: Boolean,
    default: true
  },
  childrenName: {
    type: String,
    default: 'children'
  }
})

// 表格多选 Hooks
const { selectionChange, getRowKeys, selectedList, selectedListIds, isSelected } = useSelection()

// 表格操作 Hooks
const {
  tableData,
  pageable,
  searchParam,
  searchInitParam,
  getTableList,
  search,
  reset,
  handleSizeChange,
  handleCurrentChange
} = useTable(props.requestApi, props.initParam, props.pagination, props.dataCallback)

// 监听页面 initParam 改化，重新获取表格数据
watch(
  () => props.initParam,
  () => {
    getTableList()
  },
  { deep: true }
)

// 表格列配置项处理（添加 isShow 属性，控制显示/隐藏）
const tableColumns = ref()
tableColumns.value = props.columns.map((item) => {
  return {
    ...item,
    isShow: item.isShow ?? true
  }
})

// 如果当前 enum 为后台数据 需要请求数据，则调用该请求接口，获取enum数据
tableColumns.value.forEach(async (item) => {
  if (item.enum && typeof item.enum === 'function') {
    const { data } = await item.enum()
    item.enum = data
  }
})

// 过滤需要搜索的配置项
const searchColumns = tableColumns.value.filter((item) => item.search)
// 设置搜索表单的默认值
searchColumns.forEach((column) => {
  if (column.searchInitParam == undefined && column.searchInitParam !== null) {
    searchInitParam.value[column.prop] = column.searchInitParam
  }
})

// * 列设置
const colRef = ref()
// 过滤掉不需要设置显隐的列
const colSetting = tableColumns.value.filter((item) => {
  return (
    item.type !== 'selection' &&
    item.type !== 'index' &&
    item.type !== 'expand' &&
    item.prop !== 'operation' &&
    item.isShow !== false
  )
})
const openColSetting = () => {
  colRef.value.openColSetting()
}

function isArray(val) {
  return val && Array.isArray(val)
}
/**
 * @description 处理无数据情况
 * @param {String} callValue 需要处理的值
 * @return string
 * */
function formatValue(callValue) {
  // 如果当前值为数组,使用 / 拼接（根据需求自定义）
  if (isArray(callValue)) return callValue.length ? callValue.join(' / ') : '--'
  return callValue ?? '--'
}

/**
 * @description 根据枚举列表查询当需要的数据（如果指定了 label 和 value 的 key值，会自动识别格式化）
 * @param {String} callValue 当前单元格值
 * @param {Array} enumData 枚举列表
 * @param {String} type 过滤类型（目前只有 tag）
 * @return string
 * */
function filterEnum(callValue, enumData, searchProps, type) {
  const value = searchProps?.value ?? 'value'
  const label = searchProps?.label ?? 'label'
  let filterData = {}
  if (Array.isArray(enumData)) filterData = enumData.find((item) => item[value] === callValue)
  if (type == 'tag') return filterData?.tagType ? filterData.tagType : ''
  return filterData ? filterData[label] : '--'
}

// 暴露给父组件的参数和方法
defineExpose({ searchParam, getTableList })
</script>
