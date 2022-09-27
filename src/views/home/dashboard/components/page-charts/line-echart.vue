<template>
  <div class="line-echart">
    <base-echart :options="options"></base-echart>
  </div>
</template>

<script setup>
import * as echarts from 'echarts'
import BaseEchart from '@/components/echarts'

const props = defineProps({
  labels: Array,
  values: Array
})
const options = computed(() => {
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    legend: {},
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        data: props.labels
      }
    ],
    yAxis: [
      {
        type: 'value'
      }
    ],
    series: [
      {
        name: '分类销量统计',
        type: 'line',
        stack: '总量',
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
            // 0% 状态时的颜色
            { offset: 0, color: '#1A5980' },
            // 100% 的颜色
            { offset: 1, color: '#26D0CE' }
          ])
        },
        emphasis: {
          focus: 'series'
        },
        data: props.values
      }
    ]
  }
})
</script>

<style lang="scss" scoped></style>
