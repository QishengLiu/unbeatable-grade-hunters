const { getTaskDetail, acceptTask } = require('../../utils/api');

Page({
  data: {
    task: {},
    mapLatitude: 26.05,
    mapLongitude: 119.19,
    markers: [{
      id: 1,
      latitude: 26.05,
      longitude: 119.19,
      iconPath: 'https://img.icons8.com/color/48/000000/marker.png',
      width: 30,
      height: 30
    }],
    statusBarHeight: 20,
    isMine: false,
    isPublisher: false
  },

  onLoad(options) {
    const systemInfo = wx.getSystemInfoSync();
    const baseData = {
      statusBarHeight: systemInfo.statusBarHeight || 20
    };
    if (options.isMine === 'true') {
      baseData.isMine = true;
      baseData.isPublisher = true;
    }
    this.setData(baseData);
    if (options.id) {
      this.loadTask(options.id);
    }
  },

  loadTask(id) {
        getTaskDetail(id).then(res => {
        if (res.statusCode === 200 && (res.data.code === 200 || res.data.code === 0)) {
            const data = res.data.data || {};
            const app = getApp();
            const currentUser = app.globalData.userInfo || {}; 
            const publisher = data.publisher || {};

            let latitude = Number(data.latitude);
            let longitude = Number(data.longitude);

            if (!latitude || isNaN(latitude)) {
                latitude = 26.05;
            }
            if (!longitude || isNaN(longitude)) {
                longitude = 119.19;
            }

            const task = {
                id: data.taskId,
                category: '其他',
                date: data.createdAt || data.createTime,
                sameCategoryCount: 0,
                title: data.title,
                price: data.reward ? `${data.reward}元` : '',
                description: data.description,
                location: data.location,
                contactInfo: data.contactInfo,
                deadline: data.deadline,
                latitude,
                longitude,
                publisher: {
                    avatar: publisher.avatarUrl || '/image/user_avatar.png',
                    nickname: publisher.username,
                    level: '',
                    activity: ''
                },
                publisherId: publisher.userId,
                status: data.status
            };

            const currentUserId = currentUser.userId || currentUser.id;
            const isPublisher = currentUserId && task.publisherId && task.publisherId === currentUserId;

            this.setData({
                task: task,
                mapLatitude: latitude,
                mapLongitude: longitude,
                markers: [{
                  id: 1,
                  latitude,
                  longitude,
                  iconPath: 'https://img.icons8.com/color/48/000000/marker.png',
                  width: 30,
                  height: 30
                }],
                isMine: isPublisher || this.data.isMine,
                isPublisher: isPublisher || this.data.isPublisher
            });
        }
    }).catch(err => {
        console.error(err);
        wx.showToast({ title: '加载失败', icon: 'none' });
    });
  },

  onBack() {
    wx.navigateBack();
  },

  onConsult() {
    wx.navigateTo({
      url: '/pages/chat/chat'
    });
  },

  onAccept() {
    const taskId = this.data.task.id;
    if (!taskId) {
        wx.showToast({
            title: '任务信息加载中或无效',
            icon: 'none'
        });
        return;
    }

    const app = getApp();
    const userInfo = app.globalData.userInfo;
    const userId = userInfo && (userInfo.userId || userInfo.id);

    if (!userId) {
        wx.showToast({
            title: '请先登录',
            icon: 'none'
        });
        return;
    }

    if (this.data.task.publisherId === userId) {
        wx.showToast({
            title: '不能接受自己发布的任务',
            icon: 'none'
        });
        return;
    }
    
    wx.showModal({
      title: '确认接单',
      content: '接单后请按时完成任务，是否确认？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中...' });
          
          acceptTask(taskId, userId).then(res => {
            wx.hideLoading();
            if (res.statusCode === 200 && (res.data.code === 200 || res.data.code === 0)) {
              wx.showToast({
                title: '接单成功',
                icon: 'success'
              });
              
              // Refresh task detail locally or just set status
              this.setData({
                'task.status': 'ongoing',
                isMine: false // Still not mine (published by me), but I am accepter
              });

              setTimeout(() => {
                 wx.navigateBack();
              }, 1500);
            } else {
              wx.showToast({
                title: res.data.message || '接单失败',
                icon: 'none'
              });
            }
          }).catch(err => {
            wx.hideLoading();
            console.error('Accept task failed', err);
            wx.showToast({
              title: '网络错误',
              icon: 'none'
            });
          });
        }
      }
    });
  }
})
