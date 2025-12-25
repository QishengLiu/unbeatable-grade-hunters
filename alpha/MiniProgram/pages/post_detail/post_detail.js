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

const decoratePost = (post) => ({
  ...post,
  likesDisplay: formatCount(post.likeCount || post.likes || 0),
  commentsDisplay: formatCount(post.commentCount || post.comments || 0),
  collectsDisplay: formatCount(post.collects || 0),
  shareDisplay: formatCount(post.shares || post.collects || 0)
});

const decorateComment = (comment) => ({
  ...comment,
  likesDisplay: formatCount(comment.likes || comment.likeCount || 0),
  replyDisplay: formatCount(comment.replyCount || comment.replies?.length || 0)
});

const basePost = decoratePost({
  id: 1,
  author: "丁浚哲",
  tag: "明日方舟忠实玩家",
  authorAvatar: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=200&q=60",
  title: "明早考试急借形策，价格好说",
  image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=60",
  content: "我明天上午要考试，求形策一本，明早十点要用。感谢有缘人~~~价格好商量，10元送到我宿舍楼下或者我自取也行，送到宿舍楼下的话放在30#外卖架上就行。\n\n最好是有重点笔记的版本，我会非常认真对待并及时归还，拜托大家啦！",
  likes: 7500,
  comments: 425,
  collects: 86,
  shares: 30,
  liked: false,
  time: "08:39 · 官方分享",
  tags: ["互助", "形策", "自习搭子"]
});

const baseComments = [
  {
    id: 1,
    name: "陈泽荣",
    time: "1分钟前",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=60",
    content: "我来",
    likes: 1000,
    replyCount: 30,
    replies: [
      {
        replyName: "丁浚哲",
        replyTo: "陈泽荣",
        replyContent: "你真是个大大大大大大大大大大大大大大大大大大大大大大大大大大大大大大好人"
      },
      {
        replyName: "陈泽荣",
        replyTo: "丁浚哲",
        replyContent: "是的是我是个大大大大大大大大大大大大大大大大大大好人"
      }
    ],
    showMore: true
  },
  {
    id: 2,
    name: "哈哈哈哈蛋哈哈你打我噻",
    time: "1分钟前",
    avatar: "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=200&q=60",
    content: "我来",
    likes: 500,
    replyCount: 30,
    replies: [],
    showMore: false
  }
].map(decorateComment);

Page({
  data: {
    status: {
      time: "9:41"
    },
    assets: {
      like: "https://img.icons8.com/color/48/fa314a/hearts.png",
      likeActive: "https://img.icons8.com/color/48/ff4d6d/like.png",
      likeOutline: "https://img.icons8.com/ios/50/fa314a/like--v1.png",
      commentGray: "https://img.icons8.com/ios/50/9ea0a7/speech-bubble.png",
      planeGray: "https://img.icons8.com/ios/50/9ea0a7/paper-plane.png",
      back: "https://img.icons8.com/ios-filled/50/1f1f1f/less-than.png",
      share: "https://img.icons8.com/ios/50/1f1f1f/more.png"
    },
    post: {},
    comments: [],
    loadingComments: false,
    commentPage: 1,
    commentPageSize: 10,
    hasMoreComments: true,
    // 评论输入相关数据
    showCommentModal: false,
    commentContent: '',
    replyToCommentId: null
  },

  onLoad(options) {
    const postId = options.postId || options.id;  // 兼容两种参数名
    if (postId) {
      this.loadPostDetail(postId);
      this.loadComments(postId);
    }
  },

  // 加载帖子详情
  loadPostDetail(postId) {
    request({
      url: `/api/student/posts/${postId}`,
      method: 'GET'
    }).then(res => {
      if (res.statusCode === 200 && res.data.code === 200) {
        const postData = res.data.data;
        
        // 格式化帖子数据以适配页面展示
        const formattedPost = this.formatPostData(postData);
        
        this.setData({
          post: decoratePost(formattedPost)
        });
      } else {
        console.error('获取帖子详情失败:', res);
        wx.showToast({
          title: '获取帖子详情失败',
          icon: 'none'
        });
      }
    }).catch(err => {
      console.error('获取帖子详情异常:', err);
      wx.showToast({
        title: '网络请求失败',
        icon: 'none'
      });
    });
  },

  // 加载评论列表
  loadComments(postId) {
    // 修复分页判断逻辑
    if (this.data.commentPage > 1 && !this.data.hasMoreComments) return;
    
    this.setData({ loadingComments: true });
    
    request({
      url: `/api/student/posts/${postId}/comments`,
      method: 'GET',
      data: {
        page: this.data.commentPage,
        size: this.data.commentPageSize,
        sortBy: 'createdAt',
        order: 'desc'
      }
    }).then(res => {
      this.setData({ loadingComments: false });
      
      if (res.statusCode === 200 && res.data.code === 200) {
        const commentData = res.data.data;
        const newComments = commentData.records.map(comment => ({
          id: comment.commentId,
          name: comment.user.username || comment.user.nickName || '未知用户',
          avatar: comment.user.avatarUrl || '/image/user_avatar.png',
          content: comment.content,
          time: this.formatTime(comment.createdAt),
          likes: comment.likeCount || 0,
          replyCount: comment.replyCount || 0,
          liked: comment.isLiked || false,
          postId: comment.postId,
          parentId: comment.parentId || 0
        })).map(decorateComment);
        
        const comments = this.data.commentPage === 1 
          ? newComments 
          : [...this.data.comments, ...newComments];
        
        this.setData({
          comments: comments,
          hasMoreComments: commentData.hasNextPage || false,
          commentPage: this.data.commentPage + 1
        });
      } else {
        console.error('获取评论列表失败:', res);
        wx.showToast({
          title: '获取评论失败',
          icon: 'none'
        });
      }
    }).catch(err => {
      this.setData({ loadingComments: false });
      console.error('获取评论列表异常:', err);
      wx.showToast({
        title: '网络请求失败',
        icon: 'none'
      });
    });
  },

  // 格式化帖子数据以适配页面展示
  formatPostData(postData) {
    return {
      id: postData.postId,
      author: postData.author.nickName || postData.author.username || '未知用户',
      authorAvatar: postData.author.avatarUrl || '/image/user_avatar.png',
      title: postData.title,
      content: postData.content,
      image: postData.images && postData.images.length > 0 ? postData.images[0] : '',
      images: postData.images || [],
      likes: postData.likeCount || 0,
      comments: postData.commentCount || 0,
      collects: 0, // 接口未返回收藏数
      shares: 0, // 接口未返回分享数
      liked: postData.isLiked || false,  // 使用接口返回的isLiked字段
      time: this.formatTime(postData.createdAt),
      tags: postData.tags || [],
      categoryName: postData.category ? postData.category.categoryName : ''
    };
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

  likePost() {
    const postId = this.data.post.id;
    
    if (!postId) {
      wx.showToast({
        title: '缺少帖子信息',
        icon: 'none'
      });
      return;
    }
    
    wx.showLoading({
      title: '处理中...'
    });
    
    request({
      url: `/api/student/posts/${postId}/like`,
      method: 'POST'
    }).then(res => {
      wx.hideLoading();
      
      if (res.statusCode === 200 && res.data.code === 200) {
        const { isLiked, likeCount } = res.data.data;
        
        // 更新帖子的点赞状态和数量
        const post = decoratePost({
          ...this.data.post,
          liked: isLiked,
          likes: likeCount,
          likeCount: likeCount
        });
        
        this.setData({ post });
        
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
      console.error('点赞操作异常:', err);
      wx.showToast({
        title: '网络请求失败',
        icon: 'none'
      });
    });
  },

  // 显示评论输入弹窗
  showCommentModal(e) {
    this.setData({
      showCommentModal: true,
      commentContent: '',
      replyToCommentId: null
    });
  },

  // 隐藏评论输入弹窗
  hideCommentModal() {
    this.setData({
      showCommentModal: false,
      commentContent: '',
      replyToCommentId: null
    });
  },

  // 评论输入事件
  onCommentInput(e) {
    this.setData({
      commentContent: e.detail.value
    });
  },

  // 发布评论
  publishComment() {
    const content = this.data.commentContent.trim();
    const postId = this.data.post.id;
    
    if (!content) {
      wx.showToast({
        title: '请输入评论内容',
        icon: 'none'
      });
      return;
    }
    
    if (!postId) {
      wx.showToast({
        title: '缺少帖子信息',
        icon: 'none'
      });
      return;
    }
    
    wx.showLoading({
      title: '发布中...'
    });
    
    const requestData = {
      postId: postId,
      content: content
    };
    
    // 如果是回复评论，则添加parentId
    if (this.data.replyToCommentId) {
      requestData.parentId = this.data.replyToCommentId;
    }
    
    request({
      url: '/api/student/comments',
      method: 'POST',
      data: requestData
    }).then(res => {
      wx.hideLoading();
      
      if (res.statusCode === 200 && res.data.code === 200) {
        wx.showToast({
          title: '评论成功',
          icon: 'success'
        });
        
        // 清空输入并关闭弹窗
        this.setData({
          commentContent: '',
          showCommentModal: false,
          replyToCommentId: null
        });
        
        // 重新加载评论列表
        this.setData({
          comments: [],
          commentPage: 1,
          hasMoreComments: true
        });
        this.loadComments(postId);
      } else {
        wx.showToast({
          title: res.data.message || '评论失败',
          icon: 'none'
        });
      }
    }).catch(err => {
      wx.hideLoading();
      console.error('发布评论异常:', err);
      wx.showToast({
        title: '网络请求失败',
        icon: 'none'
      });
    });
  },

  commentPost() {
    this.showCommentModal();
  },

  replyComment(e) {
    const { id } = e.currentTarget.dataset;
    this.setData({
      showCommentModal: true,
      replyToCommentId: id
    });
  },

  likeComment(e) {
    const { id } = e.currentTarget.dataset;
    const commentId = Number(id);
    
    wx.showLoading({
      title: '处理中...'
    });
    
    request({
      url: `/api/student/comments/${commentId}/like`,
      method: 'POST'
    }).then(res => {
      wx.hideLoading();
      
      if (res.statusCode === 200 && res.data.code === 200) {
        const { isLiked, likeCount } = res.data.data;
        
        // 更新评论的点赞状态和数量
        const updated = this.data.comments.map((comment) => {
          if (comment.id === commentId) {
            return decorateComment({
              ...comment,
              liked: isLiked,
              likes: likeCount,
              likeCount: likeCount
            });
          }
          return comment;
        });
        
        this.setData({
          comments: updated
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
      console.error('评论点赞操作异常:', err);
      wx.showToast({
        title: '网络请求失败',
        icon: 'none'
      });
    });
  },
  
  onReachBottom() {
    const postId = this.data.post.id;
    if (postId && this.data.hasMoreComments) {
      this.loadComments(postId);
    }
  },

  viewReplies(e) {
    const { id } = e.currentTarget.dataset;
    console.log('查看回复，评论ID:', id);
    
    if (!id) {
      wx.showToast({
        title: '无法查看回复',
        icon: 'none'
      });
      return;
    }
    
    wx.navigateTo({
      url: `/pages/comment_replies/comment_replies?commentId=${id}`
    });
  },

  viewMoreReply() {
    wx.showToast({
      title: "展开更多回复",
      icon: "none"
    });
  },

  sharePost() {
    wx.showShareMenu({
      withShareTicket: true
    });
    wx.showToast({
      title: "分享帖子",
      icon: "none"
    });
  },

  goBack() {
    wx.navigateBack({
      delta: 1
    });
  },

  onShareAppMessage() {
    return {
      title: "一起看看这个求助帖～",
      path: "/pages/post_detail/post_detail?id=" + this.data.post.id
    };
  }
});