// 移除错误的require导入语句，微信小程序不需要这样的导入
Page({
  data: {
    phone: '',
    code: '',
    counting: false,
    countdown: 60,
    loading: false
  },

  // 手机号输入
  bindPhoneInput(e) {
    this.setData({
      phone: e.detail.value
    })
  },

  // 验证码输入
  bindCodeInput(e) {
    this.setData({
      code: e.detail.value
    })
  },

  // 发送验证码
  sendCode() {
    const { phone } = this.data
    
    // 简单的手机号验证
    if (!phone || phone.length !== 11) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      })
      return
    }
    
    // 开始倒计时
    this.setData({
      counting: true
    })
    
    const timer = setInterval(() => {
      let { countdown } = this.data
      countdown--
      
      if (countdown <= 0) {
        clearInterval(timer)
        this.setData({
          counting: false,
          countdown: 60
        })
      } else {
        this.setData({
          countdown
        })
      }
    }, 1000)
    
    wx.showToast({
      title: '验证码已发送',
      icon: 'none'
    })
  },

  // 处理点击继续按钮，直接跳转到首页
  handleLogin() {
    // 直接跳转到首页
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  // 返回登录页面
  backToAccountLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    })
  }
})