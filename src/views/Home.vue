<template>
  <div class="home-container dark-theme">
    <div class="welcome-section">
      <h1 class="welcome-title">欢迎使用精神小伙管理器</h1>
      <p class="welcome-subtitle">专为教育机构打造的一站式管理平台</p>
    </div>

    <el-card class="intro-card dark-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon><Document /></el-icon>
          <span>精神小伙管理器简介</span>
        </div>
      </template>
      <div class="card-content">
        <h3>系统简介</h3>
        <p>精神小伙管理器是一个专为教育机构设计的综合管理平台。</p>
        <p>本系统提供班级管理、学员管理、部门管理、员工管理等功能，便于教育机构的日常运营和管理。</p>
      </div>
    </el-card>

    <el-row :gutter="20" class="quick-access-section">
      <el-col :span="6">
        <el-card class="management-card dark-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><School /></el-icon>
              <span>班级管理</span>
            </div>
          </template>
          <div class="card-content">
            <p>高效管理班级信息，包括班级创建、编辑和删除等操作。</p>
            <el-button type="primary" class="btn-primary" @click="goToPage('/class/management')">进入管理</el-button>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="management-card dark-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><User /></el-icon>
              <span>学员管理</span>
            </div>
          </template>
          <div class="card-content">
            <p>便捷处理学员信息，支持学员的添加、编辑和删除等操作。</p>
            <el-button type="primary" class="btn-primary" @click="goToPage('/class/students')">进入管理</el-button>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="management-card dark-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><OfficeBuilding /></el-icon>
              <span>部门管理</span>
            </div>
          </template>
          <div class="card-content">
            <p>灵活配置部门结构，支持部门的创建、编辑和删除等操作。</p>
            <el-button type="primary" class="btn-primary" @click="goToPage('/system/department')">进入管理</el-button>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="management-card dark-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><UserFilled /></el-icon>
              <span>员工管理</span>
            </div>
          </template>
          <div class="card-content">
            <p>全面管理员工信息，支持员工的添加、编辑和删除等操作。</p>
            <el-button type="primary" class="btn-primary" @click="goToPage('/system/employee')">进入管理</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <div class="system-stats">
       <el-card class="stats-card dark-card" shadow="hover">
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="stat-item">
              <h2 class="stat-number">{{ stats.classCount }}</h2>
              <p class="stat-label">班级数量</p>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <h2 class="stat-number">{{ stats.studentCount }}</h2>
              <p class="stat-label">学员数量</p>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <h2 class="stat-number">{{ stats.deptCount }}</h2>
              <p class="stat-label">部门数量</p>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <h2 class="stat-number">{{ stats.empCount }}</h2>
              <p class="stat-label">员工数量</p>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Document, School, User, OfficeBuilding, UserFilled } from '@element-plus/icons-vue'
import request from '@/utils/request'

const router = useRouter()

const statsApi = {
  getClassCount: () => request.get('/classes', { params: { page: 1, pageSize: 1 } }),
  getStudentCount: () => request.get('/students', { params: { page: 1, pageSize: 1 } }),
  getDeptCount: () => request.get('/depts', { params: { page: 1, pageSize: 1 } }),
  getEmpCount: () => request.get('/emps', { params: { page: 1, pageSize: 1 } })
}

const stats = reactive({
  classCount: 0,
  studentCount: 0,
  deptCount: 0,
  empCount: 0
})

const loadStats = async () => {
  try {
    const [classRes, studentRes, deptRes, empRes] = await Promise.all([
      statsApi.getClassCount(),
      statsApi.getStudentCount(),
      statsApi.getDeptCount(),
      statsApi.getEmpCount()
    ]);

    if (classRes.code === 0) {
      stats.classCount = classRes.data?.total || 0;
    }
    if (studentRes.code === 0) {
      stats.studentCount = studentRes.data?.total || 0;
    }
    if (deptRes.code === 0) {
      stats.deptCount = deptRes.data?.total || 0;
    }
    if (empRes.code === 0) {
      stats.empCount = empRes.data?.total || 0;
    }

  } catch (error) {
    console.error("获取首页统计数据时出错:", error);
  }
};

const goToPage = (path) => {
  router.push(path)
}

onMounted(() => {
  loadStats();
});
</script>

<style scoped>
/* Use CSS Variables defined in main.css */
.home-container {
  /* padding is handled by app-content, remove if redundant */
  /* padding: 30px; */
}

.welcome-section {
  text-align: center;
  margin-bottom: 40px;
  padding: 40px 30px; /* Increase padding */
  background-color: var(--dark-bg-card); /* Use card background */
  border-radius: 8px;
  border: 1px solid var(--dark-border-primary);
}

.welcome-section h1.welcome-title {
  font-size: 2.2em; /* Adjust size */
  margin-bottom: 15px; /* Restore original margin */
  color: var(--dark-text-primary);
  font-weight: 600;
}

.welcome-section p.welcome-subtitle {
  font-size: 1.1em;
  color: var(--dark-text-secondary);
}

/* Shared Card Styles */
.dark-card {
  background-color: var(--dark-bg-card);
  border: 1px solid var(--dark-border-primary);
  color: var(--dark-text-primary);
  margin-bottom: 25px; /* Consistent spacing */
  border-radius: 6px;
  overflow: hidden; /* Ensure header background doesn't bleed */
  display: flex; /* Use flex for better height control */
  flex-direction: column; /* Stack header, body, footer */
}

.dark-card :deep(.el-card__header) {
  background-color: var(--dark-bg-input); /* Slightly different header bg */
  border-bottom: 1px solid var(--dark-border-primary);
  padding: 15px 20px; /* Adjust header padding */
}

.dark-card :deep(.el-card__body) {
  padding: 20px; /* Standard body padding */
  flex-grow: 1; /* Allow body to grow */
}

.card-header {
  color: var(--dark-text-primary);
  font-weight: 600; /* Make header bold */
  font-size: 1.1em;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Intro Card Specifics */
.intro-card h3 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 1.1em;
  color: var(--dark-text-primary);
}
.intro-card p {
  color: var(--dark-text-secondary);
  line-height: 1.6;
  margin-bottom: 15px;
}

/* Management Card Specifics - Ensure consistent height and layout in row */
.quick-access-section {
  margin-bottom: 25px; /* Match card bottom margin */
}

.management-card {
  text-align: center;
  height: 100%; /* Crucial for equal height in el-col */
  display: flex; /* Use flex on the card itself */
  flex-direction: column;
}

.management-card :deep(.el-card__body) {
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex-grow: 1; /* Allow body to take remaining space */
}

.management-card .card-content { /* Target the div wrapper */
    display: flex;
    flex-direction: column;
    flex-grow: 1; /* Make content area grow */
    justify-content: space-between; /* Push button down */
}

.management-card p {
  color: var(--dark-text-secondary);
  line-height: 1.6;
  margin-bottom: 20px;
  min-height: 4.8em; /* Adjust based on typical content length (3 lines) */
  flex-grow: 1; /* Allow paragraph to take available space */
}

/* Stats Section */
.system-stats {
    margin-bottom: 0; /* Remove extra margin if it's the last element */
}
.stats-card {
   /* Inherits dark-card styles, no need to repeat */
}

.stat-item {
    text-align: center;
}

.stat-item .stat-number { /* Renamed class for clarity */
  font-size: 2.8em;
  margin: 0 0 5px 0;
  color: var(--accent-color);
  font-weight: 700;
}

.stat-item .stat-label { /* Renamed class for clarity */
  margin: 0;
  font-size: 1em;
  color: var(--dark-text-secondary);
}

/* Button styles */
.btn-primary {
  background-color: var(--accent-color);
  border-color: var(--accent-color);
  color: #ffffff;
  width: 100%;
  padding: 10px 0;
  font-size: 1em;
  margin-top: auto; /* Push button to bottom of flex container */
}
.btn-primary:hover {
  background-color: var(--accent-color-hover);
  border-color: var(--accent-color-hover);
}

/* Remove original styles that are now handled by shared or global styles */
/* ... */
</style> 