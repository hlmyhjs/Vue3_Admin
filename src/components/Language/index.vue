<template>
  <div class="language">
    <el-dropdown trigger="click" @command="handleSetLanguage">
      <span class="lang-icon">
        <el-tooltip effect="dark" content="国际化" placement="bottom">
          <svg-icon id="guide-lang" class-name="search-icon" icon-class="language" />
        </el-tooltip>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item :disabled="language && language === 'zh'" command="zh">简体中文</el-dropdown-item>
          <el-dropdown-item :disabled="language === 'en'" command="en">English</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import useAppStore from '@/store/modules/app'

const appStore = useAppStore()
const i18n = useI18n()
const language = computed(() => appStore.language)

// 切换语言
const handleSetLanguage = (lang) => {
  i18n.locale.value = lang
  appStore.setLanguage(lang)
  document.documentElement.lang = lang
}

onMounted(() => {
  handleSetLanguage(language.value)
})
</script>

<style scoped lang="scss">
.lang-icon {
  font-size: 20px;
}
</style>
