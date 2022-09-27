<template>
  <div class="guide">
    <svg-icon id="guide-start" icon-class="guide" color="#5a5e66" @click="onClick" />
  </div>
</template>

<script setup>
import Driver from 'driver.js'
import 'driver.js/dist/driver.min.css'
import { useI18n } from 'vue-i18n'
import steps from './steps'

const i18n = useI18n()

let driver = null
onMounted(() => {
  driver = new Driver({
    // 禁止点击蒙版关闭
    allowClose: false,
    closeBtnText: i18n.t('guide.close'),
    nextBtnText: i18n.t('guide.next'),
    prevBtnText: i18n.t('guide.prev')
  })
})

const onClick = () => {
  driver.defineSteps(steps(i18n))
  driver.start()
}
</script>

<style scoped>
#guide-start {
  width: 18px;
  height: 18px;
}
</style>
