<template>
  <div class="bar-echart">
    <base-echart :options="options"></base-echart>
  </div>
</template>

<script setup>
import * as echarts from 'echarts'
import BaseEchart from '@/components/echarts'

const props = defineProps({
  xLabels: Array,
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
    xAxis: {
      type: 'category',
      data: props.xLabels,
      max: props.xLabels.length - 2
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '收藏量',
        data: props.values,
        type: 'bar',
        itemStyle: {
          borderRadius: [50, 50, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
            // 0% 状态时的颜色
            { offset: 0, color: '#1A2980' },
            // 100% 的颜色
            { offset: 1, color: '#26D0Ce' }
          ])
        },
        label: {
          show: true,
          position: 'top'
        }
        // showBackground: true,
        // backgroundStyle: {
        //   color: 'rgba(180, 180, 180, 0.2)'
        // }
      }
    ]
  }
})
</script>

<style scoped lang="scss"></style>
