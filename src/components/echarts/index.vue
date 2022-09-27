<template>
  <div class="base-echart">
    <div ref="echartDivRef" :style="{ width, height }"></div>
  </div>
</template>

<script setup>
import useEchart from './hooks/useEchart'
import './data/china'

const props = defineProps({
  options: Object,
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: '360px'
  }
})

const echartDivRef = ref()
onMounted(() => {
  const { setOptions } = useEchart(echartDivRef.value)

  // 依赖收集 自动调用
  watchEffect(() => {
    setOptions(props.options)
  })
})
</script>

<style lang="scss" scoped></style>
