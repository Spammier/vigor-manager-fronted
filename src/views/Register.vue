<template>
  <div class="register-container">
    <h1 class="page-title">精神小伙管理器</h1>

    <div class="register-card">
      <div class="register-form-container">
        <h1 class="register-title">用户注册</h1>

        <el-form
          ref="registerFormRef"
          :model="registerForm"
          :rules="registerRules"
          class="register-form"
          @submit.prevent="handleRegister"
          label-position="top"
        >
          <el-form-item prop="username" label="账号">
            <el-input
              v-model="registerForm.username"
              placeholder="请输入账号 (例如：员工姓名拼音)"
              prefix-icon="User"
            />
          </el-form-item>

          <el-form-item prop="password" label="密码">
            <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="请输入密码 (至少5位)"
              prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <el-form-item prop="confirmPassword" label="确认密码">
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <el-form-item prop="name" label="姓名">
            <el-input
              v-model="registerForm.name"
              placeholder="请输入您的真实姓名"
              prefix-icon="Avatar"
            />
          </el-form-item>

          <div class="form-actions">
            <el-button
              type="primary"
              class="register-button"
              :loading="loading"
              native-type="submit"
            >
              {{ loading ? '注册中...' : '注册' }}
            </el-button>
            <div class="login-prompt">
              已有账号？ <router-link to="/login">立即登录</router-link>
            </div>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { User, Lock, Avatar } from '@element-plus/icons-vue';
import request from '@/utils/request'; // 假设你的请求工具路径

const router = useRouter();
const registerFormRef = ref(null);
const loading = ref(false);

// 注册表单数据
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  name: '', // 添加姓名或其他必要字段
});

// 自定义确认密码验证器
const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'));
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'));
  } else {
    callback();
  }
};

// 注册表单验证规则
const registerRules = reactive({
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' },
    // 可以添加更复杂的规则，例如检查用户名是否已存在（通常在后端处理）
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 5, max: 20, message: '长度在 5 到 20 个字符', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' },
  ],
  name: [
      { required: true, message: '请输入姓名', trigger: 'blur' }
  ]
});

// 处理注册
const handleRegister = async () => {
  if (!registerFormRef.value) return;

  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        // 准备发送到后端的数据，不包含确认密码
        const payload = {
          username: registerForm.username,
          password: registerForm.password,
          name: registerForm.name,
          // 添加其他需要的字段，如 email, phone 等
        };

        // 发送注册请求 - **你需要替换为你的实际注册 API 端点**
        const response = await request.post('/register', payload); // 示例 API 端点

        // 假设你的 API 在成功时返回 code 0 或类似标识
        if (response.code === 0) { // **根据你的 API 调整判断条件**
          ElMessage.success('注册成功！即将跳转到登录页面...');
          // 注册成功后跳转到登录页
          setTimeout(() => {
            router.push('/login');
          }, 1500); // 延迟跳转，给用户看提示的时间
        } else {
          // 注册失败 - 显示后端返回的错误信息
          ElMessage.error(response.msg || '注册失败，请稍后重试');
        }
      } catch (error) {
        console.error('注册请求失败:', error);
         // 此处可以根据后端返回的错误细化提示，例如用户名已存在
        // ElMessage.error('注册失败，请检查网络或联系管理员');
         // 错误消息应该由 request 拦截器处理，这里主要捕获并阻止流程
      } finally {
        loading.value = false;
      }
    } else {
      console.log('表单验证失败');
      return false;
    }
  });
};
</script>

<style scoped>
/* Use CSS Variables defined in main.css */
.page-title {
  position: absolute;
  top: 40px;
  left: 50px;
  color: var(--dark-text-primary);
  font-size: 28px;
  font-weight: 600;
  z-index: 10;
}

.register-container {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  /* Use variable from main.css */
  background: var(--dark-bg-primary);
  /* background: linear-gradient(135deg, var(--dark-bg-secondary) 0%, var(--dark-bg-primary) 100%); */
}

.register-card {
  width: 100%;
  max-width: 450px; /* Match Login width or adjust */
  background-color: var(--dark-bg-card);
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  padding: 45px 40px;
  overflow: hidden;
  border: 1px solid var(--dark-border-primary);
}

.register-form-container {
  width: 100%;
}

.register-title {
  text-align: center;
  margin-bottom: 30px;
  color: var(--dark-text-primary);
  font-size: 1.5em;
  font-weight: 600;
}

.register-form {
  margin-top: 0;
}

.register-form .el-form-item {
  margin-bottom: 20px;
}

/* Input styles using CSS variables */
.register-form :deep(.el-input__wrapper) {
  background-color: var(--dark-bg-input);
  box-shadow: none !important;
  border: 1px solid var(--dark-border-primary);
  border-radius: 5px;
  padding: 1px 15px;
  height: 45px;
  transition: border-color 0.2s ease-in-out, background-color 0.2s ease-in-out;
}
.register-form :deep(.el-input__wrapper.is-focus) {
  border-color: var(--accent-color);
  background-color: var(--dark-bg-hover);
}
.register-form :deep(.el-input__inner) {
  color: var(--dark-text-primary);
  height: 43px;
  line-height: 43px;
  font-size: 15px;
}
.register-form :deep(.el-input__inner::placeholder) {
  color: var(--dark-text-placeholder);
}
.register-form :deep(.el-input__icon) {
  color: var(--dark-text-secondary);
  font-size: 16px;
}
.register-form :deep(.el-input__suffix) {
   color: var(--dark-text-secondary);
}
.register-form :deep(.el-form-item__label) {
  color: var(--dark-text-secondary);
  line-height: normal;
  margin-bottom: 5px;
}


.form-actions {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Button styles using CSS variables */
.register-button {
  width: 100%;
  height: 45px;
  font-size: 16px;
  margin-bottom: 25px;
  background-color: var(--accent-color);
  border-color: var(--accent-color);
  color: #ffffff;
  font-weight: 500;
}
.register-button:hover {
  background-color: var(--accent-color-hover);
  border-color: var(--accent-color-hover);
}


.login-prompt {
  text-align: center;
  font-size: 14px;
  color: var(--dark-text-secondary);
}

.login-prompt a {
  color: var(--accent-color);
  text-decoration: none;
  font-weight: 500;
  padding: 2px 0;
}

.login-prompt a:hover {
  text-decoration: underline;
  background-color: transparent;
}
</style>