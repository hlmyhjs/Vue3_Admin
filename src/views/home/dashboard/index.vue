<template>
  <div class="app-container dashboard">
    <!-- 1.顶部数据统计 -->
    <el-row class="header-box" :gutter="10">
      <template v-for="item in cardItem" :key="item.title">
        <el-col :md="12" :lg="6" :xl="6">
          <div class="card-box" @mouseenter="changeColor(item.color)">
            <div class="left">
              <div class="title">{{ item.label }}</div>
              <div class="sub-title">
                <count-up :number="item.value" :option="item.option ? item.option : {}" />
              </div>
            </div>
            <div class="right">
              <i class="iconfont" :class="item.icon" :style="{ color: item.color }"></i>
            </div>
          </div>
        </el-col>
      </template>
    </el-row>

    <!-- 2.中间图表 -->
    <el-row :gutter="10">
      <el-col :md="12" :lg="7" :xl="7">
        <card title="分类商品数量(饼图)">
          <pie-echart :pie-data="categoryGoodsCount"></pie-echart>
        </card>
      </el-col>
      <el-col :md="12" :lg="10" :xl="10">
        <card title="不同城市商品销量">
          <map-echart :map-data="addressGoodsSale"></map-echart>
        </card>
      </el-col>
      <el-col :md="12" :lg="7" :xl="7">
        <card title="分类商品数量(玫瑰图)">
          <rose-echart :rose-data="categoryGoodsCount"></rose-echart>
        </card>
      </el-col>
    </el-row>

    <!-- 3.底部图表 -->
    <el-row :gutter="10" class="row">
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <card title="分类商品的销量">
          <line-echart v-bind="categoryGoodsSale"></line-echart>
        </card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <card title="分类商品的收藏">
          <bar-echart v-bind="categoryGoodsFavorData"></bar-echart>
        </card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { card, countUp, barEchart, lineEchart, mapEchart, pieEchart, roseEchart } from './components'
import request from '@/utils/request'

const topPanelData = ref([])
const getTopPanelData = async () => {
  const topPanel = await request({
    url: '/mock/goods/amount/list',
    headers: {
      isToken: false
    },
    method: 'get'
  })
  topPanelData.value = topPanel.data
}
getTopPanelData()

const categoryGoodsCount = ref([])
const getCategoryGoodsCount = async () => {
  const { data } = await request({
    url: '/mock/goods/category/count',
    headers: {
      isToken: false
    },
    method: 'get'
  })
  categoryGoodsCount.value = data.map((item) => {
    return { value: item.goodsCount, name: item.name }
  })
}
getCategoryGoodsCount()

const categoryGoodsSale = ref({})
const getCategoryGoodsSale = async () => {
  const categorySale = await request({
    url: '/mock/goods/category/sale',
    headers: {
      isToken: false
    },
    method: 'get'
  })
  const labels = []
  const values = []
  for (const item of categorySale.data) {
    labels.push(item.name)
    values.push(item.goodsCount)
  }
  categoryGoodsSale.value = { labels, values }
}
getCategoryGoodsSale()

// 分类商品的收藏数据
const categoryGoodsFavorData = reactive({
  xLabels: [],
  values: []
})
const getCategoryGoodsFavor = async () => {
  const { data: categoryGoodsFavor } = await request({
    url: '/mock/goods/category/favor',
    headers: {
      isToken: false
    },
    method: 'get'
  })
  const EditCategoryGoodsFavor = {
    labels: [],
    data: [],
    default: categoryGoodsFavor
  }
  categoryGoodsFavor.forEach((item) => {
    EditCategoryGoodsFavor.labels.push(item.name)
    EditCategoryGoodsFavor.data.push(item.goodsFavor)
  })

  categoryGoodsFavorData.xLabels = EditCategoryGoodsFavor.labels
  categoryGoodsFavorData.values = EditCategoryGoodsFavor.data
}
getCategoryGoodsFavor()

const addressGoodsSale = ref([])
const getAddressGoodsSale = async () => {
  const addressSale = await request({
    url: '/mock/goods/address/sale',
    headers: {
      isToken: false
    },
    method: 'get'
  })
  addressSale.data.map((item) => {
    addressGoodsSale.value.push({ name: item.address, value: item.count })
  })
}
getAddressGoodsSale()

// tips数据
const cardItem = computed(() => {
  const customStyle = [
    {
      icon: 'icon-xiaoliang',
      color: '#5dc9c6'
    },
    {
      icon: 'icon-shoucang',
      color: '#50a3f8'
    },
    {
      icon: 'icon-kucunguanli',
      color: '#e9536d'
    },
    {
      icon: 'icon-qiandai',
      color: '#52bea2'
    }
  ]
  const presetOption1 = {
    decimalPlaces: 0, // 保留两位
    prefix: '' // 单位
  }
  const presetOption2 = {
    decimalPlaces: 2, // 保留两位
    prefix: '￥' // 单位
  }
  return topPanelData.value.map((item, index) => {
    return {
      label: item.title,
      value: item.number1,
      icon: customStyle[index].icon,
      color: customStyle[index].color,
      option: item.amount === 'saleroom' ? presetOption2 : presetOption1
    }
  })
})

const current_color = ref('pink')
const changeColor = (color) => {
  current_color.value = color
}
</script>

<style scoped lang="scss">
.dashboard {
  background-color: #ffffff;
  .row {
    margin-top: 20px;
  }
  .header-box {
    margin-bottom: 20px;
    .card-box {
      display: flex;
      height: 100px;
      padding: 20px;
      cursor: pointer;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: var(--el-box-shadow-light);
      .left {
        flex: 0.7;
        text-align: left;
        .title {
          padding-bottom: 10px;
          color: #666666;
        }
        .sub-title {
          font-size: 26px;
        }
      }
      .right {
        display: flex;
        flex: 0.3;
        align-items: center;
        justify-content: center;
        background-color: transparent;
        border-radius: 10px;
        transition: all 0.1s;
        i {
          font-size: 36px;
          transition: all 0.1s;
        }
      }
      &:hover .right {
        background-color: v-bind(current_color);
      }
      &:hover .right i {
        font-size: 48px;
        color: white !important;
      }
    }
  }
}
</style>
