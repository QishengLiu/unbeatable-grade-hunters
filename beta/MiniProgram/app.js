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
    this.globalData.baseUrl = wx.getStorageSync('BASE_URL') || 'http://localhost:8080'
    this.globalData.userInfo = wx.getStorageSync('userInfo') || null

    // If token exists, fetch user profile to populate userInfo
    if (this.globalData.accessToken) {
        const { getUserProfile } = require('./utils/api');
        getUserProfile().then(res => {
            if (res.statusCode === 200 && (res.data.code === 200 || res.data.code === 0)) {
                this.globalData.userInfo = res.data.data;
                wx.setStorageSync('userInfo', res.data.data); // Update local storage
            }
        }).catch(err => {
            console.error('Failed to fetch user profile on launch', err);
        });
    }
  },
  
  globalData: {
    userInfo: null,
    accessToken: null,
    baseUrl: null,
    // Mock Data for Tasks
    tasks: [
      { id: 301, type: 'general', category: 'express', title: '西门取快递', desc: '小件物品，求带', price: '2', time: '10分钟前', user: 'UserA', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=60', status: 'pending', publisherId: 'UserA', accepterId: null, createTime: 1731112000000 },
      { id: 302, type: 'general', category: 'takeout', title: '二食堂打包炒饭', desc: '送到图书馆', price: '5', time: '15分钟前', user: 'UserB', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=100&q=60', status: 'pending', publisherId: 'UserB', accepterId: null, createTime: 1731111000000 },
      { id: 303, type: 'general', category: 'other', title: '求借充电宝', desc: '教学楼201', price: '3', time: '20分钟前', user: 'UserC', avatar: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&w=100&q=60', status: 'pending', publisherId: 'UserC', accepterId: null, createTime: 1731110000000 },
      { id: 401, type: 'task', category: 'other', title: '帮忙搬宿舍', desc: '从一区搬到三区，有电梯', price: '15', time: '1小时前', user: 'UserD', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=60', status: 'pending', publisherId: 'UserD', accepterId: null, createTime: 1731100000000 },
      { id: 402, type: 'task', category: 'other', title: '代跑腿买药', desc: '校医院到生活区', price: '10', time: '2小时前', user: 'UserE', avatar: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=100&q=60', status: 'pending', publisherId: 'UserE', accepterId: null, createTime: 1731090000000 }
    ],
    currentUser: {
      id: 'me',
      name: '我'
    }
  },
  
  // 封装网络请求方法
  request: request
})
