const { getFavorites, cancelFavorite } = require('../../utils/api')

Page({
  data: {
    statusBarHeight: 0,
    favorites: [],
    loading: false,
    page: 1,
    size: 10,
    hasMore: true
  },

  onLoad() {
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight
    });
    this.loadFavorites(true);
  },

  onPullDownRefresh() {
    this.loadFavorites(true);
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadFavorites(false);
    }
  },

  handleBack() {
    wx.navigateBack({
      delta: 1
    });
  },

  loadFavorites(isRefresh) {
    if (this.data.loading) return;

    const nextPage = isRefresh ? 1 : this.data.page;

    this.setData({ loading: true });

    getFavorites({
      page: nextPage,
      size: this.data.size
    }).then(res => {
      if (res.statusCode === 200 && (res.data.code === 200 || res.data.code === 0)) {
        const data = res.data.data || {};
        const records = data.records || [];

        const list = records.map(item => {
          const createdAt = item.createdAt || '';
          let timeDisplay = createdAt;
          if (createdAt && createdAt.indexOf('T') !== -1) {
            timeDisplay = createdAt.substring(0, 16).replace('T', ' ');
          }

          return {
            favoriteId: item.favoriteId || item.id,
            postId: item.postId,
            title: item.postTitle || item.title || '未命名帖子',
            author: item.postAuthor || item.author || '匿名用户',
            time: timeDisplay,
            cover: item.coverImage || (item.images && item.images[0]) || '/image/user_avatar.png'
          };
        });

        const newList = isRefresh ? list : this.data.favorites.concat(list);
        const hasMore = data.hasNext !== undefined ? data.hasNext : (list.length === this.data.size);

        this.setData({
          favorites: newList,
          loading: false,
          page: nextPage + 1,
          hasMore
        });
      } else {
        this.setData({ loading: false });
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        });
      }
    }).catch(() => {
      this.setData({ loading: false });
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }).finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  viewDetail(e) {
    const postId = e.currentTarget.dataset.postId;
    if (!postId) return;
    wx.navigateTo({
      url: `/pages/post_detail/post_detail?postId=${postId}`
    });
  },

  cancelFavorite(e) {
    const favoriteId = e.currentTarget.dataset.id;
    if (!favoriteId) return;
    wx.showModal({
      title: '取消收藏',
      content: '确定不再收藏该内容吗？',
      success: (res) => {
        if (res.confirm) {
          cancelFavorite(favoriteId).then(resp => {
            if (resp.statusCode === 200 && (resp.data.code === 200 || resp.data.code === 0)) {
              const list = this.data.favorites.filter(item => String(item.favoriteId) !== String(favoriteId));
              this.setData({ favorites: list });
              wx.showToast({
                title: '已取消收藏',
                icon: 'success'
              });
            } else {
              wx.showToast({
                title: resp.data.message || '取消失败',
                icon: 'none'
              });
            }
          }).catch(() => {
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
