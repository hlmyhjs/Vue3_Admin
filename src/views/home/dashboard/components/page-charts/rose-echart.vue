<template>
  <div class="rose-echart">
    <base-echart :options="options"></base-echart>
  </div>
</template>

<script setup>
// 玫瑰图
import BaseEchart from '@/components/echarts'

const props = defineProps({
  roseData: Array
})

const options = computed(() => {
  return {
    tooltip: {
      trigger: 'item',
      formatter: '{a}<br/>{b}\n{d}%'
    },
    legend: {
      top: 'top'
    },
    series: [
      {
        name: '商品数量',
        type: 'pie',
        radius: [20, 130],
        center: ['50%', '55%'],
        roseType: 'area',
        itemStyle: {
          borderRadius: 8
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        data: props.roseData
      }
    ]
  }
})
</script>

<style scoped lang="less"></style>
