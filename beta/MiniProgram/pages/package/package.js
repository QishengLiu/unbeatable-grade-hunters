
Page({
  data: {
    orderId: null,
    orderDetails: {
      title: '图书馆紧急文件',
      price: '200 以太币',
      date: '2025年11月20日',
      note: '关于考研的相关材料，需要送到计算机与大数据学院第3-207',
      publisher: {
        name: '刘',
        avatar: '/images/publisher-avatar.png',
        helpCount: 291
      }
    },
    // 添加地图相关数据
    markers: [
      {
        id: 1,
        longitude: 113.324520,
        latitude: 23.102290,
        title: '起点',
        iconPath: '/images/marker_start.png',
        width: 30,
        height: 30,
        callout: {
          content: '起点',
          display: 'BYCLICK'
        }
      },
      {
        id: 2,
        longitude: 113.327820,
        latitude: 23.104290,
        title: '终点',
        iconPath: '/images/marker_end.png',
        width: 30,
        height: 30,
        callout: {
          content: '终点',
          display: 'BYCLICK'
        }
      }
    ],
    // 添加路线数据
    polyline: [
      {
        points: [
          {
            longitude: 113.324520,
            latitude: 23.102290
          },
          {
            longitude: 113.326020,
            latitude: 23.103090
          },
          {
            longitude: 113.327820,
            latitude: 23.104290
          }
        ],
        color: '#1e88e5',
        width: 4,
        dottedLine: false
      }
    ]
  },

  onLoad(options) {
    if (options.id) {
      this.setData({
        orderId: options.id
      })
      // 实际应用中，这里可以根据orderId从服务器获取订单详情
    }
  },

  // 地图初始化完成后的回调函数
  onReady() {
    // 获取地图上下文
    this.mapCtx = wx.createMapContext('myMap');
  },
  
  // 地图点击事件
  onMapTap() {
    // 地图点击时可以隐藏标记点的气泡
    this.mapCtx.hideCallout();
  },
  
  // 地图标记点击事件
  onMarkerTap(e) {
    console.log('点击了标记点', e.markerId);
    // 可以根据标记点ID进行相应的操作
  },
  
  // 显示地图控件（如需要）
  showMapControls() {
    this.mapCtx.showControls();
  },
  
  // 隐藏地图控件（如需要）
  hideMapControls() {
    this.mapCtx.hideControls();
  },
  
  // 获取当前地图中心点坐标
  getMapCenter() {
    this.mapCtx.getCenterLocation({
      success: (res) => {
        console.log('地图中心点坐标：', res);
      }
    });
  },
  
  // 缩放地图
  zoomMap(e) {
    const scale = e.detail.scale;
    console.log('地图缩放级别：', scale);
  },
  
  // 移动地图
  moveMap(e) {
    console.log('地图移动事件触发');
  },
  
  // 定位到当前位置
  locateToMyPosition() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        const latitude = res.latitude;
        const longitude = res.longitude;
        this.setData({
          longitude: longitude,
          latitude: latitude
        });
        // 移动地图中心到当前位置
        this.mapCtx.moveToLocation();
      },
      fail: () => {
        wx.showToast({
          title: '获取位置信息失败',
          icon: 'none'
        });
      }
    });
  },

  // 返回到上一页
  handleBack() {
    wx.navigateBack({
      delta: 1,
    })
  },

  // 了解更多按钮点击事件
  handleLearnMore() {
    wx.showToast({
      title: '获取更多信息',
      icon: 'none'
    })
  },

  // 接受任务按钮点击事件
  handleAcceptTask() {
    wx.showModal({
      title: '确认接受',
      content: '您确定要接受这个任务吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '处理中',
          })
          
          // 模拟网络请求延迟
          setTimeout(() => {
            wx.hideLoading()
            wx.showToast({
              title: '任务接受成功',
              icon: 'success'
            })
            
            // 延迟返回上一页
            setTimeout(() => {
              wx.navigateBack({
                delta: 1
              })
            }, 1500)
          }, 1000)
        }
      }
    })
  }
})