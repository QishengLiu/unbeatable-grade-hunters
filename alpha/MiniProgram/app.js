const { request } = require('./utils/api')

// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    
    // 初始化全局数据
    this.globalData.accessToken = wx.getStorageSync('accessToken') || null
  },
  
  globalData: {
    userInfo: null,
    accessToken: null
  },
  
  // 封装网络请求方法
  request: request
})