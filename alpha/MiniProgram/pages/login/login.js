const { login } = require('../../utils/api')

Page({
  data: {
    statusTime: "09:41",
    phone: "",
    password: "",
    showPassword: false,
    loading: false,
  },

  onLoad() {
    this.updateStatusTime()
    this.timeTimer = setInterval(() => {
      this.updateStatusTime()
    }, 60 * 1000)
  },

  onUnload() {
    if (this.timeTimer) {
      clearInterval(this.timeTimer)
    }
  },

  updateStatusTime() {
    const now = new Date()
    const hours = now.getHours().toString().padStart(2, "0")
    const minutes = now.getMinutes().toString().padStart(2, "0")
    this.setData({
      statusTime: `${hours}:${minutes}`,
    })
  },

  bindPhoneInput(e) {
    this.setData({
      phone: e.detail.value.trim(),
    })
  },

  bindPasswordInput(e) {
    this.setData({
      password: e.detail.value,
    })
  },

  togglePasswordVisibility() {
    this.setData({
      showPassword: !this.data.showPassword,
    })
  },

  handleForgotPassword() {
    wx.navigateTo({
      url: "/pages/forget/forget",
    })
  },

  handleLogin() {
    const { phone, password } = this.data

    if (!phone) {
      wx.showToast({
        title: "请输入手机号或学号",
        icon: "none",
      })
      return
    }

    if (!password) {
      wx.showToast({
        title: "请输入密码",
        icon: "none",
      })
      return
    }

    this.setData({ loading: true })

    // 调用登录接口
    const app = getApp()
    console.log('准备发送登录请求，学号:', phone, '密码:', password)
    login(phone, password, 'student')
      .then(res => {
        console.log('收到响应:', res)
        this.setData({ loading: false })
        
        if (res.statusCode === 200 && res.data.code === 200) {
          // 登录成功
          const { accessToken, user } = res.data.data
          
          // 保存accessToken到全局变量和本地存储
          app.globalData.accessToken = accessToken
          app.globalData.userInfo = user
          wx.setStorageSync('accessToken', accessToken)
          
          wx.showToast({
            title: "登录成功",
            icon: "success",
          })
          
          // 跳转到首页
          wx.switchTab({
            url: "/pages/index/index",
            fail: () => {
              wx.redirectTo({
                url: "/pages/index/index",
              })
            },
          })
        } else {
          // 登录失败
          wx.showToast({
            title: res.data.message || "登录失败",
            icon: "none",
          })
        }
      })
      .catch(err => {
        this.setData({ loading: false })
        console.error('Login error:', err)
        wx.showToast({
          title: "网络请求失败",
          icon: "none",
        })
      })
  },

  goToSignup() {
    wx.navigateTo({
      url: "/pages/register/register",
    })
  },

  loginByWechat() {
    wx.showToast({
      title: "微信登录",
      icon: "none",
    })
  },

  loginByQQ() {
    wx.showToast({
      title: "QQ登录",
      icon: "none",
    })
  },

  loginByEmail() {
    wx.showToast({
      title: "邮箱登录",
      icon: "none",
    })
  },
})