<template>
  <div class="app-container">
    <header class="app-header dark-header">
      <h1 class="app-title">精神小伙管理器</h1>
      <div class="user-info">
        <span>{{ userName }}</span>
        <a href="javascript:;" @click="logout">退出登录</a>
      </div>
    </header>
    <div class="app-main">
      <aside class="app-sidebar dark-sidebar">
        <el-menu
          :default-active="activeMenu"
          class="el-menu-vertical"
          background-color="#2a2f34"
          text-color="#ced4da"
          active-text-color="#198754"
          router
          unique-opened
        >
          <el-menu-item index="/">
            <el-icon><HomeFilled /></el-icon>
            <span>首页</span>
          </el-menu-item>
          
          <el-sub-menu index="/class">
            <template #title>
              <el-icon><School /></el-icon>
              <span>班级学员管理</span>
            </template>
            <el-menu-item index="/class/management">班级管理</el-menu-item>
            <el-menu-item index="/class/students">学员管理</el-menu-item>
          </el-sub-menu>
          
          <el-sub-menu index="/system">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>系统信息管理</span>
            </template>
            <el-menu-item index="/system/department">部门管理</el-menu-item>
            <el-menu-item index="/system/employee">员工管理</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </aside>
      <main class="app-content dark-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { HomeFilled, School, Setting } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()

// 当前登录用户信息
const userName = ref('')

// 当前激活的菜单
const activeMenu = computed(() => route.path)

// 加载用户信息
const loadUserInfo = () => {
  const storedName = localStorage.getItem('name');
  const storedUsername = localStorage.getItem('username');

  // 优先使用 name，如果 name 不存在或为默认值 '用户'，则尝试使用 username
  if (storedName && storedName !== '用户') {
      userName.value = storedName;
  } else if (storedUsername) {
      userName.value = storedUsername; // 使用 username 作为备选
  } else {
      userName.value = '未知用户'; // 如果两者都没有，显示未知
  }
}

// 退出登录
const logout = () => {
  ElMessageBox.confirm('确定要退出登录吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 清除本地存储的token和用户信息
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('name')
    localStorage.removeItem('userId')
    
    ElMessage.success('退出登录成功')
    router.push('/login')
  }).catch(() => {
    // 取消操作
  })
}

// 组件挂载时加载用户信息
onMounted(() => {
  loadUserInfo()
})
</script>

<style scoped>
/* Use CSS variables for consistent theming */
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background-color: var(--dark-bg-primary); /* Ensure container has base dark bg */
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 25px; /* Slightly increase padding */
  height: 60px;
  background-color: var(--dark-bg-card); /* Use card background for header */
  color: var(--dark-text-primary);
  border-bottom: 1px solid var(--dark-border-primary);
  flex-shrink: 0; /* Prevent header from shrinking */
}

.app-title {
  font-family: "楷体", KaiTi, serif;
  font-size: 28px; /* Slightly reduce size */
  margin: 0;
  color: var(--dark-text-primary);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px; /* Use gap for spacing */
}

.user-info span {
  color: var(--dark-text-secondary);
  font-size: 14px;
}

.user-info a {
  color: var(--dark-text-secondary);
  text-decoration: none;
  transition: color 0.3s ease;
  font-size: 14px;
}

.user-info a:hover {
  color: var(--accent-color); /* Use accent color from variables */
  background-color: transparent; /* Remove global hover background */
}

.app-main {
  display: flex;
  flex: 1;
  overflow: hidden; /* Prevent layout shift from scrollbars */
}

.app-sidebar {
  width: 230px;
  background-color: var(--dark-bg-card); /* Match header background */
  border-right: 1px solid var(--dark-border-primary);
  overflow-y: auto;
  flex-shrink: 0; /* Prevent sidebar from shrinking */
  padding-top: 10px; /* Add some top padding */
}

/* Styling the Element Plus Menu for Dark Theme */
.el-menu-vertical {
  border-right: none !important; /* Override default border */
  background-color: transparent !important; /* Inherit sidebar background */
}

.dark-sidebar :deep(.el-menu-item),
.dark-sidebar :deep(.el-sub-menu__title) {
  color: var(--dark-text-secondary) !important;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.dark-sidebar :deep(.el-menu-item:hover),
.dark-sidebar :deep(.el-sub-menu__title:hover) {
  background-color: var(--dark-bg-hover) !important;
  color: var(--dark-text-primary) !important;
}

.dark-sidebar :deep(.el-menu-item.is-active) {
  color: var(--accent-color) !important; /* Use accent color for active item */
  background-color: rgba(25, 135, 84, 0.1) !important; /* Subtle active background */
}

/* Adjust icon color */
.dark-sidebar :deep(.el-icon) {
  color: var(--dark-text-secondary);
}
.dark-sidebar :deep(.el-menu-item.is-active .el-icon) {
  color: var(--accent-color);
}

.app-content {
  flex: 1;
  padding: 25px; /* Increase padding */
  overflow-y: auto;
  background-color: var(--dark-bg-secondary); /* Use secondary dark background */
  color: var(--dark-text-primary); /* Ensure default text color */
}

/* Remove old dark theme classes if they are now redundant */
/* .dark-header, .dark-sidebar, .dark-content { ... } */
</style> 