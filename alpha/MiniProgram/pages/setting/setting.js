Page({
  data: {
    userInfo: {
      username: "Amiya",
      role: "Arknights",
      avatar: "/images/avatar.png",
    },
  },

  handleSettings(e) {
    const type = e.currentTarget.dataset.type
    wx.showToast({
      title: `进入${type}设置`,
      icon: "none",
    })
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
