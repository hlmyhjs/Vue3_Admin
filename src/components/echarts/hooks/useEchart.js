import * as echarts from 'echarts'

import ChinaMapData from '../data/china.json'
echarts.registerMap('china', ChinaMapData)

export default function (el) {
  // function debounce(fun, delay) {
  //   return function () {
  //     //每次事件被触发，都会清除当前的timeer，然后重写设置超时调用
  //     fun.timerId && clearTimeout(fun.timerId)
  //     fun.timerId = setTimeout(function () {
  //       // console.log("fun.timerId: ", fun.timerId);
  //       fun.call()
  //     }, delay)
  //   }
  // }

  function throttle(func, wait) {
    let previous = 0
    return function () {
      const now = Date.now()
      if (now - previous > wait) {
        func.apply()
        previous = now
      }
    }
  }

  const echartInstance = echarts.init(el)

  const setOptions = (options) => {
    echartInstance.setOption(options)
  }

  // 主动触发 resize
  const updateResize = () => {
    throttle(echartInstance.resize, 200)()
  }

  window.addEventListener('resize', () => {
    throttle(echartInstance.resize, 200)()
  })

  return {
    echartInstance,
    setOptions,
    updateResize
  }
}
