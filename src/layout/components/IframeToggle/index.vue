<template>
  <transition-group name="fade-transform" mode="out-in">
    <inner-link
      v-for="(item, index) in tagsViewStore.iframeViews"
      v-show="route.path === item.path"
      :key="item.path"
      :iframe-id="'iframe' + index"
      :src="item.meta.link"
    ></inner-link>
  </transition-group>
</template>

<script setup>
import InnerLink from '../InnerLink/index'
import useTagsViewStore from '@/store/modules/tagsView'

const route = useRoute()
const tagsViewStore = useTagsViewStore()
</script>
