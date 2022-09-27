<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="article-detail-container">
    <h2 class="title">{{ detail.title }}</h2>
    <div class="header">
      <span class="author">创建者：{{ detail.author }}</span>
      <span class="time">创建时间：{{ $filters.relativeTime(detail.publicDate) }}</span>
      <el-button type="text" class="edit" @click="onEditClick">编辑</el-button>
    </div>
    <div class="content" v-html="detail.content"></div>
  </div>
</template>

<script setup>
import { getNotice } from '@/api/system/notice'

// 获取数据
const route = useRoute()
const articleId = route.params.id
const detail = ref({})
const getDetail = async () => {
  detail.value = await getNotice(articleId)
}
getDetail()
</script>

<style lang="scss" scoped>
.article-detail-container {
  .title {
    font-size: 22px;
    text-align: center;
    padding: 12px 0;
  }
  .header {
    padding: 26px 0;
    .author {
      font-size: 14px;
      color: #555666;
      margin-right: 20px;
    }
    .time {
      font-size: 14px;
      color: #999aaa;
      margin-right: 20px;
    }
    .edit {
      float: right;
    }
  }
  .content {
    font-size: 14px;
    padding: 20px 0;
    border-top: 1px solid #d4d4d4;
  }
}
</style>
