Page({
  data: {
    userInfo: {
      username: "Amiya",
      role: "Arknights",
      avatar: "/images/avatar.png",
    },
    baseUrl: ''
  },

  onShow() {
    const app = getApp()
    const userInfo = app.globalData.userInfo || {};
    this.setData({
      userInfo: {
          username: userInfo.username || userInfo.nickName || '未登录用户',
          role: userInfo.role || '用户',
          avatar: userInfo.avatarUrl || userInfo.avatar || '/image/user_avatar.png'
      }
    });
  },

  onLoad() {
    const app = getApp()
    const stored = wx.getStorageSync('BASE_URL')
    const initial = stored || (app.globalData && app.globalData.baseUrl) || 'http://localhost:8080'
    this.setData({ baseUrl: initial })
  },

  handleSettings(e) {
    const type = e.currentTarget.dataset.type
    if (type === 'profile') {
      wx.navigateTo({
        url: '/pages/profile_edit/index'
      })
    } else {
      wx.showToast({
        title: `进入${type}设置`,
        icon: "none",
      })
    }
  },

  onBaseUrlInput(e) {
    this.setData({ baseUrl: e.detail.value })
  },

  saveBaseUrl() {
    const url = (this.data.baseUrl || '').trim()
    if (!url) {
      wx.showToast({ title: '请输入后端地址', icon: 'none' })
      return
    }
    try {
      wx.setStorageSync('BASE_URL', url)
      const app = getApp()
      if (app && app.globalData) {
        app.globalData.baseUrl = url
      }
      wx.showToast({ title: '已保存后端地址', icon: 'success' })
    } catch (e) {
      wx.showToast({ title: '保存失败', icon: 'none' })
    }
  },

  handleLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // Clear user session
          wx.removeStorageSync('token');
          const app = getApp();
          if (app && app.globalData) {
            app.globalData.currentUser = null;
          }
          
          // Redirect to login page
          wx.reLaunch({
            url: '/pages/login/login'
          });
        }
      }
    });
  },

  goBackToProfile() {
    wx.navigateBack({
      delta: 1,
      fail: () => {
        wx.redirectTo({
          url: "/pages/profile/profile",
        })
      },
    })
  },
})
