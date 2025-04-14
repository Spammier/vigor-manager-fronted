<template>
  <div class="employee-management-container dark-theme">
    <div class="header-section">
      <h2>员工管理</h2>
      <div class="header-right">
        <el-button type="primary" class="btn-primary" @click="handleAdd">+ 新增员工</el-button>
      </div>
    </div>

    <!-- 搜索表单 -->
    <div class="search-section">
      <el-card shadow="hover" class="dark-card">
        <el-form :model="searchForm" inline @submit.prevent="handleSearch">
          <el-form-item label="姓名" class="uniform-width">
            <el-input 
              v-model="searchForm.name" 
              placeholder="请输入姓名" 
              clearable 
              @input="debounceSearch"
              @clear="handleSearch"
            ></el-input>
          </el-form-item>
          <el-form-item label="性别" class="uniform-width">
            <el-select 
              v-model="searchForm.gender" 
              placeholder="请选择性别" 
              clearable
              style="width: 100%"
              @change="handleSearch"
            >
              <el-option label="男" :value="1"></el-option>
              <el-option label="女" :value="2"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="入职日期" class="uniform-width date-range-item">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :clearable="true"
              style="width: 100%"
              @change="handleSearch"
            ></el-date-picker>
          </el-form-item>
          <el-form-item class="search-buttons">
            <el-button class="btn-secondary" @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 员工列表 -->
    <div class="employee-list-section">
      <el-card shadow="hover" class="dark-card">
        <div class="table-tools">
          <el-button type="danger" class="btn-danger" :disabled="selectedRowKeys.length === 0" @click="handleBatchDelete">
            批量删除 <span v-if="selectedRowKeys.length > 0">({{ selectedRowKeys.length }})</span>
          </el-button>
          <span v-if="selectedRowKeys.length > 0" class="selection-info">
            已选择 {{ selectedRowKeys.length }} 项
            <el-button type="primary" link class="btn-link-primary" @click="clearSelection">清空选择</el-button>
          </span>
        </div>
        <el-table
          :data="empList"
          border
          style="width: 100%"
          @selection-change="handleSelectionChange"
          v-loading="loading"
          ref="empTableRef"
          :row-key="row => row.id"
          class="dark-table"
        >
          <el-table-column type="selection" width="55" align="center" :reserve-selection="true"></el-table-column>
          <el-table-column prop="id" label="ID" width="60" align="center"></el-table-column>
          <el-table-column prop="name" label="姓名" align="center"></el-table-column>
          <el-table-column label="头像" align="center">
            <template #default="scope">
              <el-avatar :src="scope.row.image" :size="50"></el-avatar>
            </template>
          </el-table-column>
          <el-table-column prop="gender" label="性别" align="center">
            <template #default="scope">
              {{ scope.row.gender === 1 ? '男' : '女' }}
            </template>
          </el-table-column>
          <el-table-column prop="position" label="职位" align="center">
            <template #default="scope">
              {{ getPositionName(scope.row.position) }}
            </template>
          </el-table-column>
          <el-table-column prop="salary" label="薪资" align="center">
            <template #default="scope">
              {{ scope.row.salary ? scope.row.salary.toLocaleString() : 0 }} 元
            </template>
          </el-table-column>
          <el-table-column prop="deptName" label="部门" align="center"></el-table-column>
          <el-table-column prop="hireDate" label="入职日期" align="center"></el-table-column>
          <el-table-column label="最后操作时间" align="center">
            <template #default="scope">
              {{ formatDateTime(scope.row.updateTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" align="center">
            <template #default="scope">
              <el-button type="primary" link class="btn-link-primary" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button type="danger" link class="btn-link-danger" @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[5, 10, 20, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="pagination.total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :locale="zhCn"
          ></el-pagination>
        </div>
      </el-card>
    </div>

    <!-- 添加/编辑员工对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="isEdit ? '编辑员工' : '新增员工'" 
      width="60%" 
      :close-on-click-modal="false"
      class="dark-dialog"
    >
      <el-form :model="empForm" :rules="rules" ref="empFormRef" label-width="100px">
        <el-tabs v-model="activeTab" class="dark-tabs">
          <el-tab-pane label="基本信息" name="basic">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="用户名" prop="username">
                  <el-input v-model="empForm.username" placeholder="请输入用户名"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="姓名" prop="name">
                  <el-input v-model="empForm.name" placeholder="请输入姓名"></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="性别" prop="gender">
                  <el-select v-model="empForm.gender" placeholder="请选择性别" style="width: 100%">
                    <el-option label="男" :value="1"></el-option>
                    <el-option label="女" :value="2"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="手机号" prop="phone">
                  <el-input 
                    v-model="empForm.phone" 
                    placeholder="请输入手机号"
                    maxlength="11"
                  >
                    <template #append>
                      <el-tooltip 
                        content="请输入有效的11位手机号码，且不能与系统中已有员工重复" 
                        placement="top"
                      >
                        <el-icon><InfoFilled /></el-icon>
                      </el-tooltip>
                    </template>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="职位" prop="position">
                  <el-select v-model="empForm.position" placeholder="请选择职位" style="width: 100%">
                    <el-option label="班主任" :value="1"></el-option>
                    <el-option label="讲师" :value="2"></el-option>
                    <el-option label="学工主管" :value="3"></el-option>
                    <el-option label="教研主管" :value="4"></el-option>
                    <el-option label="咨询师" :value="5"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="薪资" prop="salary">
                  <el-input-number v-model="empForm.salary" :min="0" :max="1000000" :step="1000" style="width: 100%"></el-input-number>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="入职日期" prop="hireDate">
                  <el-date-picker v-model="empForm.hireDate" type="date" placeholder="选择入职日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD" style="width: 100%"></el-date-picker>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="部门" prop="deptId">
                  <el-select v-model="empForm.deptId" placeholder="请选择部门" style="width: 100%">
                    <el-option v-for="dept in deptList" :key="dept.id" :label="dept.name" :value="dept.id"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-form-item label="头像" prop="image">
              <div class="avatar-upload-container">
                <el-upload
                  class="avatar-uploader"
                  action=""
                  :show-file-list="false"
                  :on-success="handleAvatarSuccess"
                  :before-upload="beforeAvatarUpload"
                  :http-request="customUploadAvatar"
                  :multiple="false"
                  accept=".jpg,.jpeg,.png"
                >
                  <img v-if="empForm.image" :src="empForm.image" class="avatar-preview" />
                  <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
                </el-upload>
                <div class="upload-tip-container">
                  <div class="upload-tip">请上传员工头像图片，支持JPG、PNG格式，大小不超过2MB</div>
                </div>
              </div>
            </el-form-item>
          </el-tab-pane>
          
          <el-tab-pane label="工作经历" name="experience">
            <div v-for="(expr, index) in empForm.exprList" :key="index" class="experience-item">
              <el-divider content-position="left">工作经历 {{ index + 1 }}</el-divider>
              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item :label="'公司名称'" :prop="'exprList.' + index + '.company'" :rules="exprRules.company">
                    <el-input v-model="expr.company" placeholder="请输入公司名称"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item :label="'职位'" :prop="'exprList.' + index + '.position'" :rules="exprRules.position">
                    <el-input v-model="expr.position" placeholder="请输入职位"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item :label="'开始日期'" :prop="'exprList.' + index + '.startDate'" :rules="exprRules.startDate">
                    <el-date-picker v-model="expr.startDate" type="date" placeholder="选择开始日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD" style="width: 100%"></el-date-picker>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item :label="'结束日期'" :prop="'exprList.' + index + '.endDate'" :rules="exprRules.endDate">
                    <el-date-picker v-model="expr.endDate" type="date" placeholder="选择结束日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD" style="width: 100%"></el-date-picker>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="24" class="text-right">
                  <el-button type="danger" @click="removeExperience(index)" :disabled="empForm.exprList.length <= 1">删除</el-button>
                </el-col>
              </el-row>
            </div>
            <div class="add-experience">
              <el-button type="primary" @click="addExperience">添加工作经历</el-button>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button class="btn-secondary" @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" class="btn-primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 删除确认对话框 -->
    <el-dialog v-model="deleteDialogVisible" title="提示" width="30%" class="dark-dialog">
      <span>{{ deleteDialogMsg }}</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button class="btn-secondary" @click="deleteDialogVisible = false">取消</el-button>
          <el-button type="danger" class="btn-danger" @click="confirmDelete">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 错误提示对话框 -->
    <el-dialog
      v-model="errorDialogVisible"
      title="表单验证错误"
      width="30%"
      class="dark-dialog error-dialog"
    >
      <div class="error-message-container">
        <div v-for="(message, index) in errorMessages" :key="index" class="error-message-item">
          <el-icon class="error-icon"><Warning /></el-icon>
          <span>{{ message }}</span>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button class="btn-secondary" @click="errorDialogVisible = false">关闭</el-button>
          <el-button type="primary" class="btn-primary" @click="handleFixErrors">去修复</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch, h, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { empApi } from '@/api/employee'
import { deptApi } from '@/api/dept'
import { Plus, Warning, InfoFilled } from '@element-plus/icons-vue'
import request from '@/utils/request'

// 职位映射
const positionMap = {
  1: '班主任',
  2: '讲师',
  3: '学工主管',
  4: '教研主管',
  5: '咨询师'
}

// 获取职位名称
const getPositionName = (position) => {
  return positionMap[position] || '未知'
}

// 搜索表单
const searchForm = reactive({
  name: '',
  gender: '',
  begin: '',
  end: ''
})

// 日期范围
const dateRange = ref([])

// 添加防抖功能
let searchTimer = null
const debounceSearch = () => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  searchTimer = setTimeout(() => {
    handleSearch()
  }, 500) // 500毫秒后才执行搜索，避免频繁请求
}

// 监听日期范围变化
watch(dateRange, (val) => {
  if (val && val.length === 2) {
    searchForm.begin = val[0]
    searchForm.end = val[1]
  } else {
    searchForm.begin = ''
    searchForm.end = ''
  }
  // 注意：这里不需要主动调用handleSearch()，因为el-date-picker的@change事件会触发搜索
})

// 员工列表数据
const empList = ref([])
const loading = ref(false)
const selectedRowKeys = ref([])
const empTableRef = ref(null)

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 部门列表
const deptList = ref([])

// 对话框相关
const dialogVisible = ref(false)
const isEdit = ref(false)
const empFormRef = ref(null)
const activeTab = ref('basic')

// 员工表单
const empForm = reactive({
  id: '',
  username: '',
  name: '',
  gender: 1,
  image: '',
  position: '',
  salary: 0,
  hireDate: '',
  deptId: '',
  phone: '',
  exprList: [
    {
      company: '',
      position: '',
      startDate: '',
      endDate: ''
    }
  ]
})

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  position: [
    { required: true, message: '请选择职位', trigger: 'change' }
  ],
  salary: [
    { required: true, message: '请输入薪资', trigger: 'blur' }
  ],
  hireDate: [
    { required: true, message: '请选择入职日期', trigger: 'change' }
  ],
  deptId: [
    { required: true, message: '请选择部门', trigger: 'change' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3456789]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  image: [
    { required: true, message: '请上传头像', trigger: 'blur' }
  ]
}

// 工作经历验证规则
const exprRules = {
  company: [
    { required: false, message: '请输入公司名称', trigger: 'blur' }
  ],
  position: [
    { required: false, message: '请输入职位', trigger: 'blur' }
  ],
  startDate: [
    { required: false, message: '请选择开始日期', trigger: 'change' }
  ],
  endDate: [
    { required: false, message: '请选择结束日期', trigger: 'change' }
  ]
}

// 删除相关
const deleteDialogVisible = ref(false)
const deleteDialogMsg = ref('')
const currentDeleteAction = ref('')
const currentDeleteData = ref(null)

// 错误提示相关
const errorDialogVisible = ref(false)
const errorMessages = ref([])
const activeErrorTab = ref('basic')

// 文件上传相关
const customUploadAvatar = async (options) => {
  try {
    const file = options.file
    const formData = new FormData()
    formData.append('file', file)
    
    const config = {
      headers: {
        // 必须指定 Content-Type 为 multipart/form-data
        'Content-Type': 'multipart/form-data' 
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        options.onProgress && options.onProgress({ percent: percentCompleted })
      }
    }
    
    // 使用配置好的 request 实例发送请求
    // Authorization header 会由 request 实例的拦截器自动添加
    // baseURL is '/api', so the path should be relative to it
    const response = await request.post('/upload', formData, config)
    
    // 处理响应 - code === 0 判断成功
    if (response.code === 0) { 
      empForm.image = response.data // 后端直接返回 URL
      // 注意：Element Plus 的 onSuccess 可能不需要手动调用了，
      // 因为 el-upload 的 :http-request 覆盖了默认行为。
      // 我们直接更新 empForm.image 即可。
      // options.onSuccess && options.onSuccess(response)
      ElMessage.success('上传成功')
    } else {
      throw new Error(response.msg || '上传失败')
    }
  } catch (error) {
    // onError 仍然需要调用，以通知 el-upload 上传失败
    options.onError && options.onError(error)
    ElMessage.error(error.message || '上传失败')
  }
}

// 头像上传成功处理 - 这个函数现在可能不再需要，因为上面直接更新了 empForm.image
const handleAvatarSuccess = (res) => {
  // empForm.image = res.data
}

// 头像上传前验证
const beforeAvatarUpload = (file) => {
  const isJPG = file.type === 'image/jpeg'
  const isPNG = file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG && !isPNG) {
    ElMessage.error('上传头像图片只能是 JPG 或 PNG 格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('上传头像图片大小不能超过 2MB!')
    return false
  }
  return true
}

// 处理错误修复操作
const handleFixErrors = () => {
  errorDialogVisible.value = false
  // 切换到有错误的选项卡
  activeTab.value = activeErrorTab.value
}

// 加载员工列表
const loadEmpList = async () => {
  loading.value = true
  try {
    const params = {
      name: searchForm.name,
      gender: searchForm.gender,
      begin: searchForm.begin,
      end: searchForm.end,
      page: pagination.page,
      pageSize: pagination.pageSize
    }
    
    const res = await empApi.getEmpList(params)
    // 修改判断条件为 code === 0
    if (res.code === 0) { 
      empList.value = res.data?.rows || []
      pagination.total = res.data?.total || 0
      
      nextTick(() => {
        setTableSelection()
      })
    } else {
      ElMessage.error(res.msg || '获取员工列表失败')
      empList.value = []
      pagination.total = 0
    }
  } catch (error) {
    console.error('获取员工列表出错：', error)
    ElMessage.error('获取员工列表时发生错误，请稍后重试') 
    empList.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
  
  return Promise.resolve() // 返回一个Promise以便链式调用
}

// 格式化日期时间，转换为中国时区
const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return '-'
  
  // 将ISO格式的时间转换为中国时区的时间
  const date = new Date(dateTimeString)
  
  // 使用toLocaleString方法，指定中国时区和格式
  return date.toLocaleString('zh-CN', { 
    timeZone: 'Asia/Shanghai',
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(/\//g, '-')
}

// 加载部门列表
const loadDeptList = async () => {
  try {
    const res = await deptApi.getDeptList()
    // 修改判断条件：只检查 code === 0
    if (res.code === 0) { 
      deptList.value = res.data || [] // 确保 data 存在
    } else {
      // 只有在 code != 0 时才报错
      ElMessage.error(res.msg || '获取部门列表失败')
      deptList.value = [] // 清空
    }
  } catch (error) {
    console.error('获取部门列表出错：', error)
    ElMessage.error('获取部门列表时发生网络错误，请稍后重试') // 修改错误提示
    deptList.value = [] // 清空
  }
}

// 处理搜索
const handleSearch = () => {
  pagination.page = 1
  loadEmpList()
}

// 重置搜索条件
const resetSearch = () => {
  searchForm.name = ''
  searchForm.gender = ''
  searchForm.begin = ''
  searchForm.end = ''
  dateRange.value = []
  pagination.page = 1
  loadEmpList()
}

// 处理分页大小变化
const handleSizeChange = (size) => {
  pagination.pageSize = size
  loadEmpList()
}

// 处理页码变化
const handleCurrentChange = (page) => {
  pagination.page = page
  loadEmpList().then(() => {
    // 页面加载完成后，恢复选中状态
    nextTick(() => {
      setTableSelection()
    })
  })
}

// 处理选择变化
const handleSelectionChange = (selection) => {
  // 获取当前选中行的ID
  const currentPageSelectedIds = selection.map(item => item.id)
  
  // 找出当前页面中被取消选择的ID
  const currentPageDisplayedIds = empList.value.map(item => item.id)
  const unselectedIds = currentPageDisplayedIds.filter(id => !currentPageSelectedIds.includes(id))
  
  // 从全局已选择ID中移除被取消选择的ID
  selectedRowKeys.value = selectedRowKeys.value.filter(id => !unselectedIds.includes(id))
  
  // 将新选择的ID添加到全局已选择ID中
  currentPageSelectedIds.forEach(id => {
    if (!selectedRowKeys.value.includes(id)) {
      selectedRowKeys.value.push(id)
    }
  })
}

// 清空选择
const clearSelection = () => {
  selectedRowKeys.value = []
  empTableRef.value.clearSelection()
}

// 设置表格的选中状态
const setTableSelection = () => {
  if (empTableRef.value) {
    // 清除当前选择
    empTableRef.value.clearSelection()
    
    // 恢复当前页中应该被选中的行
    empList.value.forEach(row => {
      if (selectedRowKeys.value.includes(row.id)) {
        empTableRef.value.toggleRowSelection(row, true)
      }
    })
  }
}

// 添加员工
const handleAdd = () => {
  resetEmpForm()
  isEdit.value = false
  dialogVisible.value = true
  activeTab.value = 'basic'
}

// 重置员工表单
const resetEmpForm = () => {
  empForm.id = ''
  empForm.username = ''
  empForm.name = ''
  empForm.gender = 1
  empForm.image = ''
  empForm.position = ''
  empForm.salary = 0
  empForm.hireDate = ''
  empForm.deptId = ''
  empForm.phone = ''
  empForm.exprList = [
    {
      company: '',
      position: '',
      startDate: '',
      endDate: ''
    }
  ]
}

// 处理编辑员工
const handleEdit = async (row) => {
  try {
    const res = await empApi.getEmpById(row.id)
    // 修改判断条件为 code === 0
    if (res.code === 0) { 
      Object.assign(empForm, res.data)
      
      if (!empForm.exprList || empForm.exprList.length === 0) {
        empForm.exprList = [
          { company: '', position: '', startDate: '', endDate: '' }
        ]
      }
      
      isEdit.value = true
      dialogVisible.value = true
      activeTab.value = 'basic'
    } else {
      ElMessage.error(res.msg || '获取员工信息失败')
    }
  } catch (error) {
    console.error('获取员工信息出错：', error)
    ElMessage.error('网络错误，请稍后重试')
  }
}

// 处理删除员工
const handleDelete = (row) => {
  currentDeleteAction.value = 'single'
  currentDeleteData.value = row.id
  deleteDialogMsg.value = `您确定要删除员工 "${row.name}" 吗？`
  deleteDialogVisible.value = true
}

// 处理批量删除
const handleBatchDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    ElMessage.warning('请选择要删除的员工')
    return
  }
  
  currentDeleteAction.value = 'batch'
  currentDeleteData.value = selectedRowKeys.value.join(',')
  deleteDialogMsg.value = `您确定要删除选中的 ${selectedRowKeys.value.length} 名员工吗？`
  deleteDialogVisible.value = true
}

// 确认删除
const confirmDelete = async () => {
  try {
    const ids = currentDeleteData.value
    const res = await empApi.deleteEmp(ids)
    
    // 修改判断条件为 code === 0
    if (res.code === 0) { 
      ElMessage.success('删除成功')
      if (currentDeleteAction.value === 'batch') {
        selectedRowKeys.value = []
      }
      loadEmpList()
    } else {
      ElMessage.error(res.msg || '删除失败')
    }
  } catch (error) {
    console.error('删除员工出错：', error)
    ElMessage.error('网络错误，请稍后重试')
  } finally {
    deleteDialogVisible.value = false
  }
}

// 添加工作经历
const addExperience = () => {
  empForm.exprList.push({
    company: '',
    position: '',
    startDate: '',
    endDate: ''
  })
}

// 删除工作经历
const removeExperience = (index) => {
  if (empForm.exprList.length > 1) {
    empForm.exprList.splice(index, 1)
  }
}

// 在提交表单前处理工作经历数据
const prepareFormData = () => {
  // 创建一个新对象，避免直接修改响应式对象
  const formData = JSON.parse(JSON.stringify(empForm))
  
  // 过滤无效的工作经历记录
  if (formData.exprList && Array.isArray(formData.exprList)) {
    formData.exprList = formData.exprList.filter(exp => {
      // 如果公司名称和职位都为空，视为无效记录
      return exp.company && exp.position
    })
    
    // 确保日期格式是字符串
    formData.exprList.forEach(exp => {
      if (!exp.startDate) exp.startDate = null
      if (!exp.endDate) exp.endDate = null
    })
  }
  
  return formData
}

// 处理手机号错误
const handlePhoneError = (message) => {
  // 显示错误消息
  ElMessage({
    type: 'error',
    message: message,
    duration: 5000,
    showClose: true
  })
  
  // 将焦点设置到手机号输入框并选中内容
  nextTick(() => {
    const phoneInputs = document.querySelectorAll('input[placeholder="请输入手机号"]')
    if (phoneInputs && phoneInputs.length > 0) {
      phoneInputs[0].focus()
      phoneInputs[0].select()
    }
  })
  
  // 标记手机号字段为错误状态
  if (empFormRef.value) {
    // 创建一个临时的手机号验证规则
    const tempRules = {
      phone: [
        { 
          validator: (rule, value, callback) => {
            callback(new Error(message))
          }, 
          trigger: 'manual' 
        }
      ]
    }
    
    // 应用临时规则
    empFormRef.value.clearValidate('phone')
    empFormRef.value.validateField('phone', () => {})
  }
}

// 修改提交函数
const submitForm = async () => {
  if (!empFormRef.value) return
  
  await empFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const formData = prepareFormData()
        // console.log('准备提交的数据:', formData) // 调试时可取消注释
        
        let res
        if (isEdit.value) {
          res = await empApi.updateEmp(formData)
        } else {
          res = await empApi.addEmp(formData)
        }
        
        // 修改判断条件为 code === 0
        if (res.code === 0) { 
          ElMessage.success(isEdit.value ? '修改成功' : '添加成功')
          dialogVisible.value = false
          loadEmpList()
        } else {
          if (res.code === 0 && res.msg.includes('手机号已存在')) { // 注意：此处的 code === 0 判断可能需要移除或调整
            handlePhoneError(res.msg)
            return
          } else {
            ElMessage.error(res.msg || (isEdit.value ? '修改失败' : '添加失败'))
          }
        }
      } catch (error) {
        console.error('具体错误信息:', error)
        ElMessage.error('操作失败，请稍后重试')
      }
    } else {
        // 可以在这里添加表单验证失败的提示
        // ElMessage.warning('请检查表单填写是否正确');
      return false
    }
  })
}

// 获取字段显示名称
const getFieldDisplayName = (field) => {
  const fieldMap = {
    'username': '用户名',
    'name': '姓名',
    'gender': '性别',
    'image': '头像',
    'position': '职位',
    'salary': '薪资',
    'hireDate': '入职日期',
    'deptId': '部门',
    'phone': '手机号'
  }
  return fieldMap[field] || field
}

// 获取工作经历字段显示名称
const getExprFieldDisplayName = (field) => {
  const fieldMap = {
    'company': '公司名称',
    'position': '职位',
    'startDate': '开始日期',
    'endDate': '结束日期'
  }
  return fieldMap[field] || field
}

// 组件挂载时加载数据
onMounted(() => {
  loadEmpList()
  loadDeptList()
})
</script>

<style scoped>
/* --- Paste Dark Theme Styles from DepartmentManagement.vue below --- */

/* Apply dark theme to the container */
.dark-theme {
  color: #ced4da;
}
.dark-theme h2,
.dark-theme h4 {
  color: #e9ecef;
}
.dark-theme .selection-info { /* Style for selection info text */
    color: #adb5bd;
    margin-left: 15px;
}

/* Dark Card Styles */
.dark-card {
  background-color: #212529;
  border: 1px solid #495057;
  color: #ced4da;
}
.dark-card .card-header {
  color: #e9ecef;
  border-bottom: 1px solid #495057;
}
/* Style form labels within dark cards */
.dark-card :deep(.el-form-item__label) {
    color: #ced4da;
}

/* Dark Table Styles using :deep */
.dark-table :deep(.el-table__header-wrapper th),
.dark-table :deep(.el-table__header-wrapper thead) {
  background-color: #343a40 !important;
  color: #e9ecef !important;
}
.dark-table :deep(.el-table__row),
.dark-table :deep(.el-table__body tr) {
  background-color: #2c3034 !important;
  color: #ced4da !important;
}
.dark-table :deep(.el-table__row:hover > td),
.dark-table :deep(.el-table__body tr:hover > td) {
  background-color: #3a4045 !important;
}
.dark-table :deep(th.el-table__cell),
.dark-table :deep(td.el-table__cell) {
  border-color: #495057 !important;
}
.dark-table :deep(.el-table__empty-text) {
    color: #adb5bd;
}
/* Style table selection background */
.dark-table :deep(tr.selected-row > td) { 
  background-color: #3a4045 !important;
}
.dark-table :deep(.el-checkbox__inner) { 
    background-color: #495057;
    border-color: #6c757d;
}
.dark-table :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
    background-color: #198754;
    border-color: #198754;
}
.dark-table :deep(.el-checkbox__input.is-indeterminate .el-checkbox__inner) {
    background-color: #198754;
    border-color: #198754;
}

/* Dark Input/Select/DatePicker Styles using :deep */
.dark-theme :deep(.el-input__wrapper),
.dark-theme :deep(.el-select__wrapper),
.dark-theme :deep(.el-input-number) { 
  background-color: #343a40;
  box-shadow: none;
  border: 1px solid #495057;
  color: #e9ecef;
}
.dark-theme :deep(.el-input__wrapper.is-focus),
.dark-theme :deep(.el-select__wrapper.is-focused),
.dark-theme :deep(.el-input-number.is-focus .el-input__wrapper) {
  border-color: #198754;
}
.dark-theme :deep(.el-input__inner),
.dark-theme :deep(.el-select__placeholder),
.dark-theme :deep(.el-select__selected-item span) {
  color: #e9ecef;
}
.dark-theme :deep(.el-input__inner::placeholder) {
  color: #6c757d;
}
.dark-theme :deep(.el-select .el-input .el-select__caret),
.dark-theme :deep(.el-input__icon),
.dark-theme :deep(.el-input-number__decrease),
.dark-theme :deep(.el-input-number__increase) {
    color: #adb5bd;
}
.dark-theme :deep(.el-date-editor .el-input__wrapper) {
    background-color: #343a40;
    border: 1px solid #495057;
}
.dark-theme :deep(.el-date-editor .el-input__inner) {
    color: #e9ecef;
}
.dark-theme :deep(.el-date-editor .el-range-input::placeholder),
.dark-theme :deep(.el-date-editor .el-range-separator) {
    color: #6c757d;
}

/* Dark Dialog Styles using :deep */
.dark-dialog .el-dialog__header {
  background-color: #2a2f34; 
  margin-right: 0;
}
.dark-dialog .el-dialog__title {
    color: #e9ecef;
}
.dark-dialog .el-dialog__headerbtn .el-dialog__close {
    color: #ced4da;
}
.dark-dialog .el-dialog__headerbtn .el-dialog__close:hover {
    color: #198754;
}
.dark-dialog .el-dialog__body {
  background-color: #212529;
  color: #ced4da;
}
.dark-dialog .el-dialog__footer {
  background-color: #212529;
  border-top: 1px solid #495057;
}
/* Style form labels within dialog */
.dark-dialog :deep(.el-form-item__label) {
    color: #ced4da;
}

/* Dark Tabs Styles using :deep */
.dark-tabs :deep(.el-tabs__header) {
    border-bottom: 1px solid #495057;
}
.dark-tabs :deep(.el-tabs__item) {
    color: #adb5bd;
}
.dark-tabs :deep(.el-tabs__item.is-active) {
    color: #198754;
}
.dark-tabs :deep(.el-tabs__active-bar) {
    background-color: #198754;
}
.dark-tabs :deep(.el-tabs__nav-wrap::after) {
    background-color: #495057;
}

/* Dark Upload Styles */
.dark-theme :deep(.el-upload--picture-card), /* Adjust if using picture-card */
.dark-theme :deep(.avatar-uploader .el-upload) { 
    background-color: #343a40;
    border: 1px dashed #495057;
    color: #6c757d;
}
.dark-theme :deep(.avatar-uploader .el-upload:hover) {
    border-color: #198754;
    color: #198754;
}
.dark-theme .upload-tip {
    color: #adb5bd;
}

/* Dark Pagination Styles using :deep */
.dark-theme .pagination-container :deep(.el-pagination) {
    color: #ced4da;
}
.dark-theme .pagination-container :deep(.el-pagination button),
.dark-theme .pagination-container :deep(.el-pager li) {
    background-color: #2c3034;
    color: #ced4da;
}
.dark-theme .pagination-container :deep(.el-pager li.is-active) {
    color: #ffffff;
    background-color: #198754;
}
.dark-theme .pagination-container :deep(.el-pagination__total),
.dark-theme .pagination-container :deep(.el-pagination__jump) {
    color: #adb5bd;
}
.dark-theme .pagination-container :deep(.el-input__wrapper) { 
    background-color: #343a40; 
    border-color: #495057;
}

/* Dark Button Styles */
.dark-theme .btn-primary {
  background-color: #198754;
  border-color: #198754;
  color: #ffffff;
}
.dark-theme .btn-primary:hover {
  background-color: #157347;
  border-color: #146c43;
}
.dark-theme .btn-secondary {
  background-color: #495057;
  border-color: #495057;
  color: #ced4da;
}
.dark-theme .btn-secondary:hover {
  background-color: #5a6268;
  border-color: #545b62;
}
.dark-theme .btn-danger {
  background-color: #dc3545;
  border-color: #dc3545;
  color: #ffffff;
}
.dark-theme .btn-danger:hover {
  background-color: #bb2d3b;
  border-color: #b02a37;
}
.dark-theme .btn-link-primary {
    color: #198754;
}
.dark-theme .btn-link-primary:hover {
    color: #157347;
}
.dark-theme .btn-link-danger {
    color: #dc3545;
}
.dark-theme .btn-link-danger:hover {
    color: #bb2d3b;
}


/* --- Original Styles (Keep for reference/fallback) --- */
.employee-management-container {
  padding: 20px;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-section {
  margin-bottom: 20px;
}

/* 统一表单项宽度 */
.uniform-width {
  width: 220px;
  margin-right: 15px;
}

.uniform-width :deep(.el-input),
.uniform-width :deep(.el-select) {
  width: 100%;
}

/* 日期选择器宽度调整 */
.date-range-item {
  width: 380px;
}

.date-range-item :deep(.el-date-editor) {
  width: 100%;
}

.search-buttons {
  margin-left: 10px;
}

.table-tools {
  margin-bottom: 15px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.experience-item {
  margin-bottom: 15px;
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.add-experience {
  margin-top: 15px;
  text-align: center;
}

.text-right {
  text-align: right;
}

.image-preview {
  margin-top: 10px;
}

:deep(.el-date-editor.el-input) {
  width: 100%;
}

.selection-info {
  margin-left: 15px;
  color: #606266;
}

.table-tools {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.avatar-upload-container {
  display: flex;
  align-items: center;
}

.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 178px;
  height: 178px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0; /* 防止容器收缩 */
}

.avatar-uploader:hover {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar-preview {
  max-width: 178px;
  max-height: 178px;
  display: block;
}

.upload-tip-container {
  margin-left: 20px;
  flex: 1;
}

.upload-tip {
  color: #606266;
  font-size: 13px;
  line-height: 1.5;
}

.error-message-container {
  max-height: 300px;
  overflow-y: auto;
}

.error-message-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding: 10px 15px;
  background-color: #ffeded;
  border-radius: 4px;
}

.error-icon {
  color: #F56C6C;
  margin-right: 8px;
  font-size: 16px;
}

.error-dialog :deep(.el-dialog__body) {
  padding-top: 10px;
  padding-bottom: 10px;
}
</style> 