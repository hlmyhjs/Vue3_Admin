<template>
  <!-- 列显隐设置 -->
  <el-drawer v-model="drawerVisible" title="列设置" size="400px">
    <div class="table">
      <el-table height="575" :data="colSetting" :border="true">
        <el-table-column prop="label" label="列名" />
        <el-table-column v-slot="scope" prop="name" label="显示">
          <el-switch v-model="scope.row.isShow" @click="switchShow"></el-switch>
        </el-table-column>
        <template #empty>
          <div class="table-empty">
            <div>暂无数据</div>
          </div>
        </template>
      </el-table>
    </div>
  </el-drawer>
</template>

<script setup name="colSetting">
const props = defineProps({
  colSetting: {
    type: Array,
    default: () => []
  },
  tableRef: null
})

const drawerVisible = ref(false)
// 打开列设置
const openColSetting = () => {
  drawerVisible.value = true
}

// 列显隐时重新布局 table（防止表格抖动,隐藏显示之后会出现横向滚动条,element-plus 内部问题，已经提了 issues）
const switchShow = () => {
  nextTick(() => {
    props.tableRef.doLayout()
  })
}

defineExpose({
  openColSetting
})
</script>
