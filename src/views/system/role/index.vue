<template>
  <div class="app-container">
    <el-form v-show="showSearch" ref="queryRef" :model="queryParams" :inline="true">
      <el-form-item label="角色名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入角色名称"
          clearable
          style="width: 240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="权限字符" prop="roleKey">
        <el-input
          v-model="queryParams.roleKey"
          placeholder="请输入权限字符"
          clearable
          style="width: 240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="角色状态" clearable style="width: 240px">
          <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" style="width: 308px">
        <el-date-picker
          v-model="dateRange"
          value-format="YYYY-MM-DD"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button v-hasPermi="['system:role:add']" type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-hasPermi="['system:role:edit']" type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          >修改</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['system:role:remove']"
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          >删除</el-button
        >
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['system:role:export']">导出</el-button>
      </el-col> -->
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 表格数据 -->
    <el-table v-loading="loading" height="530" border :data="roleList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" :selectable="(row) => row.id !== 1" width="55" align="center" />
      <el-table-column label="角色编号" prop="id" width="120" />
      <el-table-column label="角色名称" prop="name" :show-overflow-tooltip="true" width="150" />
      <el-table-column label="权限字符" prop="roleKey" :show-overflow-tooltip="true" width="150" />
      <el-table-column label="显示顺序" prop="sort" width="100" />
      <el-table-column label="状态" align="center" width="100">
        <template #default="scope">
          <el-switch
            v-model="scope.row.status"
            v-hasPermi="['system:role:edit']"
            :active-value="true"
            :inactive-value="false"
            :disabled="scope.row.id === 1"
            @change="handleStatusChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime">
        <template #default="scope">
          <span>{{ parseTime(scope.row.created_at) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-tooltip v-if="scope.row.id !== 1" content="修改" placement="top">
            <el-button
              v-hasPermi="['system:role:edit']"
              type="primary"
              text
              icon="Edit"
              @click="handleUpdate(scope.row)"
            ></el-button>
          </el-tooltip>
          <el-tooltip v-if="scope.row.id !== 1" content="删除" placement="top">
            <el-button
              v-hasPermi="['system:role:remove']"
              type="primary"
              text
              icon="Delete"
              @click="handleDelete(scope.row)"
            ></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      :total="total"
      @pagination="getList"
    />

    <!-- 添加或修改角色配置对话框 -->
    <el-dialog v-model="open" :title="title" :width="diaLogWidth" append-to-body>
      <el-form ref="roleRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item prop="roleKey">
          <template #label>
            <span>
              <el-tooltip content="控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasRole('admin')`)" placement="top">
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
              权限字符
            </span>
          </template>
          <el-input v-model="form.roleKey" placeholder="请输入权限字符" />
        </el-form-item>
        <el-form-item v-if="form.id" label="角色顺序" prop="sort">
          <el-input-number v-model="form.sort" controls-position="right" :min="1" :max="50" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <!-- <el-form-item label="菜单权限"> -->
        <el-form-item v-if="form.id" label="菜单权限">
          <el-checkbox v-model="menuExpand" @change="handleCheckedTreeExpand($event, 'menu')">展开/折叠</el-checkbox>
          <el-checkbox v-model="menuNodeAll" @change="handleCheckedTreeNodeAll($event, 'menu')">全选/全不选</el-checkbox>
          <el-checkbox v-model="form.menuCheckStrictly" @change="handleCheckedTreeConnect($event, 'menu')">父子联动</el-checkbox>
          <el-tree
            ref="menuRef"
            class="tree-border"
            :data="menuOptions"
            show-checkbox
            node-key="id"
            :check-strictly="!form.menuCheckStrictly"
            empty-text="加载中，请稍候"
            :props="{ label: 'name', children: 'children' }"
          ></el-tree>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Role">
import { useWindowSize } from '@vueuse/core'
import { addRole, changeRoleStatus, delRole, getRole, listRole, updateRole } from '@/api/system/role'
import { roleMenuTreeselect, treeselect as menuTreeselect } from '@/api/system/menu'

const { proxy } = getCurrentInstance()
const { sys_normal_disable } = proxy.useDict('sys_normal_disable')

const roleList = ref([])
const open = ref(false)
const loading = ref(true)
const showSearch = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const total = ref(0)
const title = ref('')
const dateRange = ref([])
const menuOptions = ref([])
const menuExpand = ref(false)
const menuNodeAll = ref(false)
const deptExpand = ref(true)
const deptNodeAll = ref(false)
const deptOptions = ref([])
const menuRef = ref(null)
const deptRef = ref(null)

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: undefined,
    roleKey: undefined,
    status: undefined
  },
  rules: {
    name: [{ required: true, message: '角色名称不能为空', trigger: 'blur' }],
    roleKey: [{ required: true, message: '权限字符不能为空', trigger: 'blur' }],
    sort: [{ required: true, message: '角色顺序不能为空', trigger: 'blur' }]
  }
})

const { queryParams, form, rules } = toRefs(data)

/** 查询角色列表 */
function getList() {
  loading.value = true
  listRole(proxy.addDateRange(queryParams.value, dateRange.value)).then((response) => {
    roleList.value = response.data.list
    total.value = response.data.total
    loading.value = false
  })
}
/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}
/** 重置按钮操作 */
function resetQuery() {
  dateRange.value = []
  proxy.resetForm('queryRef')
  handleQuery()
}
/** 删除按钮操作 */
function handleDelete(row) {
  const idArr = row.id || ids.value
  proxy.$modal
    .confirm('是否确认删除角色编号为"' + idArr + '"的数据项?')
    .then(function () {
      return delRole(idArr)
    })
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
    .catch(() => {})
}
/** 导出按钮操作 */
// function handleExport() {
//   proxy.download(
//     'system/role/export',
//     {
//       ...queryParams.value
//     },
//     `role_${new Date().getTime()}.xlsx`
//   )
// }
/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map((item) => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}
/** 角色状态修改 */
function handleStatusChange(row) {
  const text = row.status === true ? '启用' : '停用'
  proxy.$modal
    .confirm('确认要"' + text + '""' + row.name + '"角色吗?')
    .then(function () {
      return changeRoleStatus(row.id, row.status)
    })
    .then(() => {
      proxy.$modal.msgSuccess(text + '成功')
    })
    .catch(function () {
      row.status = row.status !== true
    })
}

/** 查询菜单树结构 */
function getMenuTreeselect() {
  menuTreeselect().then((response) => {
    menuOptions.value = response.data
  })
}
/** 重置新增的表单以及其他数据  */
function reset() {
  if (menuRef.value != undefined) {
    menuRef.value.setCheckedKeys([])
  }
  menuExpand.value = false
  menuNodeAll.value = false
  deptExpand.value = true
  deptNodeAll.value = false
  form.value = {
    id: undefined,
    name: undefined,
    roleKey: undefined,
    sort: 0,
    status: '1',
    menuIds: [],
    menuCheckStrictly: true,
    deptCheckStrictly: true,
    remark: undefined
  }
  proxy.resetForm('roleRef')
}
/** 添加角色 */
function handleAdd() {
  reset()
  if (!menuOptions.value.length) getMenuTreeselect()
  open.value = true
  title.value = '添加角色'
}
const getMenuChecks = (menuList) => {
  const checks = []
  const _recurseGetChecked = (menuList) => {
    for (const menu of menuList) {
      if (menu.children) {
        _recurseGetChecked(menu.children)
      } else {
        checks.push(menu.id)
      }
    }
  }
  _recurseGetChecked(menuList)
  return checks
}
/** 修改角色 */
function handleUpdate(row) {
  reset()
  const id = row.id || ids.value
  const roleMenu = getRoleMenuTreeselect(id)
  getRole(id).then((response) => {
    getMenuTreeselect()
    form.value = response.data
    form.value.sort = Number(form.value.sort)
    form.value.status = Number(form.value.status) + ''
    form.value.menuCheckStrictly = true
    form.value.deptCheckStrictly = true
    open.value = true
    nextTick(() => {
      roleMenu.then((res) => {
        const menuChecks = getMenuChecks(res.data) // 要修改用户修改前具有的权限id数组
        menuRef.value.setCheckedKeys(menuChecks)
      })
    })
    title.value = '修改角色'
  })
}
/** 根据角色ID查询菜单树结构 */
function getRoleMenuTreeselect(roleId) {
  return roleMenuTreeselect(roleId).then((response) => {
    // menuOptions.value = response.menus
    menuOptions.value = response.data
    return response
  })
}
/** 树权限（展开/折叠）*/
function handleCheckedTreeExpand(value, type) {
  if (type == 'menu') {
    const treeList = menuOptions.value
    for (let i = 0; i < treeList.length; i++) {
      menuRef.value.store.nodesMap[treeList[i].id].expanded = value
    }
  } else if (type == 'dept') {
    const treeList = deptOptions.value
    for (let i = 0; i < treeList.length; i++) {
      deptRef.value.store.nodesMap[treeList[i].id].expanded = value
    }
  }
}

/** 树权限（全选/全不选） */
function handleCheckedTreeNodeAll(value, type) {
  if (type == 'menu') {
    menuRef.value.setCheckedNodes(value ? menuOptions.value : [])
  } else if (type == 'dept') {
    deptRef.value.setCheckedNodes(value ? deptOptions.value : [])
  }
}
/** 树权限（父子联动） */
function handleCheckedTreeConnect(value, type) {
  if (type == 'menu') {
    form.value.menuCheckStrictly = !!value
  } else if (type == 'dept') {
    form.value.deptCheckStrictly = !!value
  }
}
/** 所有菜单节点数据 */
function getMenuAllCheckedKeys() {
  // 目前被选中的菜单节点
  const checkedKeys = menuRef.value.getCheckedKeys()
  // 半选中的菜单节点
  const halfCheckedKeys = menuRef.value.getHalfCheckedKeys()
  checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys)
  return checkedKeys
}
/** 提交按钮 */
function submitForm() {
  proxy.$refs['roleRef'].validate((valid) => {
    if (valid) {
      if (form.value.id != undefined) {
        form.value.menuIds = getMenuAllCheckedKeys()
        updateRole(form.value).then((response) => {
          proxy.$modal.msgSuccess('修改成功')
          open.value = false
          getList()
        })
      } else {
        // form.value.menuIds = getMenuAllCheckedKeys() // 创建时就分配权限
        addRole(form.value).then((response) => {
          proxy.$modal.msgSuccess('新增成功')
          open.value = false
          getList()
        })
      }
    }
  })
}
/** 取消按钮 */
function cancel() {
  open.value = false
  reset()
}

const { width } = useWindowSize()
const WIDTH = 992
const diaLogWidth = ref('600px')
watch(width, (newWidth) => {
  diaLogWidth.value = newWidth - 1 < WIDTH ? '95%' : '600px'
})

getList()
</script>
