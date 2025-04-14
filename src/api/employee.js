import request from '@/utils/request'

// 员工管理相关接口
export const empApi = {
  // 获取员工列表
  getEmpList(params) {
    return request({
      url: '/emps',
      method: 'get',
      params
    })
  },
  
  // 根据ID获取员工
  getEmpById(id) {
    return request({
      url: `/emps/${id}`,
      method: 'get'
    })
  },
  
  // 添加员工
  addEmp(data) {
    return request({
      url: '/emps',
      method: 'post',
      data
    })
  },
  
  // 修改员工
  updateEmp(data) {
    // 在这里可以做一些数据格式化
    // 确保工作经历数据格式正确
    if (data.exprList && Array.isArray(data.exprList)) {
      // 过滤掉空的工作经历
      data.exprList = data.exprList.filter(exp => 
        exp.company || exp.position || exp.startDate || exp.endDate
      )
      
      // 确保日期格式正确
      data.exprList.forEach(exp => {
        if (exp.startDate && typeof exp.startDate === 'object') {
          exp.startDate = exp.startDate.toISOString().split('T')[0]
        }
        if (exp.endDate && typeof exp.endDate === 'object') {
          exp.endDate = exp.endDate.toISOString().split('T')[0]
        }
      })
    }
    
    console.log('发送更新员工请求，数据:', JSON.stringify(data, null, 2))
    
    return request({
      url: '/emps',
      method: 'put',
      data
    })
  },
  
  // 删除员工
  deleteEmp(ids) {
    return request({
      url: `/emps?ids=${ids}`,
      method: 'delete'
    })
  }
} 