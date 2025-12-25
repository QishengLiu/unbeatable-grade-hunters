const { getUserProfile, getTasks } = require('../../utils/api')

Page({
  data: {
    userInfo: {
      username: "加载中...",
      role: "学生",
      avatar: "/image/默认头像.jpg", // Default avatar
      creditScore: 0,
      creditLevel: 'C',
      stats: {
        myTasks: 0,
        myHelp: 0,
        ongoing: 0,
        completed: 0
      },
    },
    taskManagementItems: [
      { type: "my_tasks", label: "我发布的任务", icon: "/image/订单查询.png" },
      { type: "my_help", label: "我承接的任务", icon: "/image/互助.png" }
    ],
    shortcuts: [
      { type: "my_posts", label: "我的动态", icon: "/image/动态.png", desc: "我发布的动态" },
      { type: "favorites", label: "我的收藏", icon: "/image/我的收藏.png", desc: "动态与帖子" },
      { type: "settings", label: "设置中心", icon: "/image/设置2.png" },
      { type: "feedback", label: "意见反馈", icon: "/image/历史记录.png" },
    ],
  },

  onLoad() {
    this.loadUserProfile();
  },

  onShow() {
    this.loadUserProfile();
    this.refreshStats();
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 3
      })
    }
  },

  loadUserProfile() {
    getUserProfile().then(res => {
      if (res.statusCode === 200 && (res.data.code === 200 || res.data.code === 0)) {
        const userData = res.data.data;
        this.setData({
          'userInfo.username': userData.username || userData.name || '微信用户',
          'userInfo.avatar': userData.avatarUrl || userData.avatar || '/image/默认头像.jpg',
          'userInfo.role': userData.role || '学生',
          'userInfo.creditScore': userData.creditScore || 100,
          'userInfo.creditLevel': this.calculateCreditLevel(userData.creditScore || 100)
        });
        
        const app = getApp();
        app.globalData.userInfo = { ...(app.globalData.userInfo || {}), ...userData };
      }
    }).catch(err => {
      console.error('Failed to load user profile:', err);
    });
  },

  calculateCreditLevel(score) {
    if (score >= 90) return 'S';
    if (score >= 80) return 'A';
    if (score >= 60) return 'B';
    return 'C';
  },

  refreshStats() {
    // We need to fetch counts from backend.
    // Since we don't have a dedicated stats API, we'll use getTasks with filters.
    // Assumption: Backend supports filtering by 'publisherId' and 'accepterId' via query params,
    // or we might need to rely on what we can get.
    // If backend only supports 'type' and 'category', we might be limited.
    // However, let's try to pass 'publisherId' and 'accepterId' as query params.
    
    const app = getApp();
    const myId = app.globalData.userInfo ? app.globalData.userInfo.id : null;
    
    if (!myId) return; // Wait until we have user ID

    // 1. My Tasks: Published by me
    const p1 = getTasks({ publisherId: myId, page: 1, size: 1 });
    
    // 2. My Help: Accepted by me
    const p2 = getTasks({ accepterId: myId, page: 1, size: 1 });
    
    // 3. Ongoing: Status 'ongoing' (related to me)
    // This is tricky if we can't filter by multiple fields (e.g. (publisher=me OR accepter=me) AND status=ongoing).
    // For now, let's just sum up "My Tasks (Ongoing)" + "My Help (Ongoing)".
    const p3_1 = getTasks({ publisherId: myId, status: 'ongoing', page: 1, size: 1 });
    const p3_2 = getTasks({ accepterId: myId, status: 'ongoing', page: 1, size: 1 });

    // 4. Completed: Status 'completed' (related to me)
    const p4_1 = getTasks({ publisherId: myId, status: 'completed', page: 1, size: 1 });
    const p4_2 = getTasks({ accepterId: myId, status: 'completed', page: 1, size: 1 });

    Promise.all([p1, p2, p3_1, p3_2, p4_1, p4_2]).then(results => {
        const getTotal = (res) => {
            if (res.statusCode === 200 && (res.data.code === 200 || res.data.code === 0)) {
                return res.data.data.total || 0;
            }
            return 0;
        };

        const myTasksCount = getTotal(results[0]);
        const myHelpCount = getTotal(results[1]);
        const ongoingCount = getTotal(results[2]) + getTotal(results[3]);
        const completedCount = getTotal(results[4]) + getTotal(results[5]);

        this.setData({
            'userInfo.stats.myTasks': myTasksCount,
            'userInfo.stats.myHelp': myHelpCount,
            'userInfo.stats.ongoing': ongoingCount,
            'userInfo.stats.completed': completedCount
        });
    }).catch(err => {
        console.error('Failed to load stats', err);
    });
  },

  handleManagement(e) {
    const type = e.currentTarget.dataset.type
    
    if (type === 'my_tasks') {
      // Changed: My Tasks -> I accepted (ongoing)
      // Requirement: "我接到的任务应该显示在“我的”功能中的我的帮助上面，而不是我的任务。"
      // Correction based on user input:
      // User said: "我接到的任务应该显示在“我的”功能中的我的帮助上面，而不是我的任务。"
      // Let's re-read carefully.
      // "1. 我接到的任务应该显示在“我的”功能中的我的帮助上面，而不是我的任务。"
      // This means:
      // My Help (我的帮助) = Tasks I accepted (I am helping others)
      // My Tasks (我的任务) = Tasks I published (My requests)
      
      // Let's swap the logic in refreshStats first, then here.
      // Wait, let's keep the variable names consistent but swap the logic.
      
      wx.navigateTo({ url: '/pages/my_tasks/my_tasks?type=my_tasks' }) // 'my_tasks' logic will be updated
      return
    }

    if (type === 'my_help') {
      wx.navigateTo({ url: '/pages/my_tasks/my_tasks?type=my_help' }) // 'my_help' logic will be updated
      return
    }

    if (type === 'my_posts') {
      wx.navigateTo({ url: '/pages/my_posts/my_posts' })
      return
    }

    if (type === 'favorites') {
      wx.navigateTo({ url: '/pages/favorites/favorites' })
      return
    }
    
    if (type === 'completed') {
      wx.navigateTo({ url: '/pages/my_tasks/my_tasks?type=completed' })
      return
    }

    if (type === 'settings') {
      wx.navigateTo({ url: '/pages/setting/setting' })
      return
    }

    wx.showToast({
      title: `进入${type}`,
      icon: "none",
    })
  },

  handleQuickAction(e) {
    const action = e.currentTarget.dataset.action;
    if (action === 'edit') {
       wx.navigateTo({ url: '/pages/setting/setting' });
    } else {
       wx.showToast({ title: '功能开发中', icon: 'none' });
    }
  },

  goToIndex() {
    wx.switchTab({
      url: "/pages/index/index",
      fail: () => {
        wx.redirectTo({
          url: "/pages/index/index",
        })
      },
    })
  },

  // 导航到动态页面
  goToSocial() {
    wx.switchTab({
      url: '/pages/social/social'
    })
  },

  // 导航到互助页面
  goToHelp() {
    wx.switchTab({
      url: '/pages/help/help'
    })
  }
})
