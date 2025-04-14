<template>
  <!-- 使用路由视图，完全由路由控制内容显示 -->
  <router-view />
</template>

<script setup>
// 保留必要的导入，但不需要用户信息和登录状态逻辑
import { useRoute } from 'vue-router'
import { HomeFilled, School, Setting } from '@element-plus/icons-vue'

const route = useRoute()
</script>

<style>
/* 保留必要的全局样式 */
</style>
