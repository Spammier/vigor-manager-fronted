import request from '@/utils/request'

// 部门管理相关接口
export const deptApi = {
  // 获取部门列表
  getDeptList() {
    return request({
      url: '/depts',
      method: 'get'
    })
  },
  
  // 根据ID获取部门
  getDeptById(id) {
    return request({
      url: `/depts/${id}`,
      method: 'get'
    })
  },
  
  // 添加部门
  addDept(data) {
    return request({
      url: '/depts',
      method: 'post',
      data
    })
  },
  
  // 修改部门
  updateDept(data) {
    return request({
      url: '/depts',
      method: 'put',
      data
    })
  },
  
  // 删除部门
  deleteDept(id) {
    return request({
      url: `/depts/${id}`,
      method: 'delete'
    })
  }
} 