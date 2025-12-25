// pages/index/index.js
const app = getApp()

Page({
  data: {
    // Remove currentTime as it's not needed
    activeCategoryId: null, // Track selected category
    
    // Banner Data
    banner: {
      title: "未来校园 · 智联生活",
      subtitle: "AetherNet 2.0 全新上线",
      image: "/image/福大1.jpg" // Local image
    },

    // Category Grid
    categories: [
      { 
        id: 'help', 
        name: '互助广场', 
        icon: 'https://img.icons8.com/fluency-systems-regular/48/5B8CFF/handshake.png',
        path: '/pages/help/help'
      },
      { 
        id: 'nav', 
        name: '学习中心', 
        icon: 'https://img.icons8.com/fluency-systems-regular/48/6A5BFF/compass.png',
        path: '/pages/package/package' 
      },
      { 
        id: 'social', 
        name: '动态广场', 
        icon: 'https://img.icons8.com/fluency-systems-regular/48/5B8CFF/speech-bubble--v1.png',
        path: '/pages/social/social' 
      },
      { 
        id: 'profile', 
        name: '个人中心', 
        icon: 'https://img.icons8.com/fluency-systems-regular/48/6A5BFF/user.png',
        path: '/pages/profile/profile' 
      }
    ],

    // Recommended Feed
    recommendations: [
      {
        id: 1,
        title: "2025 秋季校园招聘会全攻略",
        desc: "涵盖 500+ 企业，简历投递技巧分享...",
        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80", // Abstract Tech
        likes: 1240,
        comments: 58
      },
      {
        id: 2,
        title: "图书馆新馆开馆时间调整通知",
        desc: "请各位同学注意闭馆时间变化...",
        image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=600&q=80", // Abstract Minimal
        likes: 856,
        comments: 32
      },
      {
        id: 3,
        title: "计算机学院“互联网+”大赛启动",
        desc: "报名截止日期及参赛要求详解",
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80", // Abstract Chip/Tech
        likes: 2103,
        comments: 145
      },
      {
        id: 4,
        title: "二手书交易市集 - 周末场",
        desc: "教材、小说、考研资料低价流转",
        image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=600&q=80", // Abstract Gradient
        likes: 672,
        comments: 89
      }
    ],

    // Custom Tab Bar Data
  },

  onLoad(options) {
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight || 20
    });
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      })
    }
  },
  
  onHide() {
    this.setData({ activeCategoryId: null });
  },

  // Navigation Handlers
  onCategoryTap(e) {
    const path = e.currentTarget.dataset.path;
    const id = e.currentTarget.dataset.id;
    
    // Update active state
    this.setData({ activeCategoryId: id });

    // Feature check for Learning Center
    if (id === 'nav') {
      wx.showToast({
        title: '功能还在开发',
        icon: 'none'
      });
      return;
    }

    if (path) {
      if (path.includes('social') || path.includes('help') || path.includes('profile')) {
        wx.switchTab({ url: path });
      } else {
        wx.navigateTo({ url: path });
      }
    }
  },

  onCardTap(e) {
    // Navigate to detail
    wx.navigateTo({
      url: '/pages/post_detail/post_detail'
    });
  }
});