const { request } = require('../../utils/api')

Page({
  data: {
    activeCategory: null,
    categories: [],
    postList: [],
    loading: false,
    currentPage: 1,
    pageSize: 10,
    total: 0,
    hasMore: true,
    keyword: '' // 添加搜索关键词
  },

  onLoad() {
    // 加载真实分类数据
    this.loadCategories()
    // 加载帖子列表
    this.loadPosts()
  },

  // 加载分类数据
  loadCategories() {
    request({
      url: '/api/public/categories',
      method: 'GET'
    }).then(res => {
      if (res.statusCode === 200 && res.data.code === 200) {
        // 添加"全部"分类作为第一个选项
        const categories = [{ categoryId: 0, categoryName: '全部' }, ...res.data.data];
        this.setData({
          categories: categories,
          activeCategory: categories[0] // 默认选中第一个分类（全部）
        });
      } else {
        console.error('获取分类列表失败:', res);
        // 如果获取失败，使用默认分类
        this.setData({
          categories: [
            { categoryId: 0, categoryName: '全部' },
            { categoryId: 1, categoryName: '二手交易' },
            { categoryId: 2, categoryName: '代拿服务' },
            { categoryId: 3, categoryName: '拼车出行' },
            { categoryId: 4, categoryName: '其他' }
          ],
          activeCategory: { categoryId: 0, categoryName: '全部' }
        });
      }
    }).catch(err => {
      console.error('获取分类列表异常:', err);
      // 如果请求异常，使用默认分类
      this.setData({
        categories: [
          { categoryId: 0, categoryName: '全部' },
          { categoryId: 1, categoryName: '二手交易' },
          { categoryId: 2, categoryName: '代拿服务' },
          { categoryId: 3, categoryName: '拼车出行' },
          { categoryId: 4, categoryName: '其他' }
        ],
        activeCategory: { categoryId: 0, categoryName: '全部' }
      });
    });
  },

  // 加载帖子列表
  loadPosts() {
    this.setData({ loading: true });
    
    const params = {
      page: this.data.currentPage,
      size: this.data.pageSize
    };
    
    // 如果不是"全部"分类，则添加分类筛选
    if (this.data.activeCategory && this.data.activeCategory.categoryId !== 0) {
      params.categoryId = this.data.activeCategory.categoryId;
    }
    
    // 如果有搜索关键词，则添加关键词参数
    if (this.data.keyword) {
      params.keyword = this.data.keyword;
    }
    
    request({
      url: '/api/student/posts',
      method: 'GET',
      data: params
    }).then(res => {
      this.setData({ loading: false });
      
      if (res.statusCode === 200 && res.data.code === 200) {
        const postData = res.data.data;
        const newPosts = postData.records;
        
        // 格式化时间显示
        const formattedPosts = newPosts.map(post => {
          return {
            ...post,
            createdAt: this.formatTime(post.createdAt)
          };
        });
        
        this.setData({
          postList: formattedPosts,
          total: postData.total,
          hasMore: postData.hasNextPage
        });
      } else {
        console.error('获取帖子列表失败:', res);
        wx.showToast({
          title: '获取帖子失败',
          icon: 'none'
        });
      }
    }).catch(err => {
      this.setData({ loading: false });
      console.error('获取帖子列表异常:', err);
      wx.showToast({
        title: '网络请求失败',
        icon: 'none'
      });
    });
  },

  // 格式化时间显示
  formatTime(isoTime) {
    if (!isoTime) return '';
    
    const date = new Date(isoTime);
    const now = new Date();
    
    // 计算时间差（毫秒）
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffDays > 0) {
      return `${diffDays}天前`;
    } else if (diffHours > 0) {
      return `${diffHours}小时前`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}分钟前`;
    } else {
      return '刚刚';
    }
  },

  // 分类标签点击事件
  handleCategoryTap(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({
      activeCategory: category,
      currentPage: 1, // 重置页码
      postList: [] // 清空现有列表
    });
    
    // 重新加载帖子列表
    this.loadPosts();
  },

  // 搜索关键词输入事件
  onKeywordInput(e) {
    this.setData({
      keyword: e.detail.value
    });
  },

  // 搜索确认事件（回车或点击完成）
  onSearchConfirm(e) {
    this.setData({
      keyword: e.detail.value,
      currentPage: 1, // 重置页码
      postList: [] // 清空现有列表
    });
    
    // 重新加载帖子列表
    this.loadPosts();
  },

  // 清除搜索关键词
  clearKeyword() {
    this.setData({
      keyword: '',
      currentPage: 1, // 重置页码
      postList: [] // 清空现有列表
    });
    
    // 重新加载帖子列表
    this.loadPosts();
  }
})