import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import DepartmentManagement from '@/views/system/DepartmentManagement.vue'
import EmployeeManagement from '@/views/system/EmployeeManagement.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Home',
        component: Home,
      },
      {
        path: 'class/management',
        name: 'ClassManagement',
        component: () => import('@/views/class/ClassManagement.vue')
      },
      {
        path: 'class/students',
        name: 'StudentManagement',
        component: () => import('@/views/class/StudentManagement.vue')
      },
      {
        path: 'system/department',
        name: 'DepartmentManagement',
        component: DepartmentManagement,
      },
      {
        path: 'system/employee',
        name: 'EmployeeManagement',
        component: EmployeeManagement,
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 检查路由是否需要登录验证
  if (to.meta.requiresAuth !== false) {
    // 检查本地存储中是否有token
    const token = localStorage.getItem('token')
    if (!token) {
      // 如果没有token，重定向到登录页面
      next({ name: 'Login' })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router 