import './assets/main.css'

import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import { Document, School, User, OfficeBuilding, UserFilled } from '@element-plus/icons-vue'
import axios from './utils/axios'

const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 注册组件
app.component('Document', Document)
app.component('School', School)
app.component('User', User)
app.component('OfficeBuilding', OfficeBuilding)
app.component('UserFilled', UserFilled)

// 全局挂载axios
app.config.globalProperties.$axios = axios

// 配置Element Plus使用中文
app.use(ElementPlus, {
  locale: zhCn
})

app.use(router)
app.mount('#app')
