import { createI18n } from 'vue-i18n'
import zh from './lang/zh'
import en from './lang/en'
import { getItem } from '@/utils/storage'

function getLanguage() {
  const initLanguage = getItem('lang')
  // console.log(initLanguage);
  if (initLanguage) {
    document.documentElement.lang = initLanguage
    return initLanguage
  }
  return 'zh'
}

const i18n = createI18n({
  fallbackLocale: 'zh',
  legacy: false, // 如果要支持 compositionAPI，此项必须设置为 false
  locale: getLanguage(), // 设置语言类型
  globalInjection: true, // 全局注册$t方法
  warnHtmlMessage: false,
  messages: {
    zh,
    en
  }
})

export default i18n
