const { request } = require('../../utils/api');

const formatCount = (count) => {
  if (count >= 10000) {
    return (count / 10000).toFixed(1).replace(/\.0$/, "") + "w";
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return `${count}`;
};

const decorateComment = (comment) => ({
  ...comment,
  likesDisplay: formatCount(comment.likeCount || 0),
  replyDisplay: formatCount(comment.replyCount || 0)
});

Page({
  data: {
    assets: {
      like: "https://img.icons8.com/ios/50/999999/like--v1.png",
      likeActive: "https://img.icons8.com/ios-filled/50/ff4d6d/like.png",
      likeOutline: "https://img.icons8.com/ios/50/999999/like--v1.png",
      commentGray: "https://img.icons8.com/ios/50/9ea0a7/speech-bubble.png",
      back: "https://img.icons8.com/ios-filled/50/1f1f1f/less-than.png"
    },
    parentComment: null, // 被回复的评论
    replies: [], // 回复列表
    loading: false,
    page: 1,
    pageSize: 10,
    hasMore: true,
    commentId: null // 当前评论ID
  },

  onLoad(options) {
    const commentId = options.commentId;
    if (commentId) {
      this.setData({ commentId: parseInt(commentId) });
      this.loadParentComment(commentId);
      this.loadReplies(commentId);
    }
  },

  // 加载被回复的评论
  loadParentComment(commentId) {
    request({
      url: `/api/student/comments/${commentId}`,
      method: 'GET'
    }).then(res => {
      if (res.statusCode === 200 && res.data.code === 200) {
        const parent = res.data.data;
        if (parent) {
          const decoratedParent = decorateComment(parent);
          this.setData({ parentComment: decoratedParent });
        }
      }
    }).catch(err => {
      console.error('获取父评论失败:', err);
    });
  },

  // 加载回复列表
  loadReplies(commentId) {
    if (!this.data.hasMore && this.data.page > 1) return;

    this.setData({ loading: true });

    request({
      url: `/api/student/comments/${commentId}/replies`,
      method: 'GET',
      data: {
        page: this.data.page,
        size: this.data.pageSize,
        sortBy: 'createdAt',
        order: 'desc' // 按时间倒序排列，最新的在前
      }
    }).then(res => {
      this.setData({ loading: false });

      if (res.statusCode === 200 && res.data.code === 200) {
        const replyData = res.data.data;
        
        const newReplies = replyData.records.map(reply => ({
          id: reply.commentId,
          name: reply.user.username || reply.user.nickName || '未知用户',
          avatar: reply.user.avatarUrl || '/image/user_avatar.png',
          content: reply.content,
          time: this.formatTime(reply.createdAt),
          likes: reply.likeCount || 0,
          replyCount: reply.replyCount || 0,
          liked: reply.isLiked || false,
          postId: reply.postId,
          parentId: reply.parentId || 0
        })).map(decorateComment);

        const replies = this.data.page === 1 
          ? newReplies 
          : [...this.data.replies, ...newReplies];

        this.setData({
          replies: replies,
          hasMore: replyData.hasNextPage || false,
          page: this.data.page + 1
        });
      } else {
        console.error('获取回复列表失败:', res);
        wx.showToast({
          title: '获取回复失败',
          icon: 'none'
        });
      }
    }).catch(err => {
      this.setData({ loading: false });
      console.error('获取回复列表异常:', err);
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

  // 点赞回复
  likeReply(e) {
    const { id } = e.currentTarget.dataset;
    const replyId = Number(id);

    wx.showLoading({
      title: '处理中...'
    });

    request({
      url: `/api/student/comments/${replyId}/like`,
      method: 'POST'
    }).then(res => {
      wx.hideLoading();

      if (res.statusCode === 200 && res.data.code === 200) {
        const { isLiked, likeCount } = res.data.data;

        // 更新回复的点赞状态和数量
        const updated = this.data.replies.map((reply) => {
          if (reply.id === replyId) {
            return decorateComment({
              ...reply,
              liked: isLiked,
              likes: likeCount,
              likeCount: likeCount
            });
          }
          return reply;
        });

        this.setData({
          replies: updated
        });

        wx.showToast({
          title: isLiked ? '点赞成功' : '已取消点赞',
          icon: 'success'
        });
      } else {
        wx.showToast({
          title: res.data.message || '操作失败',
          icon: 'none'
        });
      }
    }).catch(err => {
      wx.hideLoading();
      console.error('回复点赞操作异常:', err);
      wx.showToast({
        title: '网络请求失败',
        icon: 'none'
      });
    });
  },

  // 返回上一页
  goBack() {
    wx.navigateBack({
      delta: 1
    });
  },

  // 上拉加载更多
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadReplies(this.data.commentId);
    }
  }
});
