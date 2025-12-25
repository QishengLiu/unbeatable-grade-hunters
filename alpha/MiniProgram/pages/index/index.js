// pages/index/index.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    currentTime: '9:41',
    locationName: '福州大学（旗山校区）',
    bannerTitle: '福州大学学习中心',
    bannerSubtitle: '全新开放',
    bannerImage: '/image/明德楼.png',
    quickStartItems: [
      { icon: '/image/活动安排.png', title: '活动安排' },
      { icon: '/image/周边优惠.png', title: '周边优惠' },
      { icon: '/image/订单查询.png', title: '订单查询' },
      { icon: '/image/学生认证.png', title: '学生认证' }
    ],
    activities: [
      {
        id: 1,
        title: '2025年度校园秋招专栏',
        image: '/image/福大2.jpg',
        distance: '1.0 km',
        viewers: 4362
      },
      {
        id: 2,
        title: '2026年毕业季系列活动',
        image: '/image/福大1.jpg',
        distance: '500 m',
        viewers: 506
      }
    ],
    navItems: [
      { icon: '🏠', label: '首页', active: true },
      { icon: '💬', label: '动态', active: false },
      { icon: '⚡', label: '互动', active: false },
      { icon: '👤', label: '我的', active: false }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.updateTime();
    // 每秒更新时间
    this.timeInterval = setInterval(() => {
      this.updateTime();
    }, 1000);
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  },

  /**
   * 更新时间
   */
  updateTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    this.setData({
      currentTime: `${hours}:${minutes}`
    });
  },

  /**
   * 位置卡片点击事件
   */
  onLocationTap() {
    wx.showToast({
      title: '获取位置信息',
      icon: 'none'
    });
    // 可以调用 wx.getLocation 获取当前位置
  },

  /**
   * 搜索栏点击事件
   */
  onSearchTap() {
    wx.showToast({
      title: '跳转到搜索页面',
      icon: 'none'
    });
    // 可以跳转到搜索页面
    // wx.navigateTo({
    //   url: '/pages/search/search'
    // });
  },

  /**
   * 筛选按钮点击事件
   */
  onFilterTap(e) {
    e.stopPropagation(); // 阻止事件冒泡
    wx.showToast({
      title: '打开筛选',
      icon: 'none'
    });
  },

  // 导航到动态页面
  goToSocial() {
    wx.switchTab({
      url: '/pages/social/social'
    });
  },

  // 导航到互助页面
  goToHelp() {
    wx.switchTab({
      url: '/pages/help/help'
    });
  },

  // 修复goToProfile方法，使用switchTab替代navigateTo
  goToProfile() {
    wx.switchTab({
      url: '/pages/profile/profile'
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    // 可以在这里刷新数据
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    // 可以在这里加载更多数据
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '福州大学学习中心',
      path: '/pages/index/index'
    };
  }
});