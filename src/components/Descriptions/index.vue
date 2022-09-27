<template>
  <div class="description">
    <el-descriptions class="margin-top" :title="title" :column="column" border>
      <template v-for="(itemData, index) in tableDatas" :key="index">
        <el-descriptions-item :label-align="labelAlign" :align="align">
          <template #label> {{ itemData.name }} </template>
          <el-tag size="small">{{ itemData.description }}</el-tag>
        </el-descriptions-item>
      </template>
    </el-descriptions>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: ''
  },
  column: {
    type: Number,
    default: 1
  },
  tableDatas: {
    type: Array,
    default: () => []
  },
  labelAlign: {
    type: String,
    default: 'center'
  },
  align: {
    type: String,
    default: 'center'
  }
})
</script>

<style scoped>
.description {
  margin-bottom: 20px;
}
</style>
