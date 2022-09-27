<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="markdown-container" style="width: 100%">
    <!-- 渲染区 -->
    <div id="markdown-box"></div>
  </div>
</template>

<script setup>
import Editor from '@toast-ui/editor'
import '@toast-ui/editor/dist/toastui-editor.css'
import '@toast-ui/editor/dist/i18n/zh-cn'
import useAppStore from '@/store/modules/app'

// Editor实例
let mkEditor
// 处理离开页面切换语言导致 dom 无法被获取
let el

const appStore = useAppStore()
const language = computed(() => appStore.language)

const props = defineProps({
  modelValue: {
    type: String
  }
})

const emit = defineEmits(['update:modelValue'])
const initEditor = () => {
  mkEditor = new Editor({
    el,
    height: '450px',
    previewStyle: 'vertical',
    language: language.value === 'zh' ? 'zh-CN' : 'en'
  })
  if (props.modelValue) {
    mkEditor.setHTML(props.modelValue)
  }
  mkEditor.on('change', () => {
    emit('update:modelValue', mkEditor.getHTML())
  })
}

// 初始化editor
onMounted(() => {
  el = document.querySelector('#markdown-box')
  initEditor()
})

// 编辑相关
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      mkEditor?.setHTML(val)
    }
  },
  {
    immediate: true
  }
)

const reset = () => mkEditor.reset()
defineExpose({
  initEditor,
  reset
})

const destroyEditor = () => {
  if (!mkEditor) return
  mkEditor.off('change')
  // mkEditor.remove()
}

onUnmounted(() => {
  destroyEditor()
})
</script>
