// utils/api.js
const BASE_URL = 'http://localhost:8081'

/**
 * 封装网络请求方法
 * @param {Object} options 请求参数
 */
function request(options) {
  const app = getApp()
  const { url, method, data, header = {} } = options
  
  console.log('准备发送请求:', { url, method, data, header, BASE_URL })
  
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
      url: `${BASE_URL}${url}`,
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

module.exports = {
  request,
  login,
  register,
  getUserProfile
}