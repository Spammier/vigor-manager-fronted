import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

// 创建axios实例
const instance = axios.create({
  baseURL: '/api',
  timeout: 5000
})

// 请求拦截器
instance.interceptors.request.use(
  config => {
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    
    // 如果有token，添加到请求头
    if (token) {
      config.headers['token'] = token
    }
    
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
instance.interceptors.response.use(
  response => {
    return response
  },
  error => {
    if (error.response) {
      if (error.response.status === 401) {
        // 如果响应状态码是401，清除token并跳转到登录页面
        ElMessage.error('登录已过期，请重新登录')
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        localStorage.removeItem('name')
        localStorage.removeItem('userId')
        router.push('/login')
      }
    }
    return Promise.reject(error)
  }
)

export default instance 