<template>
  <div class="student-management-container dark-theme">
    <div class="header-section">
      <h2>学员管理</h2>
      <el-button type="primary" class="btn-primary" @click="handleAdd">+ 新增学员</el-button>
    </div>

    <!-- 搜索区域 -->
    <el-card shadow="hover" class="search-card dark-card">
      <el-form :model="searchForm" inline @submit.prevent="handleSearch">
        <el-form-item label="姓名">
          <el-input v-model="searchForm.name" placeholder="请输入姓名" clearable @clear="handleSearch"></el-input>
        </el-form-item>
        <el-form-item label="学号">
          <el-input v-model="searchForm.studentNumber" placeholder="请输入学号" clearable @clear="handleSearch"></el-input>
        </el-form-item>
        <el-form-item label="最高学历">
          <el-select v-model="searchForm.education" placeholder="请选择学历" clearable @change="handleSearch" style="width: 200px;">
            <!-- 根据实际情况添加学历选项 -->
            <el-option label="初中" value="初中"></el-option>
            <el-option label="高中" value="高中"></el-option>
            <el-option label="大专" value="大专"></el-option>
            <el-option label="本科" value="本科"></el-option>
            <el-option label="硕士" value="硕士"></el-option>
            <el-option label="博士" value="博士"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="所属班级">
          <el-select v-model="searchForm.classId" placeholder="请选择班级" clearable filterable @change="handleSearch">
             <el-option v-for="cls in classListForSelect" :key="cls.id" :label="cls.className" :value="cls.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="btn-primary" @click="handleSearch">查询</el-button>
          <el-button class="btn-secondary" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 学员列表 -->
    <el-card shadow="hover" class="list-card dark-card">
       <el-table :data="studentList" border style="width: 100%" v-loading="loading" class="dark-table">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="name" label="姓名" min-width="100" />
        <el-table-column prop="studentNumber" label="学号" min-width="120" />
        <el-table-column prop="className" label="班级" min-width="150" />
        <el-table-column prop="gender" label="性别" min-width="60" align="center">
          <template #default="scope">
            {{ scope.row.gender == 1 ? '男' : (scope.row.gender == 2 ? '女' : '未知') }}
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" min-width="120" />
        <el-table-column prop="education" label="最高学历" min-width="100" />
        <el-table-column prop="employmentStatus" label="就业状况" min-width="100" /> 
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

    <!-- 新增/编辑学员对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑学员' : '新增学员'"
      width="60%" 
      :close-on-click-modal="false"
      @close="resetForm"
      class="dark-dialog"
    >
      <el-form :model="studentForm" :rules="rules" ref="studentFormRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="studentForm.name" placeholder="请输入姓名"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
             <el-form-item label="学号" prop="studentNumber">
               <el-input v-model="studentForm.studentNumber" placeholder="请输入学号"></el-input>
             </el-form-item>
          </el-col>
        </el-row>
         <el-row :gutter="20">
          <el-col :span="12">
             <el-form-item label="性别" prop="gender">
                <el-radio-group v-model="studentForm.gender">
                  <el-radio label="男">男</el-radio>
                  <el-radio label="女">女</el-radio>
                </el-radio-group>
             </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="studentForm.phone" placeholder="请输入手机号" maxlength="11"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
             <el-form-item label="最高学历" prop="education">
               <el-select v-model="studentForm.education" placeholder="请选择学历" style="width: 100%;">
                 <el-option label="初中" value="初中"></el-option>
                 <el-option label="高中" value="高中"></el-option>
                 <el-option label="大专" value="大专"></el-option>
                 <el-option label="本科" value="本科"></el-option>
                 <el-option label="硕士" value="硕士"></el-option>
                 <el-option label="博士" value="博士"></el-option>
               </el-select>
             </el-form-item>
          </el-col>
           <el-col :span="12">
            <el-form-item label="所属班级" prop="classId">
               <el-select v-model="studentForm.classId" placeholder="请选择班级" filterable style="width: 100%;">
                 <el-option v-for="cls in classListForSelect" :key="cls.id" :label="cls.className" :value="cls.id"></el-option>
               </el-select>
             </el-form-item>
           </el-col>
         </el-row>
         <!-- 根据需要添加其他字段，例如 QQ, WeChat, ID Number, Address, Birthday, Graduate School, Major, Graduation Date, Employment Status -->
         <el-row :gutter="20">
           <el-col :span="12">
             <el-form-item label="QQ" prop="qq">
               <el-input v-model="studentForm.qq" placeholder="请输入QQ号"></el-input>
             </el-form-item>
           </el-col>
           <el-col :span="12">
             <el-form-item label="微信号" prop="wechat">
               <el-input v-model="studentForm.wechat" placeholder="请输入微信号"></el-input>
             </el-form-item>
           </el-col>
         </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="身份证号" prop="idNumber">
                <el-input v-model="studentForm.idNumber" placeholder="请输入身份证号" maxlength="18"></el-input>
              </el-form-item>
            </el-col>
             <el-col :span="12">
                <el-form-item label="生日" prop="birthday">
                  <el-date-picker v-model="studentForm.birthday" type="date" placeholder="选择生日" format="YYYY-MM-DD" value-format="YYYY-MM-DD" style="width: 100%;"></el-date-picker>
                </el-form-item>
             </el-col>
         </el-row>
         <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="地址" prop="address">
                <el-input type="textarea" v-model="studentForm.address" placeholder="请输入地址"></el-input>
              </el-form-item>
            </el-col>
         </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="毕业院校" prop="graduateSchool">
                <el-input v-model="studentForm.graduateSchool" placeholder="请输入毕业院校"></el-input>
              </el-form-item>
            </el-col>
             <el-col :span="12">
               <el-form-item label="专业" prop="major">
                 <el-input v-model="studentForm.major" placeholder="请输入专业"></el-input>
               </el-form-item>
             </el-col>
         </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
                <el-form-item label="毕业日期" prop="graduationDate">
                  <el-date-picker v-model="studentForm.graduationDate" type="date" placeholder="选择毕业日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD" style="width: 100%;"></el-date-picker>
                </el-form-item>
            </el-col>
            <el-col :span="12">
                <el-form-item label="就业状况" prop="employmentStatus">
                   <el-select v-model="studentForm.employmentStatus" placeholder="请选择就业状况" style="width: 100%;">
                     <el-option label="未就业" value="未就业"></el-option>
                     <el-option label="已就业" value="已就业"></el-option>
                     <el-option label="升学" value="升学"></el-option>
                     <el-option label="其他" value="其他"></el-option>
                   </el-select>
                 </el-form-item>
            </el-col>
          </el-row>

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
      <span>您确定要删除学员 "{{ currentStudent?.name }}" 吗？</span>
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
const studentApi = {
  getList: (params) => request.get('/students', { params }),
  getById: (id) => request.get(`/students/${id}`),
  add: (data) => request.post('/students', data),
  update: (data) => request.put('/students', data),
  delete: (id) => request.delete(`/students/${id}`)
}
// --- ---

// --- 班级 API (用于下拉列表) ---
const classApi = {
  getAllClasses: () => request.get('/classes', { params: { page: 1, pageSize: 1000 } })
}
// --- ---


// 搜索表单
const searchForm = reactive({
  name: '',
  studentNumber: '',
  education: '',
  classId: ''
})

// 列表数据
const studentList = ref([])
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
const studentFormRef = ref(null)
const studentForm = reactive({
  id: '',
  name: '',
  gender: '男', // 默认值
  studentNumber: '',
  phone: '',
  qq: '',
  wechat: '',
  idNumber: '',
  address: '',
  birthday: '',
  education: '',
  graduateSchool: '',
  major: '',
  graduationDate: '',
  employmentStatus: '未就业', // 默认值
  classId: ''
})

// 班级列表 (用于下拉选择)
const classListForSelect = ref([])

// 表单验证规则 (根据需要完善)
const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  studentNumber: [{ required: true, message: '请输入学号', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  phone: [
      { required: true, message: '请输入手机号', trigger: 'blur' },
      { pattern: /^1[3456789]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
    ],
  education: [{ required: true, message: '请选择最高学历', trigger: 'change' }],
  classId: [{ required: true, message: '请选择所属班级', trigger: 'change' }],
  // 其他字段按需添加验证规则
}

// 删除
const deleteDialogVisible = ref(false)
const currentStudent = ref(null)

// --- 方法 ---

// 加载班级列表 (用于下拉框)
const loadClassListForSelect = async () => {
  try {
    const res = await classApi.getAllClasses()
    if (res.code === 0) {
      classListForSelect.value = res.data?.rows || []
    } else {
      console.error('获取班级列表失败:', res.msg)
      // 下拉列表获取失败不强制弹窗提示
    }
  } catch (error) {
    console.error('获取班级列表出错:', error)
  }
}

// 加载学员列表
const loadStudentList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      name: searchForm.name || null,
      studentNumber: searchForm.studentNumber || null,
      education: searchForm.education || null,
      classId: searchForm.classId || null,
    }
    const res = await studentApi.getList(params)
    if (res.code === 0) {
      // 需要将 classId 转换为 className (如果后端没提供)
      const students = res.data?.rows || []
      students.forEach(student => {
          const cls = classListForSelect.value.find(c => c.id === student.classId);
          student.className = cls ? cls.className : '未知班级';
      });
      studentList.value = students
      pagination.total = res.data?.total || 0
    } else {
      ElMessage.error(res.msg || '获取学员列表失败')
    }
  } catch (error) {
    console.error('获取学员列表出错:', error)
    ElMessage.error('获取学员列表时发生错误')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadStudentList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.name = ''
  searchForm.studentNumber = ''
  searchForm.education = ''
  searchForm.classId = ''
  handleSearch()
}

// 分页大小改变
const handleSizeChange = (size) => {
  pagination.pageSize = size
  loadStudentList()
}

// 页码改变
const handleCurrentChange = (page) => {
  pagination.page = page
  loadStudentList()
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
     Object.assign(studentForm, row);
     // 确保 gender 是字符串 '男'/'女' 以匹配 el-radio
     studentForm.gender = row.gender === 1 ? '男' : '女'; 
     dialogVisible.value = true;
     /* // 或者调用API获取最新数据
    const res = await studentApi.getById(row.id);
    if (res.code === 0 && res.data) {
      Object.assign(studentForm, res.data);
      studentForm.gender = res.data.gender === 1 ? '男' : '女'; 
      dialogVisible.value = true;
    } else {
      ElMessage.error(res.msg || '获取学员详情失败');
    }
    */
  } catch (error) {
    console.error('获取学员详情出错:', error);
    ElMessage.error('获取学员详情时发生错误');
  }
}


// 删除
const handleDelete = (row) => {
  currentStudent.value = row
  deleteDialogVisible.value = true
}

// 确认删除
const confirmDelete = async () => {
  if (!currentStudent.value) return
  try {
    const res = await studentApi.delete(currentStudent.value.id)
    if (res.code === 0) {
      ElMessage.success('删除成功')
      deleteDialogVisible.value = false
      loadStudentList() // 重新加载列表
    } else {
      ElMessage.error(res.msg || '删除失败')
    }
  } catch (error) {
    console.error('删除学员出错:', error)
    ElMessage.error('删除学员时发生错误')
  }
}

// 提交表单 (新增/编辑)
const submitForm = async () => {
  if (!studentFormRef.value) return
  await studentFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        let res
        // 复制并转换 gender 回数字 (如果后端需要)
        const dataToSend = { 
            ...studentForm, 
            gender: studentForm.gender === '男' ? 1 : 2 // 假设后端需要 1/2
        }; 
        
        if (isEdit.value) {
          res = await studentApi.update(dataToSend)
        } else {
          res = await studentApi.add(dataToSend)
        }

        if (res.code === 0) {
          ElMessage.success(isEdit.value ? '修改成功' : '添加成功')
          dialogVisible.value = false
          loadStudentList() // 重新加载列表
        } else {
          // 处理学号已存在等后端业务错误
           ElMessage.error(res.msg || (isEdit.value ? '修改失败' : '添加失败'))
        }
      } catch (error) {
        console.error('提交学员表单出错:', error)
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
   if (studentFormRef.value) {
    // 先清除验证状态
    studentFormRef.value.clearValidate();
    // 注意：resetFields 可能不会完全清空所有字段，特别是 id
    // studentFormRef.value.resetFields(); 
  }
  // 手动重置所有表单字段为初始/空值
  studentForm.id = '';
  studentForm.name = '';
  studentForm.gender = '男'; // 重置为默认值
  studentForm.studentNumber = '';
  studentForm.phone = '';
  studentForm.qq = '';
  studentForm.wechat = '';
  studentForm.idNumber = '';
  studentForm.address = '';
  studentForm.birthday = '';
  studentForm.education = '';
  studentForm.graduateSchool = '';
  studentForm.major = '';
  studentForm.graduationDate = '';
  studentForm.employmentStatus = '未就业'; // 重置为默认值
  studentForm.classId = '';
}

// 格式化日期时间
const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return '-'
  const date = new Date(dateTimeString)
  return date.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false }).replace(/\//g, '-')
}

// 组件挂载
onMounted(async () => {
  await loadClassListForSelect() // 先加载班级列表
  await loadStudentList() // 再加载学员列表
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
.student-management-container {
  /* padding: 20px; // Remove if handled by app-content */
}
/* Adjust any specific layout needs here */
.search-card .el-select {
    width: 180px;
}
.search-card .el-form-item {
    margin-right: 15px;
}
</style> 