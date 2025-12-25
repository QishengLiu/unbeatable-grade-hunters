Page({
  data: {
    currentTab: 0, // 0: 普通互助, 1: 任务模块
    ordinaryHelp: [
      {
        id: 1,
        title: '求借微积分课本',
        role: '提供者',
        status: '已完成',
        statusClass: 'status-completed',
        completedTime: '2025-12-05 18:00'
      },
      {
        id: 2,
        title: '急需一把雨伞',
        role: '志愿者',
        status: '已送达',
        statusClass: 'status-completed',
        completedTime: '2025-12-01 12:30'
      }
    ],
    moneyHelp: [
      {
        id: 101,
        title: '代取北门快递',
        price: '8',
        status: '已完成',
        statusClass: 'status-completed',
        completedTime: '2025-12-10 10:00'
      },
      {
        id: 102,
        title: '帮修自行车链条',
        price: '20',
        status: '已到账',
        statusClass: 'status-paid',
        completedTime: '2025-12-08 15:45'
      }
    ]
  },

  onLoad() {
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight
    });
  },

  handleBack() {
    wx.navigateBack({
      delta: 1
    });
  },

  switchTab(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    this.setData({
      currentTab: index
    });
  },

  viewDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.showToast({
      title: '查看帮助详情: ' + id,
      icon: 'none'
    });
  }
})