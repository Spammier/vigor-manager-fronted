<template>
  <el-container class="layout-container">
    <!-- 顶部标题栏 -->
    <el-header height="60px" class="header">
      <div class="title">
        <span class="system-title">精神小伙管理器</span>
      </div>
      <div class="user-info">
        <el-link type="primary">退出登录【张三】</el-link>
      </div>
    </el-header>
    
    <el-container>
      <!-- 侧边栏 -->
      <el-aside width="200px">
        <el-menu
          :default-active="activeMenu"
          class="el-menu-vertical"
          router>
          <el-menu-item index="/">
            <el-icon><House /></el-icon>
            <span>首页</span>
          </el-menu-item>
          
          <el-sub-menu index="1">
            <template #title>
              <el-icon><User /></el-icon>
              <span>班级学员管理</span>
            </template>
            <el-menu-item index="/class">班级管理</el-menu-item>
            <el-menu-item index="/student">学员管理</el-menu-item>
          </el-sub-menu>
          
          <el-sub-menu index="2">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>系统信息管理</span>
            </template>
            <el-menu-item index="/department">部门管理</el-menu-item>
            <el-menu-item index="/employee">员工管理</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-aside>
      
      <!-- 主要内容区域 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref } from 'vue'
import { House, User, Setting } from '@element-plus/icons-vue'

const activeMenu = ref('/')
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #dcdfe6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.system-title {
  font-family: KaiTi, "楷体", serif;
  font-size: 30px;
  color: #303133;
}

.el-menu-vertical {
  height: 100%;
  border-right: none;
}

.el-aside {
  background-color: #fff;
  border-right: 1px solid #dcdfe6;
}

.el-main {
  background-color: #f5f7fa;
  padding: 20px;
}
</style> 