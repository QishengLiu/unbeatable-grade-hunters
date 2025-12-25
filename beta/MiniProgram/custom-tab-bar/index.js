Component({
  data: {
    selected: 0,
    list: [
      {
        pagePath: "/pages/index/index",
        text: "首页",
        iconPath: "https://img.icons8.com/fluency-systems-regular/48/999999/home.png",
        selectedIconPath: "https://img.icons8.com/fluency-systems-filled/48/3578E5/home.png"
      },
      {
        pagePath: "/pages/social/social",
        text: "动态",
        iconPath: "https://img.icons8.com/fluency-systems-regular/48/999999/speech-bubble--v1.png",
        selectedIconPath: "https://img.icons8.com/fluency-systems-filled/48/3578E5/speech-bubble--v1.png"
      },
      {
        pagePath: "/pages/help/help",
        text: "互助",
        iconPath: "https://img.icons8.com/fluency-systems-regular/48/999999/handshake.png",
        selectedIconPath: "https://img.icons8.com/fluency-systems-filled/48/3578E5/handshake.png"
      },
      {
        pagePath: "/pages/profile/profile",
        text: "我的",
        iconPath: "https://img.icons8.com/fluency-systems-regular/48/999999/user.png",
        selectedIconPath: "https://img.icons8.com/fluency-systems-filled/48/3578E5/user.png"
      }
    ]
  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      const url = data.path
      
      if (url.includes('post_create')) {
        wx.navigateTo({ url })
      } else {
        wx.switchTab({ url })
      }
    }
  }
})