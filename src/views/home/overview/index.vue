<template>
  <div class="app-container home">
    <el-row :gutter="20">
      <el-col :xs="24" :lg="24">
        <el-card class="card">
          <template #header>
            <div class="card-title">
              <span>关于</span>
            </div>
          </template>
          <div class="body">
            <div style="text-align: left">
              <span style="font-size: 15px"
                >Vue3-Admin 是基于 Vue3、Pinia、VueRouter、Vite、 ElementPlus、Echart5 等后台系统解决方案。</span
              >
              <img
                style="width: 100%; margin-top: 20px"
                src="https://img.gejiba.com/images/fea1cad86d8f45eadb808e88b466f425.png"
                alt=""
              />
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="24">
        <el-card class="card">
          <template #header>
            <div class="card-title">
              <span>技术栈</span>
            </div>
          </template>
          <div class="body">
            <textlink :text-arrs="technologyStacks" />
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="24">
        <el-card class="card">
          <template #header>
            <div class="card-title">
              <span>生产环境依赖</span>
            </div>
          </template>
          <div class="body">
            <descriptions :column="2" :table-datas="dependencies" />
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="24">
        <el-card class="card">
          <template #header>
            <div class="card-title">
              <span>开发环境依赖</span>
            </div>
          </template>
          <div class="body">
            <descriptions :column="2" :table-datas="devDependencies" />
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="24">
        <el-card class="card">
          <template #header>
            <div class="card-title">
              <span>项目规范</span>
            </div>
          </template>
          <div class="body">
            <descriptions
              title="编写组件规范"
              :column="1"
              :table-datas="[
                {
                  name: '组件导包顺序',
                  description: '导vue技术栈的包 , 导第三方的工具函数 , 导本地的组件, 导本地的工具函数'
                },
                { name: '组件的名称', description: '统一大写开头，驼峰命名' },
                {
                  name: '组件属性顺序',
                  description: 'name, components, props, emits, setup ...'
                },
                {
                  name: 'template标签',
                  description: '小写加 - ( 例如：<case-panel/> )'
                },
                {
                  name: 'template标签属性顺序',
                  description: 'v-if , v-for , ref, class, style, ... ,事件'
                },
                {
                  name: '组件的props',
                  description: '小写开头，驼峰命名，写明类型默认值'
                },
                {
                  name: '组件的样式',
                  description: '作用域：scoped, lang = scss / less  ; 类名：统一小写, 多个单词使用-分割'
                }
              ]"
            />
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="24">
        <el-card class="card">
          <template #header>
            <div class="card-title">
              <span>Git提交规范</span>
            </div>
          </template>
          <div class="body">
            <descriptions
              :column="1"
              :table-datas="[
                { name: 'add 操作', description: 'git add ' },
                { name: 'commit 操作', description: 'yarn commit ' },
                { name: 'pull 操作', description: 'git pull ' },
                { name: 'push 操作', description: 'git push ' }
              ]"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="Index">
import descriptions from '@/components/Descriptions'
import textlink from './components/textlink.vue'
import { technologyStacks, dependencies, devDependencies } from './config'

// const version = ref('3.8.3')

// function goTarget(url) {
//   window.open(url, '__blank')
// }
</script>

<style scoped lang="scss">
.home {
  font-family: 'open sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 13px;
  color: #676a6c;
  overflow-x: hidden;

  .card {
    margin-bottom: 10px;
    .card-title {
      font-size: 16px;
    }
    .body {
      overflow: auto;
    }
  }
}
</style>
