const { register } = require('../../utils/api')

Page({
  data: {
    studentId: "",
    phone: "",
    password: "",
    confirmPassword: "",
    showPassword: false,
    showConfirmPassword: false,
    agreedToTerms: false,
    loading: false,
  },

  bindStudentIdInput(e) {
    this.setData({
      studentId: e.detail.value,
    })
  },

  bindPhoneInput(e) {
    this.setData({
      phone: e.detail.value,
    })
  },

  bindPasswordInput(e) {
    this.setData({
      password: e.detail.value,
    })
  },

  bindConfirmPasswordInput(e) {
    this.setData({
      confirmPassword: e.detail.value,
    })
  },

  togglePasswordVisibility() {
    this.setData({
      showPassword: !this.data.showPassword,
    })
  },

  toggleConfirmPasswordVisibility() {
    this.setData({
      showConfirmPassword: !this.data.showConfirmPassword,
    })
  },

  handleAgreementChange(e) {
    console.log('协议勾选状态变化:', e.detail.value); // 添加调试日志
    this.setData({
      agreedToTerms: e.detail.value.length > 0 // checkbox-group返回的是选中项value的数组
    })
  },

  // 手机号格式验证函数
  isValidPhone(phone) {
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  },

  handleRegister() {
    const { studentId, phone, password, confirmPassword, agreedToTerms } = this.data;
    
    console.log('注册时协议勾选状态:', agreedToTerms); // 添加调试日志

    // 表单验证
    if (!studentId) {
      wx.showToast({
        title: "请输入学号",
        icon: "none",
      });
      return;
    }

    if (!phone) {
      wx.showToast({
        title: "请输入手机号",
        icon: "none",
      });
      return;
    }

    // 添加手机号格式验证
    if (!this.isValidPhone(phone)) {
      wx.showToast({
        title: "请输入正确的手机号",
        icon: "none",
      });
      return;
    }

    if (!password) {
      wx.showToast({
        title: "请输入密码",
        icon: "none",
      });
      return;
    }

    if (password !== confirmPassword) {
      wx.showToast({
        title: "两次输入的密码不一致",
        icon: "none",
      });
      return;
    }

    if (!agreedToTerms) {
      wx.showToast({
        title: "请同意用户协议",
        icon: "none",
      });
      return;
    }

    this.setData({ loading: true });

    // 调用注册接口
    register({
      studentId: studentId,
      phone: phone,
      password: password,
      role: 'student', // 添加角色参数
      avatar: '/image/默认头像.jpg' // 设置默认头像
    }).then(res => {
      this.setData({ loading: false });
      
      if (res.statusCode === 200 && res.data.code === 200) {
        // 注册成功
        wx.showToast({
          title: "注册成功",
          icon: "success",
        });
        
        // 延迟跳转到登录页
        setTimeout(() => {
          wx.redirectTo({
            url: "/pages/login/login",
          });
        }, 1500);
      } else {
        // 注册失败
        wx.showToast({
          title: res.data.message || "注册失败",
          icon: "none",
        });
      }
    }).catch(err => {
      this.setData({ loading: false });
      wx.showToast({
        title: "网络请求失败",
        icon: "none",
      });
      console.error('Register error:', err);
    });
  },

  goToLogin() {
    wx.navigateBack({
      fail: () => {
        wx.redirectTo({
          url: "/pages/login/login",
        });
      },
    });
  },
  
  // 协议和隐私政策链接处理函数
  viewTerms() {
    wx.showToast({
      title: '查看用户协议',
      icon: 'none'
    });
  },
  
  viewPrivacy() {
    wx.showToast({
      title: '查看隐私政策',
      icon: 'none'
    });
  }
});