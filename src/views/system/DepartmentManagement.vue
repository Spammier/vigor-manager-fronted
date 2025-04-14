<template>
  <div class="department-management-container dark-theme">
    <div class="header-section">
      <h2>部门管理</h2>
      <div class="header-right">
        <el-button type="primary" class="btn-primary" @click="showAddDialog">+ 新增部门</el-button>
      </div>
    </div>

    <div class="content-section">
      <div class="dept-list-section">
        <el-card shadow="hover" class="dark-card">
          <el-table :data="deptList" border style="width: 100%" class="dark-table">
            <el-table-column prop="id" label="序号" align="center" min-width="1" />
            <el-table-column prop="name" label="部门名称" align="center" min-width="1" />
            <el-table-column prop="createTime" label="创建时间" align="center" min-width="1">
              <template #default="scope">
                {{ formatDateTime(scope.row.createTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="updateTime" label="修改时间" align="center" min-width="1">
              <template #default="scope">
                {{ formatDateTime(scope.row.updateTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" min-width="1">
              <template #default="scope">
                <el-button type="primary" link class="btn-link-primary" @click="handleEdit(scope.row)">编辑</el-button>
                <el-button type="danger" link class="btn-link-danger" @click="handleDelete(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>

      <div class="dept-info-section">
        <el-card shadow="hover" class="requirement-card dark-card">
          <template #header>
            <div class="card-header">
              <span>部门管理-需求说明</span>
            </div>
          </template>
          <div class="requirement-content">
            <p>部门管理页面，需要以以下形式展示：</p>
            <p>1. 列表显示当前系统所有的部门数据</p>
            <p>2. 对每条部门数据提供"编辑"和"删除"功能</p>
            <p>3. 页面提供"新增部门"功能</p>
          </div>
        </el-card>

        <el-card shadow="hover" class="rule-card dark-card">
          <template #header>
            <div class="card-header">
              <span>页面开发规则</span>
            </div>
          </template>
          <div class="rule-content">
            <h4>1. 部门操作</h4>
            <p>1.1 部门添加：部门名称必填，不可为空限制。</p>
            <p>1.2 对部门的操作：提供编辑和删除两个功能按钮。</p>

            <h4>2. 新增部门</h4>
            <p>2.1 点击新增部门，弹出添加部门对话框。</p>
            <p>2.2 部门表单：名称，长度为1-10位。</p>

            <h4>3. 删除部门</h4>
            <p>删除操作时，提示"您确定要删除该部门吗？"如果确认了，则执行删除，否则不执行。</p>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 添加/编辑部门对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="isEdit ? '编辑部门' : '新增部门'"
      width="30%"
      :close-on-click-modal="false"
      class="dark-dialog"
    >
      <el-form :model="deptForm" :rules="rules" ref="deptFormRef" label-width="80px">
        <el-form-item label="部门名称" prop="name">
          <el-input v-model="deptForm.name" placeholder="请输入部门名称"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button class="btn-secondary" @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" class="btn-primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 删除确认对话框 -->
    <el-dialog 
      v-model="deleteDialogVisible" 
      title="提示" 
      width="30%"
      class="dark-dialog"
    >
      <span>您确定要删除该部门吗？</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button class="btn-secondary" @click="deleteDialogVisible = false">取消</el-button>
          <el-button type="danger" class="btn-danger" @click="confirmDelete">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request' // 导入 request 实例

// --- 在组件内部定义 API 调用 ---
const deptApi = {
  getList: (params) => request.get('/depts', { params }),
  getById: (id) => request.get(`/depts/${id}`),
  addDept: (data) => request.post('/depts', data),
  updateDept: (data) => request.put('/depts', data),
  deleteDept: (id) => request.delete(`/depts/${id}`)
}
// ---

// 部门列表数据
const deptList = ref([])
const loading = ref(false)

// 表单相关
const dialogVisible = ref(false)
const isEdit = ref(false)
const deptFormRef = ref(null)
const deptForm = reactive({
  id: '',
  name: ''
})
const rules = {
  name: [
    { required: true, message: '请输入部门名称', trigger: 'blur' },
    { min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur' }
  ]
}

// 删除相关
const deleteDialogVisible = ref(false)
const currentDept = ref(null)

// 加载部门列表
const loadDeptList = async () => {
  loading.value = true; 
  try {
    const params = { page: 1, pageSize: 1000 }; 
    const res = await deptApi.getList(params); 
    if (res.code === 0) {
      // Check if res.data is the array OR if res.data.rows is the array
      if (Array.isArray(res.data)) {
        deptList.value = res.data; // Backend returns array directly in data
      } else if (res.data && Array.isArray(res.data.rows)) {
        deptList.value = res.data.rows; // Backend returns paginated structure with rows
      } else {
        deptList.value = []; // Structure is unexpected, default to empty
        console.warn("Unexpected data structure received for departments:", res.data);
      }
    } else {
      ElMessage.error(res.msg || '获取部门列表失败');
      deptList.value = [];
    }
  } catch (error) {
    console.error('获取部门列表出错：', error);
    ElMessage.error('获取部门列表时发生错误，请稍后重试');
    deptList.value = [];
  } finally {
      loading.value = false; 
  }
}

// 格式化日期时间
const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return ''
  
  // 将ISO格式的时间转换为更友好的格式
  const date = new Date(dateTimeString)
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 显示添加部门对话框
const showAddDialog = () => {
  isEdit.value = false
  deptForm.id = ''
  deptForm.name = ''
  dialogVisible.value = true
}

// 处理编辑部门
const handleEdit = async (row) => {
  try {
    const res = await deptApi.getById(row.id)
    if (res.code === 0) {
      deptForm.id = res.data.id
      deptForm.name = res.data.name
      isEdit.value = true
      dialogVisible.value = true
    } else {
      ElMessage.error(res.msg || '获取部门信息失败')
    }
  } catch (error) {
    console.error('获取部门信息出错：', error)
    ElMessage.error('网络错误，请稍后重试')
  }
}

// 处理删除部门
const handleDelete = (row) => {
  currentDept.value = row
  deleteDialogVisible.value = true
}

// 确认删除
const confirmDelete = async () => {
  if (!currentDept.value) return
  
  try {
    const res = await deptApi.deleteDept(currentDept.value.id)
    if (res.code === 0) {
      ElMessage.success('删除成功')
      loadDeptList()
    } else {
      ElMessage.error(res.msg || '删除失败')
    }
  } catch (error) {
    console.error('删除部门出错：', error)
    ElMessage.error('网络错误，请稍后重试')
  } finally {
    deleteDialogVisible.value = false
    currentDept.value = null
  }
}

// 提交表单
const submitForm = async () => {
  if (!deptFormRef.value) return
  
  await deptFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        let res
        if (isEdit.value) {
          // 编辑部门
          res = await deptApi.updateDept({
            id: deptForm.id,
            name: deptForm.name
          })
        } else {
          // 添加部门
          res = await deptApi.addDept({
            name: deptForm.name
          })
        }
        
        if (res.code === 0) {
          ElMessage.success(isEdit.value ? '修改成功' : '添加成功')
          dialogVisible.value = false
          loadDeptList()
        } else {
          ElMessage.error(res.msg || (isEdit.value ? '修改失败' : '添加失败'))
        }
      } catch (error) {
        console.error(isEdit.value ? '修改部门出错：' : '添加部门出错：', error)
        ElMessage.error('网络错误，请稍后重试')
      }
    }
  })
}

// 组件挂载时加载部门列表
onMounted(() => {
  loadDeptList()
})
</script>

<style scoped>
/* Use CSS Variables for Card */
.dark-card {
  background-color: var(--dark-bg-card);
  border: 1px solid var(--dark-border-primary);
  color: var(--dark-text-primary);
  margin-bottom: 25px; /* Increase spacing between cards */
  padding: 20px; /* Add padding inside card */
  border-radius: 6px; /* Add slight rounding */
}

/* Header within the component */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}
.header-section h2 {
    margin: 0; /* Remove default margin */
    font-size: 1.6em; /* Slightly larger heading */
    color: var(--dark-text-primary);
}

/* Search Card Specifics */
.search-card .el-form-item {
  margin-bottom: 0; /* Remove bottom margin for inline form */
}
.search-card :deep(.el-form-item__label) {
  color: var(--dark-text-secondary); /* Use secondary text color */
  padding-right: 10px;
}

/* List Card Specifics */
.list-card .pagination-container {
  margin-top: 25px;
  display: flex;
  justify-content: flex-end;
}

/* Use CSS Variables for Table */
.dark-table :deep(.el-table__header-wrapper th),
.dark-table :deep(.el-table__header-wrapper thead) {
  background-color: var(--dark-bg-input) !important; /* Darker header */
  color: var(--dark-text-primary) !important;
  border-bottom: 1px solid var(--dark-border-primary) !important;
}
.dark-table :deep(.el-table__row),
.dark-table :deep(.el-table__body tr) {
  background-color: var(--dark-bg-card) !important; /* Match card background */
  color: var(--dark-text-secondary) !important;
}
.dark-table :deep(.el-table__row:hover > td),
.dark-table :deep(.el-table__body tr:hover > td) {
  background-color: var(--dark-bg-hover) !important;
}
.dark-table :deep(th.el-table__cell),
.dark-table :deep(td.el-table__cell) {
  border-color: var(--dark-border-primary) !important;
}
.dark-table :deep(.el-table__empty-text) {
  color: var(--dark-text-secondary);
}
/* Highlight text in table cells */
.dark-table :deep(td .cell) {
    color: var(--dark-text-primary);
}

/* Use CSS Variables for Input/Select */
:deep(.el-input__wrapper),
:deep(.el-select__wrapper) {
  background-color: var(--dark-bg-input);
  box-shadow: none !important;
  border: 1px solid var(--dark-border-primary);
  color: var(--dark-text-primary);
}
:deep(.el-input__wrapper.is-focus),
:deep(.el-select__wrapper.is-focused) {
  border-color: var(--accent-color);
}
:deep(.el-input__inner),
:deep(.el-select__placeholder),
:deep(.el-select-v2__placeholder),
:deep(.el-select__selected-item span) {
  color: var(--dark-text-primary);
}
:deep(.el-input__inner::placeholder) {
  color: var(--dark-text-placeholder);
}
:deep(.el-select .el-input .el-select__caret),
:deep(.el-input__icon) {
  color: var(--dark-text-secondary);
}

/* Use CSS Variables for Dialog */
.dark-dialog .el-dialog__header {
  background-color: var(--dark-bg-input);
  margin-right: 0;
  padding: 15px 20px; /* Adjust padding */
  border-bottom: 1px solid var(--dark-border-primary);
}
.dark-dialog .el-dialog__title {
  color: var(--dark-text-primary);
  font-size: 1.1em;
}
.dark-dialog .el-dialog__headerbtn .el-dialog__close {
  color: var(--dark-text-secondary);
  font-size: 1.2em;
}
.dark-dialog .el-dialog__headerbtn .el-dialog__close:hover {
  color: var(--accent-color);
}
.dark-dialog .el-dialog__body {
  background-color: var(--dark-bg-card);
  color: var(--dark-text-secondary);
  padding: 25px 20px; /* Adjust padding */
}
.dark-dialog .el-dialog__footer {
  background-color: var(--dark-bg-card);
  border-top: 1px solid var(--dark-border-primary);
  padding: 15px 20px;
}
.dark-dialog :deep(.el-form-item__label) {
  color: var(--dark-text-secondary);
}

/* Use CSS Variables for Pagination */
.pagination-container :deep(.el-pagination) {
  color: var(--dark-text-secondary);
}
.pagination-container :deep(.el-pagination button),
.pagination-container :deep(.el-pager li) {
  background-color: var(--dark-bg-input);
  color: var(--dark-text-secondary);
  border-radius: 4px;
}
.pagination-container :deep(.el-pager li:hover) {
    color: var(--accent-color);
}
.pagination-container :deep(.el-pager li.is-active) {
  color: #ffffff;
  background-color: var(--accent-color);
}
.pagination-container :deep(.el-pagination__total),
.pagination-container :deep(.el-pagination__jump) {
  color: var(--dark-text-secondary);
  margin: 0 10px;
}
.pagination-container :deep(.el-pagination__jump .el-input__wrapper) {
  background-color: var(--dark-bg-input);
  border-color: var(--dark-border-primary);
}

/* Use CSS Variables for Buttons */
.btn-primary {
  background-color: var(--accent-color);
  border-color: var(--accent-color);
  color: #ffffff;
}
.btn-primary:hover {
  background-color: var(--accent-color-hover);
  border-color: var(--accent-color-hover);
}
.btn-secondary {
  background-color: var(--dark-bg-input);
  border-color: var(--dark-border-primary);
  color: var(--dark-text-secondary);
}
.btn-secondary:hover {
  background-color: var(--dark-bg-hover);
  border-color: var(--dark-border-primary);
  color: var(--dark-text-primary);
}
.btn-danger {
  background-color: var(--danger-color);
  border-color: var(--danger-color);
  color: #ffffff;
}
.btn-danger:hover {
  background-color: var(--danger-color-hover);
  border-color: var(--danger-color-hover);
}
.btn-link-primary {
  color: var(--accent-color);
  background-color: transparent;
  border: none;
}
.btn-link-primary:hover {
  color: var(--accent-color-hover);
}
.btn-link-danger {
  color: var(--danger-color);
  background-color: transparent;
  border: none;
}
.btn-link-danger:hover {
  color: var(--danger-color-hover);
}

/* --- Keep necessary original styles --- */
.department-management-container {
  /* Remove padding if handled by app-content */
  /* padding: 20px; */
}

/* Adjust any specific layout needs here */
</style> 