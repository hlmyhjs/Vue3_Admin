export default [
  {
    type: 'get',
    url: '/api/v1/sys/mock/goods/amount/list',
    response: () => {
      return {
        success: true,
        code: 200,
        data: [
          {
            amount: 'sale',
            title: '商品总销量',
            tips: '所有商品的总销量',
            subtitle: '商品总销量',
            number1: 509989,
            number2: 509989
          },
          {
            amount: 'favor',
            title: '商品总收藏',
            tips: '所有商品的总收藏',
            subtitle: '商品总收藏',
            number1: 87226,
            number2: 87226
          },
          {
            amount: 'inventory',
            title: '商品总库存',
            tips: '所有商品的总库存',
            subtitle: '商品总库存',
            number1: 853667,
            number2: 853667
          },
          {
            amount: 'saleroom',
            title: '商品总销售额',
            tips: '所有商品的总销售额',
            subtitle: '商品总销售额',
            number1: 43118530,
            number2: 43118530
          }
        ],
        msg: '获取数据成功'
      }
    }
  },
  {
    type: 'get',
    url: '/api/v1/sys/mock/goods/category/count',
    response: () => {
      return {
        success: true,
        code: 200,
        msg: '获取成功',
        data: [
          { id: 2, name: '上衣', goodsCount: 14 },
          { id: 3, name: '裤子', goodsCount: 19 },
          { id: 4, name: '鞋子', goodsCount: 19 },
          { id: 5, name: '厨具', goodsCount: 18 },
          { id: 6, name: '家具', goodsCount: 18 },
          { id: 7, name: '床上用品', goodsCount: 19 },
          { id: 8, name: '女装', goodsCount: 35 }
        ]
      }
    }
  },
  {
    type: 'get',
    url: '/api/v1/sys/mock/goods/category/sale',
    response: () => {
      return {
        success: true,
        code: 200,
        msg: '获取成功',
        data: [
          { id: 2, name: '上衣', goodsCount: 49749 },
          { id: 3, name: '裤子', goodsCount: 84754 },
          { id: 4, name: '鞋子', goodsCount: 58283 },
          { id: 5, name: '厨具', goodsCount: 57354 },
          { id: 6, name: '家具', goodsCount: 49002 },
          { id: 7, name: '床上用品', goodsCount: 98579 },
          { id: 8, name: '女装', goodsCount: 112268 }
        ]
      }
    }
  },
  {
    type: 'get',
    url: '/api/v1/sys/mock/goods/category/favor',
    response: () => {
      return {
        success: true,
        code: 200,
        msg: '获取成功',
        data: [
          { id: 2, name: '上衣', goodsFavor: 6091 },
          { id: 3, name: '裤子', goodsFavor: 4939 },
          { id: 4, name: '鞋子', goodsFavor: 19647 },
          { id: 5, name: '厨具', goodsFavor: 13906 },
          { id: 6, name: '家具', goodsFavor: 15425 },
          { id: 7, name: '床上用品', goodsFavor: 7307 },
          { id: 8, name: '女装', goodsFavor: 19911 }
        ]
      }
    }
  },
  {
    type: 'get',
    url: '/api/v1/sys/mock/goods/category/favor',
    response: () => {
      return {
        success: true,
        code: 200,
        msg: '获取成功',
        data: [
          { id: 2, name: '上衣', goodsFavor: 6091 },
          { id: 3, name: '裤子', goodsFavor: 4939 },
          { id: 4, name: '鞋子', goodsFavor: 19647 },
          { id: 5, name: '厨具', goodsFavor: 13906 },
          { id: 6, name: '家具', goodsFavor: 15425 },
          { id: 7, name: '床上用品', goodsFavor: 7307 },
          { id: 8, name: '女装', goodsFavor: 19911 }
        ]
      }
    }
  },
  {
    type: 'get',
    url: '/api/v1/sys/mock/goods/sale/top10',
    response: () => {
      return {
        success: true,
        code: 200,
        msg: '获取成功',
        data: [
          {
            id: 7,
            name: '秋装女2018新款早秋女装裙子韩版针织连衣裙+衬衫上衣时尚套装',
            saleCount: 32070
          },
          { id: 8, name: '套装女春秋2018新款时尚复古气质个性连帽卫衣两件套', saleCount: 28990 },
          {
            id: 11,
            name: '时尚套装两件套2018韩版网红社会宽松连帽卫衣+高腰显瘦开叉半身裙学院风休闲秋装女套装新款',
            saleCount: 23765
          },
          {
            id: 17,
            name: '网红同款实拍秋季女装2018新款女初恋复古中长款针织连衣裙半身裙时尚套装两件套',
            saleCount: 21355
          },
          { id: 18, name: '2018秋冬新款ins超火针织时尚两件套小香风套装女', saleCount: 20288 },
          {
            id: 22,
            name: 'chic港味秋装女套装新款2018韩版格子西装外套+显瘦高腰破洞小脚裤学院风时尚套装两件套',
            saleCount: 19993
          },
          {
            id: 27,
            name: '中长款长袖连衣裙秋装新款2018韩版休闲胖mm大码女装裙子女学生宽松松垮垮中长款卫衣裙外套',
            saleCount: 19045
          },
          { id: 28, name: '2018秋新款韩版时尚简约系带显瘦条纹系带西服套装女', saleCount: 17587 },
          {
            id: 31,
            name: '秋季新款套装两件套秋装2018新款韩版chic泡泡袖衬衫上衣+高腰显瘦牛仔裤学院风时尚套装',
            saleCount: 17225
          },
          {
            id: 32,
            name: '2018新款时尚百搭黑色宽松机车皮夹克+网纱半身裙套装两件套',
            saleCount: 16985
          }
        ]
      }
    }
  },
  {
    type: 'get',
    url: '/api/v1/sys/mock/goods/address/sale',
    response: () => {
      return {
        success: true,
        code: 200,
        msg: '获取成功',
        data: [
          { address: '上海', count: 62239 },
          { address: '南京', count: 55683 },
          { address: '郑州', count: 53716 },
          { address: '广州', count: 6364 },
          { address: '西安', count: 64976 },
          { address: '长沙', count: 4142 },
          { address: '昆明', count: 9524 },
          { address: '武汉', count: 28212 },
          { address: '重庆', count: 60777 },
          { address: '沈阳', count: 20900 },
          { address: '宁波', count: 66584 },
          { address: '苏州', count: 1136 },
          { address: '青岛', count: 9021 },
          { address: '成都', count: 23378 },
          { address: '北京', count: 6107 },
          { address: '天津', count: 5096 },
          { address: '深圳', count: 12480 },
          { address: '杭州', count: 19654 }
        ]
      }
    }
  }
]
