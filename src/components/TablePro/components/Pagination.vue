<!-- eslint-disable vue/multi-word-component-names -->
<!-- eslint-disable vue/no-mutating-props -->
<template>
  <!-- 分页组件 -->
  <el-pagination
    v-model:currentPage="pageable.pageNum"
    v-model:page-size="pageable.pageSize"
    :page-sizes="[10, 20, 30, 50]"
    :small="small"
    :disabled="disabled"
    :background="background"
    layout="total, sizes, prev, pager, next, jumper"
    :total="pageable.total"
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
  />
</template>

<script setup name="pagination">
defineProps({
  pageable: Object,
  handleSizeChange: Function,
  handleCurrentChange: Function
})

const small = ref(false)
const background = ref(true)
const disabled = ref(false)
</script>
