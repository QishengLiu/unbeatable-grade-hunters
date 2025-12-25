const { getUserProfile } = require('../../utils/api')

Page({
  data: {
    userInfo: {
      username: "Amiya",
      role: "Arknights",
      avatar: "/images/avatar.png",
      stats: {
        posts: 100,
        reposts: 120,
        following: 10,
        followers: 64,
      },
    },
    shortcuts: [
      { type: "collect", label: "我的收藏", icon: "/image/我的收藏.png" },
      { type: "history", label: "历史记录", icon: "/image/历史记录.png" },
      { type: "mall", label: "以太商城", icon: "/image/以太商城.png" },
      { type: "audit", label: "内容审核", icon: "/image/内容审核.png" },
    ],
  },

  onLoad() {
    // 页面加载时获取用户信息
    this.loadUserProfile()
  },

  // 获取用户个人信息
  loadUserProfile() {
    getUserProfile()
      .then(res => {
        if (res.statusCode === 200 && res.data.code === 200) {
          const profileData = res.data.data
          
          // 更新用户信息，只更新头像和用户名
          this.setData({
            'userInfo.username': profileData.username || this.data.userInfo.username,
            'userInfo.avatar': profileData.avatarUrl || this.data.userInfo.avatar
          })
        } else {
          console.error('获取用户信息失败:', res)
          wx.showToast({
            title: '获取用户信息失败',
            icon: 'none'
          })
        }
      })
      .catch(err => {
        console.error('获取用户信息异常:', err)
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        })
      })
  },

  handleManagement(e) {
    const type = e.currentTarget.dataset.type
    const titles = {
      collect: "我的收藏",
      history: "历史记录",
      mall: "以太商城",
      audit: "内容审核",
    }
    wx.showToast({
      title: `进入${titles[type]}`,
      icon: "none",
    })
  },

  goToSettings() {
    wx.navigateTo({
      url: "/pages/setting/setting",
    })
  },

  goToIndex() {
    wx.switchTab({
      url: "/pages/index/index",
      fail: () => {
        wx.redirectTo({
          url: "/pages/index/index",
        })
      },
    })
  },

  // 导航到动态页面
  goToSocial() {
    wx.switchTab({
      url: '/pages/social/social'
    })
  },

  // 导航到互助页面
  goToHelp() {
    wx.switchTab({
      url: '/pages/help/help'
    })
  }
})