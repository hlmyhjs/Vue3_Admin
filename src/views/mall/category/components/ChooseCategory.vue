<!-- eslint-disable vue/attribute-hyphenation -->
<template>
  <el-dialog v-model="dialogVisible" top="5vh" title="分类选择" width="70%" destroy-on-close @close="closeDialog">
    <el-container class="bg-white rounded border dialog-container" style="height: 65vh">
      <el-header class="flex items-center px-3 dialog-header">
        <el-input v-model="searchForm.name" placeholder="分类名称" clearable style="width: 200px"></el-input>
        <el-button type="primary" class="ml-2" @click="getData">搜索</el-button>
      </el-header>
      <el-main class="relative p-0">
        <div class="c-scroll">
          <el-table
            id="goods-list-table"
            ref="multipleTableRef"
            :data="tableData"
            style="width: 100%"
            stripe
            lazy
            @selection-change="handleSelectionChange"
          >
            <el-table-column fixed="left" type="selection" width="55" />
            <el-table-column prop="name" align="center" min-width="100" label="分类名称" />
            <el-table-column label="图片" align="center" min-width="100">
              <template #default="{ row }">
                <el-image class="mr-3 rounded" style="width: 50px; height: 50px" :src="row.pic" fit="cover"></el-image>
              </template>
            </el-table-column>
            <el-table-column align="center" prop="level" label="级别" min-width="150"> </el-table-column>
            <el-table-column align="center" prop="sort" label="排序" min-width="150"> </el-table-column>
          </el-table>
        </div>
      </el-main>
      <el-footer class="flex justify-center items-center dialog-footer">
        <el-pagination
          :currentPage="currentPage"
          background
          layout="prev, pager, next"
          :page-size="limit"
          :total="total"
          @current-change="getData"
        ></el-pagination>
      </el-footer>
    </el-container>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="close">取消</el-button>
        <el-button type="primary" @click="submit">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup>
import { ref, nextTick } from 'vue'
import { useInitTable } from './useCommon'

import { pagingList } from '@/api/mall/category'

// 初始化表格数据
const {
  // 搜索
  searchForm,
  resetSearchForm,
  // 表格
  multipleTableRef,
  // 分页
  currentPage,
  limit,
  total,
  // 表格数据
  tableData,
  // 获取数据方法
  getData,
  // 多选相关
  // multipleSelection,
  multipleSelectionIds,
  handleSelectionChange
} = useInitTable({
  // 搜索表单
  searchForm: {
    name: ''
  },
  autoGetData: false,
  loading: '#goods-list-table',
  // 获取数据的方法
  // getList: pagingList,
  getList: pagingList,
  // 获取数据成功之后的回调
  success: (res) => {
    total.value = res.data.total
    tableData.value = res.data.list.map((o) => {
      o.statusLoading = false
      return o
    })
  }
})

const dialogVisible = ref(false)
const callbackFunction = ref(false)
const open = (callback = false) => {
  callbackFunction.value = callback
  dialogVisible.value = true
  nextTick(() => getData())
}
const close = () => {
  resetSearchForm()
  dialogVisible.value = false
  callbackFunction.value = false
}
const closeDialog = () => resetSearchForm()

const submit = () => {
  if (typeof callbackFunction.value == 'function') callbackFunction.value(multipleSelectionIds.value)
  close()
}

defineExpose({ open })
</script>
<style lang="scss" scoped>
.dialog-container {
  border-radius: 0.25rem;
  background-color: rgba(255, 255, 255, 1);
  box-sizing: border-box;
  border: 1px solid #e5e7eb;
  .dialog-header {
    display: flex;
    align-items: center;
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }
  .dialog-footer {
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
