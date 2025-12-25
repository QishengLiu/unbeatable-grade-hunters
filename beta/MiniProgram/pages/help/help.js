const { getTasks, request, acceptTask } = require('../../utils/api');

Page({
  data: {
    statusBarHeight: 0,
    categoryList: [
      { id: 'all', name: '全部' }
    ],
    activeCategory: 'all',

    // 2. Recommended Section
    recommendList: [],

    // 4. Main List (General Help / Task Assistance)
    currentTab: 'general', // 'general' or 'task' (Currently backend might not separate them, or we use status/type)
    // For now, I'll map backend records to displayList directly.
    displayList: [],
    loading: false,
    page: 1,
    size: 20,
    total: 0
  },

  onLoad() {
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight || 20
    });
    this.loadCategories();
    this.loadTasks();
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2
      })
    }
    this.loadTasks();
  },

  onPullDownRefresh() {
    this.setData({ page: 1, displayList: [] }, () => {
        this.loadTasks().then(() => {
            wx.stopPullDownRefresh();
        });
    });
  },

  loadCategories() {
    const { activeCategory } = this.data;
    request({
      url: '/api/public/categories',
      method: 'GET'
    }).then(res => {
      if (res.statusCode === 200 && res.data.code === 200) {
        const categories = res.data.data || [];
        const mapped = categories.map(item => ({
          id: item.categoryId,
          name: item.categoryName
        }));
        const finalList = [{ id: 'all', name: '全部' }].concat(mapped);
        let nextActive = activeCategory;
        if (!finalList.some(c => c.id === activeCategory)) {
          nextActive = 'all';
        }
        this.setData({
          categoryList: finalList,
          activeCategory: nextActive
        });
      } else {
        console.error('获取分类列表失败:', res);
      }
    }).catch(err => {
      console.error('获取分类列表异常:', err);
    });
  },

  loadTasks() {
      this.setData({ loading: true });
      const { page, size, activeCategory, currentTab } = this.data;
      const typeValue = currentTab === 'task' ? 'task' : 'normal';
      const query = {
          page,
          size,
          type: typeValue,
          status: 'open'
      };
      if (activeCategory !== 'all') {
          query.categoryId = activeCategory;
      }

      return getTasks(query).then(res => {
          if (res.statusCode === 200 && (res.data.code === 200 || res.data.code === 0)) {
              const data = res.data.data;
              const records = data.records || data || [];
              const total = data.total || records.length;

              const formattedList = records.map(item => {
                  const publisher = item.publisher || {};
                  return {
                      id: item.taskId || item.id,
                      title: item.title,
                      price: item.reward || item.price,
                      desc: item.description || item.content || item.title,
                      time: item.createdAt || item.createTime || item.time || '',
                      user: publisher.username || item.publisherName || item.username || '匿名用户',
                      avatar: publisher.avatarUrl || item.publisherAvatar || item.avatar || '/image/user_avatar.png',
                      status: item.status
                  };
              });

              const openList = formattedList.filter(item => item.status === 'open');

              const randomImages = [
                  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=60',
                  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=60',
                  'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=60',
                  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=60',
                  'https://images.unsplash.com/photo-1526045612212-70caf35c14df?auto=format&fit=crop&w=800&q=60'
              ];
              const shuffled = openList.slice().sort(() => Math.random() - 0.5);
              const picked = shuffled.slice(0, 2);
              const recommendList = picked.map((item, index) => {
                  return {
                      id: item.taskId || item.id,
                      title: item.title,
                      price: item.reward || item.price,
                      desc: item.description || item.content || item.title,
                      image: randomImages[index % randomImages.length],
                      isAccepted: false
                  };
              });

              this.setData({
                  displayList: openList,
                  recommendList,
                  total,
                  loading: false
              });
          } else {
              this.setData({ loading: false });
          }
      }).catch(() => {
          this.setData({ loading: false });
      });
  },

  onCategoryTap(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ activeCategory: id, page: 1 }, () => {
        this.loadTasks();
    });
    // Toast removed to be consistent
  },

  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab, page: 1 }, () => {
        this.loadTasks();
    });
    // Toast removed as per user request
  },

  onMainItemTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/task_detail/task_detail?id=${id}`
    });
  },

  onCreateTask() {
    wx.navigateTo({
      url: '/pages/postTask/index'
    });
  },

  onTakeOrder(e) {
    const id = e.currentTarget.dataset.id;
    const app = getApp();
    const userInfo = app.globalData.userInfo || wx.getStorageSync('userInfo');
    const userId = userInfo && (userInfo.userId || userInfo.id);

    if (!userId) {
      wx.showToast({
        title: '请先登录',
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
          acceptTask(id, userId).then(res => {
            wx.hideLoading();
            if (res.statusCode === 200 && (res.data.code === 200 || res.data.code === 0)) {
              const { recommendList, displayList } = this.data;
              const nextRecommend = recommendList.map(item => {
                if (item.id === id) {
                  return Object.assign({}, item, { isAccepted: true });
                }
                return item;
              });
              const nextDisplay = displayList.filter(item => item.id !== id);
              this.setData({
                recommendList: nextRecommend,
                displayList: nextDisplay
              });
              wx.showToast({
                title: '接单成功',
                icon: 'success'
              });
            } else {
              wx.showToast({
                title: res.data.message || '操作失败',
                icon: 'none'
              });
            }
          }).catch(() => {
            wx.hideLoading();
            wx.showToast({
              title: '网络错误',
              icon: 'none'
            });
          });
        }
      }
    });
  },

  onRecommendItemTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/task_detail/task_detail?id=${id}`
    });
  },

  onSearchTap() {
    wx.showToast({
      title: '搜索功能开发中',
      icon: 'none'
    });
  }
});
