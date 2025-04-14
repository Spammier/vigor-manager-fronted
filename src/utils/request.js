import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

// 创建axios实例
const request = axios.create({
  baseURL: '/api',
  timeout: 10000 // 增加超时时间
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    // console.log('请求URL:', config.url)
    // console.log('请求方法:', config.method)
    // console.log('请求头:', config.headers)
    // console.log('Token值:', token)
    
    // 如果有token，添加到请求头
    if (token) {
      // 修改为标准的 Authorization Header，添加 Bearer 前缀
      config.headers['Authorization'] = `Bearer ${token}` 
      // 可以移除旧的 header (如果之前有添加的话)
      // delete config.headers['token']; 
    }
    
    // 打印请求数据
    // if (config.data) {
    //   console.log('请求数据:', typeof config.data === 'object' ? 
    //     JSON.stringify(config.data, null, 2) : config.data)
    // }
    
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const res = response.data
    
    // 根据新 API 文档，code 为 0 表示业务逻辑成功
    if (res.code === 0) {
      // 直接返回整个响应体 (包含 code, msg, data)
      // 调用方可以通过 response.data 获取数据
      return res 
    }
    
    // 如果 code 不为 0，表示业务逻辑失败
    ElMessage.error(res.msg || '操作失败，请稍后重试')
    // 返回一个 rejected Promise，以便调用方 .catch() 处理
    return Promise.reject(new Error(res.msg || '操作失败')) 

  },
  error => {
    console.error('响应错误:', error)
    if (error.response) {
      // 处理 HTTP 状态码错误
      if (error.response.status === 401) {
        // 登录已过期或未授权
        ElMessage.error('登录状态失效，请重新登录')
        // 清除本地存储
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        localStorage.removeItem('name')
        localStorage.removeItem('userId')
        // 跳转到登录页面，避免循环跳转
        if (router.currentRoute.value.path !== '/login') {
            router.push('/login')
        }
      } else {
        // 其他 HTTP 错误 (例如 404, 500 等)
        const errorMsg = error.response.data?.msg || `请求错误: ${error.response.status}`
        ElMessage.error(errorMsg)
      }
    } else if (error.request) {
      // 请求已发出，但没有收到响应 (例如网络问题)
      ElMessage.error('网络连接错误，请检查网络或联系管理员')
    } else {
      // 请求设置时出错
      ElMessage.error('请求发送失败: ' + error.message)
    }
    // 返回 rejected Promise，以便调用方可以捕获
    return Promise.reject(error) 
  }
)

export default request 