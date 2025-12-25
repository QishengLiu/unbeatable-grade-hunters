Page({
  data: {
    currentPage: 2,
    totalPages: 2,
    selectedOptions: [],
    options: [
      { id: "delivery", label: "代取快递" },
      { id: "campus-info", label: "了解校园资讯" },
      { id: "schedule", label: "查看课表" },
      { id: "classroom", label: "预约教室" },
      { id: "dorm", label: "宿舍服务" },
      { id: "social", label: "认识朋友" },
      { id: "beta", label: "体验软件" },
      { id: "beta", label: "交易二手书" },
    ],
    progressPercentage: 50,
  },

  handleContinue() {
    wx.setStorage({
      key: "userPurposes",
      data: this.data.selectedOptions,
    })
    wx.redirectTo({
      url: "/pages/login/login",
    })
  },

  toggleOption(event) {
    const { option } = event.currentTarget.dataset
    const selectedSet = new Set(this.data.selectedOptions)

    if (selectedSet.has(option)) {
      selectedSet.delete(option)
    } else {
      selectedSet.add(option)
    }

    this.setData({
      selectedOptions: Array.from(selectedSet),
    })
  },

  onLoad() {
    this.updateProgress()
  },

  updateProgress() {
    const percentage = Math.round(
      (this.data.currentPage / this.data.totalPages) * 100
    )
    this.setData({ progressPercentage: percentage })
  },
})
