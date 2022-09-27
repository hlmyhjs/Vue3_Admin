<template>
  <div class="upload-box">
    <el-upload
      :id="id"
      action="#"
      :class="['upload']"
      :multiple="false"
      :disabled="disabled"
      :show-file-list="false"
      :http-request="handleHttpUpload"
      :before-upload="beforeUpload"
      :on-success="uploadSuccess"
      :on-error="uploadError"
      :style="uploadStyle"
      :drag="drag"
      accept="image/jpeg,image/jpeg,image/png"
    >
      <img v-if="imageUrl" :src="imageUrl" class="upload-image" />
      <el-icon v-else class="upload-icon"><Plus /></el-icon>
      <div v-if="imageUrl" class="upload-handle" @click.stop>
        <div v-if="!disabled" class="handle-icon" @click="editImg">
          <el-icon><Edit /></el-icon>
          <span>编辑</span>
        </div>
        <div class="handle-icon" @click="imageView">
          <el-icon><ZoomIn /></el-icon>
          <span>查看</span>
        </div>
        <div v-if="!disabled" class="handle-icon" @click="deleteImg">
          <el-icon><Delete /></el-icon>
          <span>删除</span>
        </div>
      </div>
    </el-upload>
    <div class="el-upload__tip">
      <slot name="tip"></slot>
    </div>
    <el-image-viewer v-if="dialogVisible" :url-list="[imageUrl]" @close="imageView" />
  </div>
</template>

<script setup name="uploadImg">
import { ElNotification } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
// import { uploadAvatar } from '@/api/tablePro'

// 接受父组件参数
const props = defineProps({
  id: {
    type: String,
    default: 'upload'
  },
  imageUrl: {
    type: String,
    default: 'https://img.gejiba.com/images/77fd22e5aca8a7e659eb8bbc88cd0514.jpg'
  },
  drag: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  fileSize: {
    type: Number,
    default: 5
  },
  uploadStyle: {
    type: Object,
    default: () => ({ width: '175px', height: '175px' })
  }
})

/**
 * @description 图片上传
 * @param options 上传的文件
 * */
const emit = defineEmits()
const handleHttpUpload = async (options) => {
  const formData = new FormData()
  formData.append('file', options.file)
  try {
    // const { data } = await uploadAvatar(formData)
    // emit('update:imageUrl', data.fileUrl)
    emit('update:imageUrl', 'https://img.gejiba.com/images/77fd22e5aca8a7e659eb8bbc88cd0514.jpg')
    emit('check-validate')
  } catch (error) {
    options.onError(error)
  }
}

/**
 * @description 删除图片
 * */
const deleteImg = () => {
  emit('update:imageUrl', '')
}

/**
 * @description 编辑图片
 * */
const editImg = () => {
  const dom = document.querySelector(`#${props.id} .el-upload__input`)
  dom.dispatchEvent(new MouseEvent('click'))
}

/**
 * @description 文件上传之前判断
 * @param rawFile 上传的文件
 * */
const beforeUpload = (rawFile) => {
  const imgSize = rawFile.size / 1024 / 1024 < props.fileSize
  const imgType = ['image/jpg', 'image/jpeg', 'image/png']
  if (!imgType.includes(rawFile.type)) {
    ElNotification({
      title: '温馨提示',
      message: '上传图片必须是 JPG/JPEG/PNG 格式！',
      type: 'warning'
    })
  }
  if (!imgSize) {
    ElNotification({
      title: '温馨提示',
      message: `上传图片大小不能超过 ${props.fileSize}MB！`,
      type: 'warning'
    })
  }
  return imgType.includes(rawFile.type) && imgSize
}

// 图片上传成功提示
const uploadSuccess = () => {
  ElNotification({
    title: '温馨提示',
    message: '图片上传成功！',
    type: 'success'
  })
}

// 图片上传错误提示
const uploadError = () => {
  ElNotification({
    title: '温馨提示',
    message: '图片上传失败，请您重新上传！',
    type: 'error'
  })
}

// 查看图片
const dialogVisible = ref(false)
const imageView = () => {
  dialogVisible.value = !dialogVisible.value
}
</script>

<style scoped lang="scss">
/* 上传组件校验失败样式 */
.is-error {
  .upload,
  .upload:hover {
    border-color: var(--el-color-danger) !important;
  }
}
.upload-box {
  .upload {
    width: 100%;
    height: 100%;
    overflow: hidden;
    border: 1px dashed var(--el-border-color-darker);
    border-radius: 8px;
    transition: var(--el-transition-duration-fast);
    &:hover {
      border-color: var(--el-color-primary);
    }
    :deep(.el-upload) {
      position: relative;
      width: 100%;
      height: 100%;
      .el-upload-dragger {
        width: 100%;
        height: 100%;
        padding: 0;
        border: none;
      }
      .upload-image {
        width: 100%;
        height: 100%;
      }
      .upload-icon {
        width: 100%;
        height: 100%;
        font-size: 28px;
        color: #8c939d;
      }
      .upload-handle {
        position: absolute;
        top: 0;
        right: 0;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        cursor: pointer;
        background: rgb(0 0 0 / 70%);
        opacity: 0;
        transition: var(--el-transition-duration-fast);
        .handle-icon {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 0 6%;
          color: aliceblue;
          .el-icon {
            margin-bottom: 40%;
            font-size: 130%;
            line-height: 130%;
          }
          span {
            font-size: 85%;
            line-height: 85%;
          }
        }
      }
      &:hover {
        .upload-handle {
          opacity: 1;
        }
      }
    }
  }
  .el-upload__tip {
    line-height: 18px;
    text-align: center;
  }
}
</style>
