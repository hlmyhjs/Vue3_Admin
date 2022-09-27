import { ref, reactive, onMounted, computed } from 'vue'

import { showLoading, hideLoading, toast, showFullLoading, hideFullLoading } from './util.js'

// 初始化表格部分
export function useInitTable(opt = {}) {
  // 搜索相关
  let searchForm = null
  let resetSearchForm = null
  if (opt.searchForm) {
    searchForm = reactive({ ...opt.searchForm })
    resetSearchForm = () => {
      for (const key in opt.searchForm) {
        searchForm[key] = opt.searchForm[key]
      }
      getData()
    }
  }

  // 表格节点
  const multipleTableRef = ref(null)

  // 分页参数
  const currentPage = ref(1)
  const limit = ref(10)
  const total = ref(0)

  // 表格数据
  const tableData = ref([])

  // loading相关
  let loadingEl = '#list-table'
  if (opt.loading) {
    loadingEl = opt.loading
  }

  // 获取表格数据
  function getData(page = false) {
    if (typeof page == 'number') currentPage.value = page
    tableData.value = []

    // 开启loading
    showLoading(loadingEl)
    opt
      .getList(currentPage.value, searchForm)
      .then((res) => {
        if (opt.success && typeof opt.success == 'function') {
          opt.success(res)
        } else {
          total.value = res.data.total
          tableData.value = res.data.list
        }
      })
      .finally(() => hideLoading())
  }

  // 自动加载相关
  let autoGetData = true
  if (typeof opt.autoGetData == 'boolean') {
    autoGetData = opt.autoGetData
  }
  // 页面渲染后加载数据
  onMounted(() => {
    if (autoGetData) {
      getData()
    }
  })

  // 多选处理
  const multipleSelection = ref([])
  const multipleSelectionIds = computed(() => multipleSelection.value.map((o) => o.id))
  const handleSelectionChange = (val) => (multipleSelection.value = val)

  // 批量删除
  const handleDelete = (id) => {
    const ids = id === true ? multipleSelectionIds.value : [id]
    if (ids.length == 0) {
      return toast('请先选中要删除的信息', 'error')
    }
    showFullLoading()

    opt
      .deleteData(ids)
      .then((res) => {
        toast('删除成功')

        // 清空选中
        if (multipleTableRef.value) {
          multipleTableRef.value.clearSelection()
        }

        getData()
      })
      .finally(() => hideFullLoading())
  }

  // 修改状态
  const handleStatusChange = (status, row) => {
    row.statusLoading = true
    opt
      .updateStatus(row.id, status)
      .then((res) => {
        toast('修改状态成功')
        row.status = status
      })
      .finally(() => (row.statusLoading = false))
  }

  return {
    searchForm,
    resetSearchForm,

    multipleTableRef,
    currentPage,
    limit,
    total,
    tableData,
    getData,
    multipleSelection,
    multipleSelectionIds,
    handleSelectionChange,
    handleDelete,
    handleStatusChange
  }
}

// 初始化表单
export function useInitForm(opt = {}) {
  // 表单部分
  const editId = ref(0)
  const drawerTitle = computed(() => (editId.value ? '修改' : '新增'))
  const form = reactive({})
  const formRef = ref(null)
  const rules = reactive(opt.rules)

  // 表单
  const formDrawerRef = ref(null)

  // 提交表单
  function handleSubmit() {
    formRef.value.validate((valid) => {
      if (!valid) return false
      // 提交数据
      formDrawerRef.value.showLoading()

      // 提交之前
      if (opt.beforeSubmit && typeof opt.beforeSubmit == 'function') {
        opt.beforeSubmit(form)
      }

      const fun = editId.value ? opt.updateData(editId.value, form) : opt.createData(form)

      fun
        .then((res) => {
          toast(drawerTitle.value + '成功')
          opt.getData()
          formDrawerRef.value.close()
        })
        .finally(() => {
          formDrawerRef.value.hideLoading()
        })
    })
  }

  // 重置表单
  function resetForm(row = false) {
    // 清除之前表单的验证状态
    if (formRef.value) formRef.value.clearValidate()
    // const defaultForm = row ? row : opt.form
    const defaultForm = row || opt.form
    for (const key in defaultForm) {
      form[key] = defaultForm[key]
    }
  }
  // 新增
  const handleCreate = () => {
    resetForm()
    editId.value = 0
    formDrawerRef.value.open()
  }

  // 修改
  const handleEdit = (row) => {
    editId.value = row.id
    resetForm(row)
    formDrawerRef.value.open()
  }

  return {
    drawerTitle,
    form,
    formRef,
    rules,
    formDrawerRef,
    handleSubmit,
    handleCreate,
    handleEdit
  }
}
