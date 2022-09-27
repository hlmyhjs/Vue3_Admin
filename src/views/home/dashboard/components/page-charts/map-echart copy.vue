<template>
  <div class="bar-echart">
    <BaseEchart :options="options"></BaseEchart>
  </div>
</template>

<script setup>
// import * as echarts from 'echarts'
import BaseEchart from '@/components/echarts/index.vue'

// const props = defineProp({
//   mapData: Array,
// });

const airData = [
  { name: '北京', value: 39.92 },
  { name: '天津', value: 39.13 },
  { name: '上海', value: 31.22 },
  { name: '重庆', value: 66 },
  { name: '河北', value: 147 },
  { name: '河南', value: 113 },
  { name: '云南', value: 25.04 },
  { name: '辽宁', value: 50 },
  { name: '黑龙江', value: 114 },
  { name: '湖南', value: 175 },
  { name: '安徽', value: 117 },
  { name: '山东', value: 92 },
  { name: '新疆', value: 84 },
  { name: '江苏', value: 67 },
  { name: '浙江', value: 84 },
  { name: '江西', value: 96 },
  { name: '湖北', value: 273 },
  { name: '广西', value: 59 },
  { name: '甘肃', value: 99 },
  { name: '山西', value: 39 },
  { name: '内蒙古', value: 58 },
  { name: '陕西', value: 61 },
  { name: '吉林', value: 51 },
  { name: '福建', value: 29 },
  { name: '贵州', value: 71 },
  { name: '广东', value: 38 },
  { name: '青海', value: 57 },
  { name: '西藏', value: 24 },
  { name: '四川', value: 58 },
  { name: '宁夏', value: 52 },
  { name: '海南', value: 54 },
  { name: '台湾', value: 88 },
  { name: '香港', value: 66 },
  { name: '澳门', value: 77 },
  { name: '南海诸岛', value: 55 }
]

const options = computed(() => {
  return {
    backgroundColor: '#fff',
    tooltip: {
      trigger: 'item',
      formatter: function (params) {
        return params.name + ' : ' + params.value + '亿' // -.-
      }
    },
    visualMap: [
      {
        type: 'continuous',
        left: 0,
        bottom: 0,
        show: true,
        inRange: {
          // 区域图标样式
          symbol: 'rect',
          // 深色
          color: ['#71D2F8', '#36BFF4', '#0CACEB', '#0B9CD6', '#0A8CC1', '#097EAE']
        },
        text: ['高', '低']
      }
    ],
    series: [
      {
        name: '曝光量',
        type: 'map', // 告诉echarts渲染一个地图
        map: 'china',
        label: {
          // 显示地区汉字
          show: true,
          // 省份文字颜色 colorrr
          color: '#000',
          fontSize: 12
        },
        itemStyle: {
          areaColor: '#f9f9f9' // 地图区域样式   colorrr
        },
        roam: false, // 鼠标滚轮效果
        zoom: 1.2,
        // 地图放大缩小
        emphasis: {
          // 鼠标经过地图和字体样式
          label: {
            // 鼠标放上去文字高亮颜色 colorrr
            color: 'white',
            fontSize: 14
          },
          itemStyle: {
            // 鼠标上去高亮 colorrr
            areaColor: '#065C7F'
          }
        },
        data: airData
      }
    ]
  }
})

// function randomNumber(min, max) {
//   min = Math.ceil(min)
//   max = Math.floor(max)
//   return Math.floor(Math.random() * (max - min + 1) + min) //The maximum is inclusive and the minimum is inclusive
// }

// setInterval(() => {
//   let index = randomNumber(1, airData.length)
//   airData[index].value = randomNumber(1, 200)
// }, 2000)
</script>

<style scoped lang="less"></style>
