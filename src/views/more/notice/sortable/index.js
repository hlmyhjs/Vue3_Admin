import { ref } from 'vue'
import Sortable from 'sortablejs'
// import { sortNotice } from '@/api/system/notice'
import { ElMessage } from 'element-plus'

// 排序相关
export const tableRef = ref(null)

/**
 * 初始化排序
 */
export const initSortable = (tableData, cb) => {
  // 设置拖拽效果
  const el = tableRef.value.$el.querySelectorAll('.el-table__body-wrapper table tbody')[0]
  // 1. 要拖拽的元素
  // 2. 配置对象
  Sortable.create(el, {
    // 拖拽时类名
    ghostClass: 'sortable-ghost',
    // 拖拽结束的回调方法
    // 拖拽结束的回调方法
    async onEnd(event) {
      // const { newIndex, oldIndex } = event
      // 修改数据
      // await sortNotice({
      //   initSort: tableData.value[oldIndex].sort,
      //   finalSort: tableData.value[newIndex].sort
      // })

      ElMessage.success({
        message: '修改公告排序成功',
        type: 'success'
      })
      // 直接重新获取数据无法刷新 table！！
      // tableData.value = []
      // // 重新获取数据
      // cb && cb()
    }
  })
}
