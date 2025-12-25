// utils/api.js
const DEFAULT_BASE_URL = 'http://localhost:8080'

function getBaseUrl() {
  const app = getApp()
  const stored = wx.getStorageSync('BASE_URL')
  const global = app && app.globalData && app.globalData.baseUrl
  return global || stored || DEFAULT_BASE_URL
}

/**
 * 封装网络请求方法
 * @param {Object} options 请求参数
 */
function request(options) {
  const app = getApp()
  const { url, method, data, header = {} } = options
  
  console.log('准备发送请求:', { url, method, data, header, baseUrl: getBaseUrl() })
  
  // 如果有accessToken，则添加到请求头
  if (app.globalData.accessToken) {
    header['Authorization'] = `Bearer ${app.globalData.accessToken}`
  }
  
  // 设置默认Content-Type
  if (!header['Content-Type']) {
    header['Content-Type'] = 'application/json'
  }
  
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${getBaseUrl()}${url}`,
      method,
      data,
      header,
      success: (res) => {
        console.log('请求成功，收到响应:', res)
        // 如果返回401未授权，则清除token
        if (res.statusCode === 401) {
          app.globalData.accessToken = null
          wx.removeStorageSync('accessToken')
        }
        resolve(res)
      },
      fail: (err) => {
        console.error('请求失败:', err)
        reject(err)
      }
    })
  })
}

/**
 * 用户登录
 * @param {String} studentId 学号
 * @param {String} password 密码
 * @param {String} role 角色
 */
function login(studentId, password, role = 'student') {
  return request({
    url: '/api/public/login',
    method: 'POST',
    data: {
      studentId,
      password,
      role
    }
  })
}

/**
 * 用户注册
 * @param {Object} userData 用户注册信息
 */
function register(userData) {
  // 添加默认角色
  const data = {
    ...userData,
    role: userData.role || 'student'
  };
  
  return request({
    url: '/api/public/register',
    method: 'POST',
    data
  })
}

/**
 * 获取用户个人信息
 */
function getUserProfile() {
  return request({
    url: '/api/student/profile',
    method: 'GET'
  })
}

/**
 * 更新用户个人信息
 * @param {Object} data 用户信息 (nickname, avatar, password, etc.)
 */
function updateUserProfile(data) {
  return request({
    url: '/api/student/profile',
    method: 'PUT',
    data
  })
}

/**
 * 创建任务
 * @param {Object} data 任务数据
 */
function createTask(data) {
  return request({
    url: '/api/student/tasks',
    method: 'POST',
    data
  })
}

/**
 * 获取任务列表
 * @param {Object} query 查询参数
 */
function getTasks(query) {
  return request({
    url: '/api/student/tasks',
    method: 'GET',
    data: query
  })
}

/**
 * 获取任务详情
 * @param {String} taskId 任务ID
 */
function getTaskDetail(taskId) {
  return request({
    url: `/api/student/tasks/${taskId}`,
    method: 'GET'
  })
}

/**
 * 接受任务
 * @param {String} taskId 任务ID
 * @param {String} userId 用户ID (可选，如果后端需要)
 */
function acceptTask(taskId, userId) {
  const data = userId ? { accepterId: userId } : {};
  return request({
    url: `/api/student/tasks/${taskId}/accept`,
    method: 'POST',
    data: userId ? { accepterId: userId } : undefined,
  })
}

function completeTask(taskId) {
  return request({
    url: `/api/student/tasks/${taskId}/complete`,
    method: 'POST'
  })
}

function cancelTask(taskId) {
  return request({
    url: `/api/student/tasks/${taskId}/cancel`,
    method: 'POST'
  })
}

function giveUpTask(taskId) {
  return request({
    url: `/api/student/tasks/${taskId}/giveup`,
    method: 'POST'
  })
}

function uploadToOSS(filePath) {
  const app = getApp()
  const header = {}
  if (app.globalData && app.globalData.accessToken) {
    header['Authorization'] = `Bearer ${app.globalData.accessToken}`
  }
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: `${getBaseUrl()}/api/public/oss/upload`,
      filePath,
      name: 'file',
      header,
      success(res) {
        try {
          const data = JSON.parse(res.data)
          resolve(data)
        } catch (e) {
          reject(e)
        }
      },
      fail(err) {
        reject(err)
      }
    })
  })
}

function togglePostFavorite(postId) {
  return request({
    url: `/api/student/posts/${postId}/favorite`,
    method: 'POST'
  })
}

function cancelFavorite(favoriteId) {
  return request({
    url: `/api/student/favorites/${favoriteId}`,
    method: 'DELETE'
  })
}

function getFavorites(query) {
  return request({
    url: '/api/student/favorites',
    method: 'GET',
    data: query
  })
}

module.exports = {
  request,
  login,
  register,
  getUserProfile,
  updateUserProfile,
  createTask,
  getTasks,
  getTaskDetail,
  acceptTask,
  completeTask,
  cancelTask,
  giveUpTask,
  togglePostFavorite,
  getFavorites,
  cancelFavorite,
  uploadToOSS
}
