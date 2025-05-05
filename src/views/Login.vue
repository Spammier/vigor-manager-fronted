<template>
  <div class="login-container">
    <div class="page-title-container">
      <img src="@/assets/logo.png" alt="Logo" class="page-logo">
      <h1 class="page-title">精神小伙管理器</h1>
    </div>
    
    <div class="login-card">
      <div class="login-form-container">
        <h1 class="login-title">用户登录</h1>
        
        <el-form 
          ref="loginFormRef" 
          :model="loginForm" 
          :rules="loginRules" 
          class="login-form" 
          @submit.prevent="handleLogin"
        >
          <el-form-item prop="username">
            <label for="username" class="form-label">账号</label>
            <el-input 
              id="username"
              v-model="loginForm.username" 
              placeholder="请输入账号" 
              prefix-icon="User"
            />
          </el-form-item>
          
          <el-form-item prop="password">
            <label for="password" class="form-label">密码</label>
            <el-input 
              id="password"
              v-model="loginForm.password" 
              type="password" 
              placeholder="请输入密码" 
              prefix-icon="Lock" 
              show-password
            />
          </el-form-item>
          
          <div class="form-actions">
            <el-button 
              type="primary" 
              class="login-button" 
              :loading="loading" 
              native-type="submit"
            >
              {{ loading ? '登录中...' : '登录' }}
            </el-button>
            <div class="register-prompt">
               还没有账号？ <router-link to="/register">立即注册</router-link>
            </div>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import request from '@/utils/request'
import logoUrl from '@/assets/logo.png' // We don't actually need to use this variable if using src="@/assets/logo.png"

const router = useRouter()
const loginFormRef = ref(null)
const loading = ref(false)

// 登录表单数据
const loginForm = reactive({
  username: '',
  password: ''
})

// 登录表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入员工账号', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 5, max: 20, message: '长度在 5 到 20 个字符', trigger: 'blur' }
  ]
}

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true
        
        // 发送登录请求
        const response = await request.post('/login', {
          username: loginForm.username,
          password: loginForm.password
        })
        
        // 根据 API 文档，code 为 0 表示成功
        if (response.code === 0) { 
          // 登录成功
          // 注意：API 文档只明确列出 token。假设后端实际返回了 token, name, username, id
          const { token, name } = response.data 
          
          // 将token和用户信息存储到localStorage
          localStorage.setItem('token', token)
          // 假设 response.data 包含 username 和 id
          localStorage.setItem('username', response.data.username || loginForm.username) // 如果响应没 username，用输入的
          localStorage.setItem('name', name || '用户') // 如果响应没 name，用默认值
          localStorage.setItem('userId', response.data.id || '') // 如果响应没 id
          
          ElMessage.success(`欢迎回来，${name || '用户'}`) 
          
          // 跳转到首页
          router.push('/')
        } else {
          // 登录失败 - 使用后端返回的 msg
          ElMessage.error(response.msg || '登录失败，请检查用户名或密码') 
        }
      } catch (error) {
        console.error('登录错误详情：', error); // 仍然打印详细错误供调试

        // 不再使用 error.message (因为可能是误导性的 "success")
        // 显示一个通用的错误消息，因为拦截器应该已经显示了具体的后端 msg
        // 如果拦截器没显示，或者想覆盖，可以在这里取消注释 ElMessage
        // ElMessage.error('登录失败，请检查您的凭据或稍后重试'); 

        // 注意：此处不再调用 ElMessage.error(errorMsg)，
        // 因为错误消息已由 request.js 中的拦截器处理并显示。
        // 我们捕获错误主要是为了阻止后续代码执行并记录日志。
      } finally {
        loading.value = false
      }
    } else {
      // 表单验证失败
      console.log('表单验证失败')
      return false
    }
  })
}

// 重置表单
const resetForm = () => {
  if (loginFormRef.value) {
    loginFormRef.value.resetFields()
  }
}
</script>

<style scoped>
/* Use CSS Variables defined in main.css */
.page-title-container {
  position: absolute;
  top: 40px;
  left: 50px;
  display: flex;
  align-items: center;
  gap: 15px; /* Space between logo and title */
  z-index: 10;
}

.page-logo {
  height: 40px; /* Adjust size as needed */
  width: auto;
}

.page-title {
  /* Remove absolute positioning, handled by container */
  position: static;
  color: var(--dark-text-primary); /* Use variable */
  font-size: 28px;
  font-weight: 600;
  /* Remove z-index, handled by container */
  /* z-index: 10; */
  margin: 0; /* Remove default margin */
}

.login-container {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  /* Use variable from main.css */
  background: var(--dark-bg-primary);
  /* If you still want the gradient, define it with variables */
  /* background: linear-gradient(135deg, var(--dark-bg-secondary) 0%, var(--dark-bg-primary) 100%); */
}

.login-card {
  width: 100%;
  max-width: 400px;
  background-color: var(--dark-bg-card); /* Use variable */
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5); /* Enhanced shadow */
  padding: 45px 40px;
  overflow: hidden;
  border: 1px solid var(--dark-border-primary); /* Add border */
}

.login-form-container {
  width: 100%;
}

.login-title {
  text-align: center;
  margin-bottom: 40px;
  color: var(--dark-text-primary); /* Use variable */
  font-size: 1.5em; /* Adjust size */
  font-weight: 600;
}

.login-form {
  margin-top: 0;
}

/* Use label-position="top" or adjust label style */
.login-form :deep(.el-form-item__label) {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  font-size: 14px;
  color: var(--dark-text-secondary); /* Use variable */
  line-height: normal;
}

.login-form .el-form-item {
  margin-bottom: 25px;
}

/* Input styles using CSS variables */
.login-form :deep(.el-input__wrapper) {
  background-color: var(--dark-bg-input);
  box-shadow: none !important;
  border: 1px solid var(--dark-border-primary);
  border-radius: 5px;
  padding: 1px 15px;
  height: 45px;
  transition: border-color 0.2s ease-in-out, background-color 0.2s ease-in-out;
}
.login-form :deep(.el-input__wrapper.is-focus) {
  border-color: var(--accent-color);
  background-color: var(--dark-bg-hover); /* Use hover background */
}
.login-form :deep(.el-input__inner) {
  color: var(--dark-text-primary);
  height: 43px;
  line-height: 43px;
  font-size: 15px;
}
.login-form :deep(.el-input__inner::placeholder) {
  color: var(--dark-text-placeholder);
}
.login-form :deep(.el-input__icon) {
  color: var(--dark-text-secondary);
  font-size: 16px;
}
.login-form :deep(.el-input__suffix) {
  color: var(--dark-text-secondary);
}

.form-actions {
  margin-top: 30px; /* Reduced margin */
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Button styles using CSS variables */
.login-button {
  width: 100%;
  height: 45px;
  font-size: 16px;
  margin-bottom: 25px; /* Increased spacing */
  background-color: var(--accent-color);
  border-color: var(--accent-color);
  color: #ffffff;
  font-weight: 500;
}
.login-button:hover {
  background-color: var(--accent-color-hover);
  border-color: var(--accent-color-hover);
}

.register-prompt {
  text-align: center;
  font-size: 14px;
  color: var(--dark-text-secondary);
}

.register-prompt a {
  color: var(--accent-color);
  text-decoration: none;
  font-weight: 500;
  padding: 2px 0; /* Adjust padding */
  border-radius: 0;
}

.register-prompt a:hover {
  text-decoration: underline;
  background-color: transparent; /* Remove background on hover */
}
</style> 