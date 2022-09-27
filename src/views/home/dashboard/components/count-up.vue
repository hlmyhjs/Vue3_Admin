<template>
  <span ref="counterRef" />
</template>

<script setup>
// http://inorganik.github.io/countUp.js/
import { CountUp } from 'countup.js'
const defaultOptions = {
  decimalPlaces: 2, // 保留两位
  duration: 2, // 动画时长
  separator: ',', // 千位分割
  decimal: '.', // 小数分割
  prefix: '￥' // 单位
}

const props = defineProps({
  number: {
    type: Number,
    default: 0
  },
  option: {
    type: Object,
    default: () => {
      return {}
    }
  }
})

const counterRef = ref(null)
const instance = ref(null)

watch(
  () => props.number,
  () => {
    update(props.number)
  }
)
onMounted(() => {
  createCounter()
})

const createCounter = () => {
  if (!counterRef.value) return
  const opts = Object.assign(defaultOptions, props.option)
  instance.value = new CountUp(counterRef?.value, props.number, opts)
  start()
}

const start = () => {
  if (!instance.value) return
  instance?.value.start()
}
const update = (number) => {
  if (!instance.value) return
  instance?.value.update(number)
}
</script>

<style scoped lang="scss"></style>
