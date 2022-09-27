<template>
  <el-config-provider :locale="i18nLocale">
    <router-view />
  </el-config-provider>
</template>

<script setup>
import useSettingsStore from '@/store/modules/settings'
import { handleThemeStyle } from '@/utils/theme'
import useAppStore from '@/store/modules/app'
// 配置element中英文
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'

const appStore = useAppStore()
// element 语言配置
const i18nLocale = computed(() => {
  if (appStore.language && appStore.language == 'zh') return zhCn
  if (appStore.language == 'en') return en
  return ''
})

onMounted(() => {
  nextTick(() => {
    // 初始化主题样式
    handleThemeStyle(useSettingsStore().theme)
  })
})
</script>
