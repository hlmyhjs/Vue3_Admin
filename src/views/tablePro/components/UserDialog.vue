<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div class="UserDialog">
    <el-dialog v-model="dialogFormVisible" :width="width" :title="title" @close="close">
      <el-form :label-width="labelWidth">
        <template v-for="(item, index) in formItem" :key="index">
          <el-form-item :label="item.label">
            <template v-if="item.type === 'input' || item.type === 'password'">
              <el-input
                v-model="formData[item.field]"
                :placeholder="item.placeholder"
                :disabled="item.disabled"
                :clearable="item.clearable"
              ></el-input>
            </template>
            <template v-else-if="item.type === 'select'">
              <el-select v-model="formData[item.field]" :placeholder="item.placeholder" :clearable="item.clearable">
                <el-option v-for="option in item.options" :key="option.id" :value="option.id" :label="option.name" />
              </el-select>
            </template>
          </el-form-item>
        </template>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="confirm">确定</el-button>
          <el-button @click="cancel">取消</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Object
  },
  dialogFormVisible: {
    type: Boolean,
    default: false
  },
  width: {
    type: [String, Number],
    default: '500'
  },
  title: {
    type: String,
    default: ''
  },
  form: Object
})

const { formItem, labelWidth } = toRef(props, 'form').value
const formData = ref({})
const emit = defineEmits(['dialogConfirm', 'dialogCancel', 'dialogClose', 'update:modelValue'])
const confirm = () => {
  emit('dialogConfirm')
}
const cancel = () => {
  emit('dialogCancel')
}
const close = () => {
  emit('dialogClose')
}

onMounted(() => {
  formData.value = { ...props.modelValue }
})
watch(
  formData,
  (newValue) => {
    emit('update:modelValue', newValue)
  },
  { deep: true }
)
</script>

<style lang="scss" scoped>
.el-button--text {
  margin-right: 15px;
}
.dialog-footer button:first-child {
  margin-right: 10px;
}
</style>
