const { getTasks, cancelTask: cancelTaskApi, giveUpTask } = require('../../utils/api');

Page({
  data: {
    pageTitle: '我发布的任务',
    currentType: '', // ongoing_tasks, ongoing_help, completed
    currentTab: 'general', // general, task (Only for completed)
    displayList: [],
    statusBarHeight: 0
  },

  onLoad(options) {
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight || 20,
      currentType: options.type || 'my_tasks' // Changed default
    });
    
    this.updateTitle();
  },

  onShow() {
    this.loadTasks();
  },

  updateTitle() {
    let title = '我发布的任务';
    if (this.data.currentType === 'my_help') title = '我承接的任务';
    if (this.data.currentType === 'completed') title = '已完成';
    
    this.setData({ pageTitle: title });
  },

  loadTasks() {
    const app = getApp();
    let userInfo = app.globalData.userInfo || wx.getStorageSync('userInfo');
    
    // If we have userInfo, proceed
    if (userInfo && (userInfo.userId || userInfo.id)) {
        // Ensure globalData is synced
        if (!app.globalData.userInfo) {
            app.globalData.userInfo = userInfo;
        }
        const myId = userInfo.userId || userInfo.id;
        this._fetchTasks(myId);
        return;
    }
    
    // If no userInfo, but we have token, fetch profile first
    if (app.globalData.accessToken || wx.getStorageSync('accessToken')) {
        wx.showLoading({ title: '同步用户信息...' });
        const { getUserProfile } = require('../../utils/api');
        getUserProfile().then(res => {
            wx.hideLoading();
            if (res.statusCode === 200 && (res.data.code === 200 || res.data.code === 0)) {
                const user = res.data.data;
                app.globalData.userInfo = user;
                wx.setStorageSync('userInfo', user);
                const myId = user.userId || user.id;
                this._fetchTasks(myId);
            } else {
                wx.showToast({ title: '请先登录', icon: 'none' });
            }
        }).catch(() => {
            wx.hideLoading();
            wx.showToast({ title: '请先登录', icon: 'none' });
        });
        return;
    }
    
    wx.showToast({ title: '请先登录', icon: 'none' });
  },

  _fetchTasks(myId) {
    const { currentType, currentTab } = this.data;
    
    let query = { page: 1, size: 20 }; // Basic pagination

    if (currentType === 'my_tasks') {
      query.publisherId = myId;
    } else if (currentType === 'my_help') {
      query.accepterId = myId;
      query.status = 'in_progress';
      if (currentTab) {
        const typeValue = currentTab === 'general' ? 'normal' : 'task';
        query.type = typeValue;
      }
    } else if (currentType === 'completed') {
      // Completed (my published tasks)
      query.status = 'completed';
      query.publisherId = myId;
      if (currentTab) {
        const typeValue = currentTab === 'general' ? 'normal' : 'task';
        query.type = typeValue;
      }
    }

    wx.showLoading({ title: '加载中...' });
    
    getTasks(query).then(res => {
        wx.hideLoading();
        if (res.statusCode === 200 && (res.data.code === 200 || res.data.code === 0)) {
            let tasks = res.data.data.records || res.data.data || [];
            tasks = tasks.map(t => ({
                id: t.taskId || t.id,
                type: t.type || 'general',
                category: t.category,
                title: t.title,
                desc: t.description || t.content || '',
                price: t.reward,
                time: t.createdAt || t.createTime || t.time,
                user: (t.publisher && t.publisher.username) || t.publisherName || '',
                avatar: (t.publisher && t.publisher.avatarUrl) || t.publisherAvatar || '/image/user_avatar.png',
                status: t.status,
                publisherId: (t.publisher && t.publisher.userId) || t.publisherId,
                accepterId: (t.assignee && t.assignee.userId) || t.accepterId
            }));

            // Strict Client-side Filtering to ensure data accuracy
            if (currentType === 'my_tasks') {
                // 1. Must be published by me
                // 2. Must not be completed or cancelled (Ongoing only)
                tasks = tasks.filter(t => 
                    String(t.publisherId) === String(myId) && 
                    t.status !== 'completed' && 
                    t.status !== 'cancelled'
                );
            } else if (currentType === 'my_help') {
                tasks = tasks.filter(t => 
                    String(t.accepterId) === String(myId) && 
                    t.status === 'in_progress'
                );
            }
            
            // Note: If API already filtered by type (for my_help/completed), no need to filter again here.
            // But we can keep it as a safety check or remove it.
            if (currentType !== 'my_tasks' && currentTab && !query.type) {
                 tasks = tasks.filter(t => t.type === currentTab);
            }

            this.setData({ displayList: tasks });
        }
    }).catch(err => {
        wx.hideLoading();
        console.error('Load tasks failed', err);
        wx.showToast({ title: '加载失败', icon: 'none' });
    });
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab }, () => {
      this.loadTasks();
    });
  },

  handleBack() {
    wx.navigateBack();
  },

  viewDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/task_detail/task_detail?id=${id}&isMine=true` });
  },
  
  // Cancel Task (Only for My Tasks - Publisher)
  cancelTask(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确定要取消该任务吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '提交中...' });
          cancelTaskApi(id).then(res => {
            wx.hideLoading();
            if (res.statusCode === 200 && (res.data.code === 200 || res.data.code === 0)) {
              wx.showToast({ title: '任务已取消', icon: 'success' });
              this.loadTasks();
            } else {
              wx.showToast({
                title: res.data.message || '操作失败',
                icon: 'none'
              });
            }
          }).catch(err => {
            wx.hideLoading();
            console.error('Cancel task failed', err);
            wx.showToast({
              title: '网络错误',
              icon: 'none'
            });
          });
        }
      }
    });
  },

  // Cancel Help Task (For My Help - Accepter)
  cancelHelpTask(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确定要放弃该任务吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中...' });
          giveUpTask(id).then(res => {
            wx.hideLoading();
            if (res.statusCode === 200 && (res.data.code === 200 || res.data.code === 0)) {
              wx.showToast({ title: '已放弃任务', icon: 'success' });
              this.loadTasks();
            } else {
              wx.showToast({
                title: res.data.message || '操作失败',
                icon: 'none'
              });
            }
          }).catch(err => {
            wx.hideLoading();
            console.error('Cancel help task failed', err);
            wx.showToast({
              title: '网络错误',
              icon: 'none'
            });
          });
        }
      }
    });
  },

  goToPostTask() {}
})
