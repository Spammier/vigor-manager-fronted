<template>
  <div class="class-management-container dark-theme">
    <div class="header-section">
      <h2>班级管理</h2>
      <el-button type="primary" class="btn-primary" @click="handleAdd">+ 新增班级</el-button>
    </div>

    <!-- 搜索区域 -->
    <el-card shadow="hover" class="search-card dark-card">
      <el-form :model="searchForm" inline @submit.prevent="handleSearch">
        <el-form-item label="班级名称">
          <el-input v-model="searchForm.className" placeholder="请输入班级名称" clearable @clear="handleSearch"></el-input>
        </el-form-item>
        <el-form-item label="班级状态">
          <el-select v-model="searchForm.classStatus" placeholder="请选择状态" clearable @change="handleSearch">
            <el-option label="未开班" value="未开班"></el-option>
            <el-option label="已开班" value="已开班"></el-option>
            <el-option label="已毕业" value="已毕业"></el-option>
            <!-- 根据实际情况添加更多状态 -->
          </el-select>
        </el-form-item>
        <el-form-item label="开班日期">
          <el-date-picker
            v-model="searchDateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            clearable
            @change="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="btn-primary" @click="handleSearch">查询</el-button>
          <el-button class="btn-secondary" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 班级列表 -->
    <el-card shadow="hover" class="list-card dark-card">
      <el-table :data="classList" border style="width: 100%" v-loading="loading" class="dark-table">
        <el-table-column prop="id" label="序号" width="80" align="center" />
        <el-table-column prop="className" label="班级名称" min-width="150" />
        <el-table-column prop="classroom" label="教室" min-width="100" />
        <el-table-column prop="startTime" label="开班时间" min-width="120" align="center" />
        <el-table-column prop="graduateTime" label="毕业时间" min-width="120" align="center" />
        <el-table-column prop="classStatus" label="状态" min-width="80" align="center" />
        <el-table-column prop="headTeacher" label="班主任" min-width="100" />
        <el-table-column prop="subject" label="学科" min-width="100" />
        <el-table-column prop="updateTime" label="最后操作时间" min-width="160" align="center">
           <template #default="scope">{{ formatDateTime(scope.row.updateTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
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
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑班级对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑班级' : '新增班级'"
      width="50%"
      :close-on-click-modal="false"
      @close="resetForm"
      class="dark-dialog"
    >
      <el-form :model="classForm" :rules="rules" ref="classFormRef" label-width="100px">
        <el-form-item label="班级名称" prop="className">
          <el-input v-model="classForm.className" placeholder="请输入班级名称"></el-input>
        </el-form-item>
        <el-form-item label="教室" prop="classroom">
          <el-input v-model="classForm.classroom" placeholder="请输入教室"></el-input>
        </el-form-item>
         <el-form-item label="学科" prop="subject">
          <el-input v-model="classForm.subject" placeholder="请输入学科"></el-input>
        </el-form-item>
        <el-form-item label="开班时间" prop="startTime">
          <el-date-picker v-model="classForm.startTime" type="date" placeholder="选择开班时间" format="YYYY-MM-DD" value-format="YYYY-MM-DD" style="width: 100%;"></el-date-picker>
        </el-form-item>
        <el-form-item label="毕业时间" prop="graduateTime">
          <el-date-picker v-model="classForm.graduateTime" type="date" placeholder="选择毕业时间" format="YYYY-MM-DD" value-format="YYYY-MM-DD" style="width: 100%;"></el-date-picker>
        </el-form-item>
        <el-form-item label="班主任" prop="headTeacher">
          <el-input v-model="classForm.headTeacher" placeholder="请输入班主任姓名"></el-input>
        </el-form-item>
         <el-form-item label="状态" prop="classStatus">
           <el-select v-model="classForm.classStatus" placeholder="请选择状态" style="width: 100%;">
            <el-option label="未开班" value="未开班"></el-option>
            <el-option label="已开班" value="已开班"></el-option>
            <el-option label="已毕业" value="已毕业"></el-option>
          </el-select>
        </el-form-item>
        <!-- 可以根据需要添加 Major Direction 字段 -->
         <el-form-item label="专业方向" prop="majorDirection">
          <el-input v-model="classForm.majorDirection" placeholder="请输入专业方向"></el-input>
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
    <el-dialog v-model="deleteDialogVisible" title="提示" width="30%" class="dark-dialog">
      <span>您确定要删除班级 "{{ currentClass?.className }}" 吗？</span>
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
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request' // 直接使用 request 实例

// --- API 定义 (如果没创建 API 文件) ---
const classApi = {
  getList: (params) => request.get('/classes', { params }),
  getById: (id) => request.get(`/classes/${id}`),
  add: (data) => request.post('/classes', data),
  update: (data) => request.put('/classes', data),
  delete: (id) => request.delete(`/classes/${id}`)
}
// --- ---

// 搜索表单
const searchForm = reactive({
  className: '',
  classStatus: '',
  startTimeStart: '',
  startTimeEnd: ''
})
const searchDateRange = ref([])

// 监听搜索日期范围变化
watch(searchDateRange, (val) => {
  searchForm.startTimeStart = (val && val[0]) || ''
  searchForm.startTimeEnd = (val && val[1]) || ''
})

// 列表数据
const classList = ref([])
const loading = ref(false)

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

// 对话框
const dialogVisible = ref(false)
const isEdit = ref(false)
const classFormRef = ref(null)
const classForm = reactive({
  id: '',
  className: '',
  classroom: '',
  majorDirection: '',
  startTime: '',
  graduateTime: '',
  classStatus: '',
  headTeacher: '',
  subject: ''
})

// 表单验证规则 (根据需要完善)
const rules = {
  className: [{ required: true, message: '请输入班级名称', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择开班时间', trigger: 'change' }],
  graduateTime: [{ required: true, message: '请选择毕业时间', trigger: 'change' }],
  classStatus: [{ required: true, message: '请选择状态', trigger: 'change' }],
  headTeacher: [{ required: true, message: '请输入班主任姓名', trigger: 'blur' }],
  subject: [{ required: true, message: '请输入学科', trigger: 'blur' }]
}

// 删除
const deleteDialogVisible = ref(false)
const currentClass = ref(null)

// --- 方法 ---

// 加载列表
const loadClassList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      className: searchForm.className || null,
      classStatus: searchForm.classStatus || null,
      startTimeStart: searchForm.startTimeStart || null,
      startTimeEnd: searchForm.startTimeEnd || null,
    }
    const res = await classApi.getList(params)
    if (res.code === 0) {
      classList.value = res.data?.rows || []
      pagination.total = res.data?.total || 0
    } else {
      ElMessage.error(res.msg || '获取班级列表失败')
    }
  } catch (error) {
    console.error('获取班级列表出错:', error)
    ElMessage.error('获取班级列表时发生错误')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadClassList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.className = ''
  searchForm.classStatus = ''
  searchForm.startTimeStart = ''
  searchForm.startTimeEnd = ''
  searchDateRange.value = []
  handleSearch()
}

// 分页大小改变
const handleSizeChange = (size) => {
  pagination.pageSize = size
  loadClassList()
}

// 页码改变
const handleCurrentChange = (page) => {
  pagination.page = page
  loadClassList()
}

// 新增
const handleAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

// 编辑
const handleEdit = async (row) => {
  isEdit.value = true
  resetForm() // 先清空
  try {
     // 从列表直接获取数据填充，如果需要更详细数据再调用 getById
     Object.assign(classForm, row);
     dialogVisible.value = true;
     /* // 或者调用API获取最新数据
    const res = await classApi.getById(row.id);
    if (res.code === 0 && res.data) {
      Object.assign(classForm, res.data);
      dialogVisible.value = true;
    } else {
      ElMessage.error(res.msg || '获取班级详情失败');
    }
    */
  } catch (error) {
    console.error('获取班级详情出错:', error);
    ElMessage.error('获取班级详情时发生错误');
  }
}


// 删除
const handleDelete = (row) => {
  currentClass.value = row
  deleteDialogVisible.value = true
}

// 确认删除
const confirmDelete = async () => {
  if (!currentClass.value) return
  try {
    const res = await classApi.delete(currentClass.value.id)
    if (res.code === 0) {
      ElMessage.success('删除成功')
      deleteDialogVisible.value = false
      loadClassList() // 重新加载列表
    } else {
      ElMessage.error(res.msg || '删除失败')
    }
  } catch (error) {
    console.error('删除班级出错:', error)
    ElMessage.error('删除班级时发生错误')
  }
}

// 提交表单 (新增/编辑)
const submitForm = async () => {
  if (!classFormRef.value) return
  await classFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        let res
        const dataToSend = { ...classForm } // 复制一份数据
        if (isEdit.value) {
          res = await classApi.update(dataToSend)
        } else {
          res = await classApi.add(dataToSend)
        }

        if (res.code === 0) {
          ElMessage.success(isEdit.value ? '修改成功' : '添加成功')
          dialogVisible.value = false
          loadClassList() // 重新加载列表
        } else {
          ElMessage.error(res.msg || (isEdit.value ? '修改失败' : '添加失败'))
        }
      } catch (error) {
        console.error('提交班级表单出错:', error)
        ElMessage.error('操作失败')
      }
    } else {
      console.log('表单验证失败')
      return false
    }
  })
}

// 重置表单
const resetForm = () => {
   if (classFormRef.value) {
    // 先清除验证状态
    classFormRef.value.clearValidate();
    // 注意：resetFields 可能不会完全清空所有字段，特别是 id
    // classFormRef.value.resetFields(); 
  }
  // 手动重置所有表单字段为初始/空值
  classForm.id = '';
  classForm.className = '';
  classForm.classroom = '';
  classForm.majorDirection = '';
  classForm.startTime = '';
  classForm.graduateTime = '';
  classForm.classStatus = ''; // 或者设置为 '未开班' 等默认值
  classForm.headTeacher = '';
  classForm.subject = '';
}

// 格式化日期时间
const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return '-'
  const date = new Date(dateTimeString)
  return date.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false }).replace(/\//g, '-')
}

// 组件挂载
onMounted(() => {
  loadClassList()
})

</script>

<style scoped>
/* Remove redundant .dark-theme rules if covered by global styles */
/* .dark-theme { ... } */
/* .dark-theme h2, .dark-theme h4 { ... } */

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
    margin: 0;
    font-size: 1.6em;
    color: var(--dark-text-primary);
}

/* Search Card Specifics */
.search-card .el-form-item {
  margin-bottom: 0;
}
.search-card :deep(.el-form-item__label) {
  color: var(--dark-text-secondary);
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
  background-color: var(--dark-bg-input) !important;
  color: var(--dark-text-primary) !important;
  border-bottom: 1px solid var(--dark-border-primary) !important;
}
.dark-table :deep(.el-table__row),
.dark-table :deep(.el-table__body tr) {
  background-color: var(--dark-bg-card) !important;
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
.dark-table :deep(td .cell) {
    color: var(--dark-text-primary);
}

/* Use CSS Variables for Input/Select/DatePicker */
:deep(.el-input__wrapper),
:deep(.el-select__wrapper),
:deep(.el-date-editor .el-input__wrapper) {
  background-color: var(--dark-bg-input);
  box-shadow: none !important;
  border: 1px solid var(--dark-border-primary);
  color: var(--dark-text-primary);
}
:deep(.el-input__wrapper.is-focus),
:deep(.el-select__wrapper.is-focused),
:deep(.el-date-editor .el-input__wrapper.is-focus) {
  border-color: var(--accent-color);
}
:deep(.el-input__inner),
:deep(.el-select__placeholder),
:deep(.el-select-v2__placeholder),
:deep(.el-date-editor .el-input__inner),
:deep(.el-select__selected-item span) {
  color: var(--dark-text-primary);
}
:deep(.el-input__inner::placeholder) {
  color: var(--dark-text-placeholder);
}
:deep(.el-select .el-input .el-select__caret),
:deep(.el-input__icon),
:deep(.el-date-editor .el-input__icon) {
  color: var(--dark-text-secondary);
}

/* Date Picker Popper */
.el-picker__popper {
    background-color: var(--dark-bg-card) !important;
    border: 1px solid var(--dark-border-primary) !important;
}
.el-picker__popper :deep(.el-date-picker__header-label),
.el-picker__popper :deep(.el-date-table th),
.el-picker__popper :deep(.el-date-table td .el-date-table-cell__text),
.el-picker__popper :deep(.el-picker-panel__icon-btn) {
    color: var(--dark-text-primary) !important;
}
.el-picker__popper :deep(.el-date-table td.prev-month .el-date-table-cell__text),
.el-picker__popper :deep(.el-date-table td.next-month .el-date-table-cell__text) {
    color: var(--dark-text-secondary) !important;
}
.el-picker__popper :deep(.el-date-table td.today .el-date-table-cell__text) {
    color: var(--accent-color) !important;
}
.el-picker__popper :deep(.el-date-table td.available:hover .el-date-table-cell__text) {
    color: var(--accent-color) !important;
}
.el-picker__popper :deep(.el-date-table td.current .el-date-table-cell__text) {
    background: var(--accent-color) !important;
    color: #fff !important;
}
.el-picker__popper :deep(.el-picker-panel__footer) {
    background-color: var(--dark-bg-input);
    border-top: 1px solid var(--dark-border-primary);
}

/* Use CSS Variables for Dialog */
.dark-dialog .el-dialog__header {
  background-color: var(--dark-bg-input);
  margin-right: 0;
  padding: 15px 20px;
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
  padding: 25px 20px;
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
.class-management-container {
  /* padding: 20px; // Remove if handled by app-content */
}
/* Adjust any specific layout needs here */
.search-card .el-select {
    width: 180px;
}
.search-card .el-date-editor {
    width: 200px;
}
.search-card .el-form-item {
    margin-right: 15px;
}
</style> 