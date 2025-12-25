const { request } = require('../../utils/api')

const randomCovers = [
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=60",
  "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=60",
  "https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=600&q=60",
  "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=600&q=60"
];

const randomAvatars = [
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=60",
  "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=60",
  "https://images.unsplash.com/photo-1544723795-432537f90349?auto=format&fit=crop&w=200&q=60",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=60"
];

const randomTexts = [
  "撒大苏打健康卡卡卡카카카카카카카카，发大水发大水飞洒地方撒旦范德萨分士大夫是打发士大夫士大夫撒旦范德萨发达。",
  "今天的校园阳光格外好，操场边的银杏树叶都黄了，想邀请你一起散步聊天。",
  "刚刚在食堂偶遇同专业的学弟，聊了好多课程心得，感受了社群的温度。",
  "期末季临近，发起一个\"互助自习\"计划，有没有人一起去图书馆冲刺？"
];

const formatCount = (count) => {
  if (count >= 10000) {
    return (count / 10000).toFixed(1).replace(/\.0$/, "") + "w";
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return `${count}`;
};

const decoratePost = function(post) {
  return {
    id: post.id,
    author: post.author,
    tag: post.tag,
    meta: post.meta,
    content: post.content,
    image: post.image,
    avatar: post.avatar,
    likes: post.likes,
    comments: post.comments,
    liked: post.liked,
    likesDisplay: formatCount(post.likes),
    commentsDisplay: formatCount(post.comments)
  };
};

const decoratePosts = function(posts) {
  var result = [];
  for (var i = 0; i < posts.length; i++) {
    result.push(decoratePost(posts[i]));
  }
  return result;
};

const basePostSeeds = [
  {
    id: 1,
    author: "丁浚哲",
    tag: "明日方舟忠实玩家",
    meta: "08:39 · 官方分享",
    content: randomTexts[0],
    image: randomCovers[0],
    avatar: randomAvatars[0],
    likes: 7500,
    comments: 425,
    liked: false
  },
  {
    id: 2,
    author: "丁浚哲",
    tag: "明日方舟忠实玩家",
    meta: "08:39 · 官方分享",
    content: randomTexts[1],
    image: randomCovers[1],
    avatar: randomAvatars[1],
    likes: 6400,
    comments: 318,
    liked: false
  }
];

const createInitialPosts = function() {
  var decoratedPosts = [];
  for (var i = 0; i < basePostSeeds.length; i++) {
    var seed = basePostSeeds[i];
    var clonedSeed = {
      id: seed.id,
      author: seed.author,
      tag: seed.tag,
      meta: seed.meta,
      content: seed.content,
      image: seed.image,
      avatar: seed.avatar,
      likes: seed.likes,
      comments: seed.comments,
      liked: seed.liked
    };
    decoratedPosts.push(decoratePost(clonedSeed));
  }
  return decoratedPosts;
};

Page({
  data: {
    // 修复时间显示，添加默认时间
    status: {
      time: '14:25'
    },
    profile: {
      avatar: "https://images.unsplash.com/photo-1544723795-432537f90349?auto=format&fit=crop&w=200&q=60"
    },
    assets: {
      search: "https://img.icons8.com/ios-glyphs/60/5f6368/search.png",
      compose: "https://img.icons8.com/ios-glyphs/60/5f6368/edit-calendar.png",
      composeWhite: "https://img.icons8.com/ios-glyphs/60/ffffff/plus-math.png",
      like: "https://img.icons8.com/fluency-systems-regular/48/9ea0a7/like.png",
      likeActive: "https://img.icons8.com/fluency-systems-filled/48/fa314a/like.png",
      comment: "https://img.icons8.com/ios-glyphs/60/8d95a1/speech-bubble.png",
      share: "https://img.icons8.com/ios-glyphs/60/8d95a1/paper-plane.png"
    },
    stories: [
      { id: 1, name: "阿角", cover: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=60" },
      { id: 2, name: "摄影社", cover: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=200&q=60" },
      { id: 3, name: "旅行记", cover: "https://images.unsplash.com/photo-1525134479668-1bee5c7c6845?auto=format&fit=crop&w=200&q=60" },
      { id: 4, name: "VC Lab", cover: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=60" },
      { id: 5, name: "社团君", cover: "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=200&q=60" }
    ],
    // 确保初始帖子数据，添加更多模拟数据
    postList: [],
    loading: false,
    hasMore: true,
    nextId: basePostSeeds.length + 1
  },

  feedTimer: null,

  // 页面加载时初始化数据
onLoad: function() {
    this.updateTime();
    this.fetchPosts(); // 新增拉取方法
  },

  // 新增：从后端获取帖子列表
  fetchPosts: function() {
    this.setData({ loading: true });
    
    request({
      url: '/api/student/posts',
      method: 'GET',
      data: {
        page: 1,
        size: 20,
        sortBy: 'created_at',
        order: 'desc'
      }
    }).then(res => {
      if(res.statusCode === 200 && res.data.code === 200) {
        const serverPosts = res.data.data.records;
        // 数据映射：将后端字段转换为前端UI需要的格式
        const uiPosts = serverPosts.map(post => ({
          id: post.postId,
          author: post.author || '匿名用户', // 后端目前返回的可能是null或固定值
          tag: post.category ? post.category.categoryName : '日常',
          meta: post.createdAt ? post.createdAt.substring(5, 16).replace('T', ' ') : '刚刚',
          content: post.title || post.content, // 优先显示标题，如果没有则显示内容
          image: (post.images && post.images.length > 0) ? post.images[0] : '', // 取第一张图
          avatar: post.avatarUrl ? post.avatarUrl : '/image/user_avatar.png', // 使用接口返回的用户头像
          likes: post.likeCount || 0,
          comments: post.commentCount || 0,
          liked: false, // 列表接口暂时没返回当前用户是否点赞状态
          likesDisplay: formatCount(post.likeCount || 0),
          commentsDisplay: formatCount(post.commentCount || 0)
        }));

        this.setData({
          postList: uiPosts,
          loading: false
        });
      }
    }).catch(err => {
      console.error(err);
      this.setData({ loading: false });
    });
  },

  // 更新时间显示
  updateTime: function() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    this.setData({
      'status.time': `${hours}:${minutes}`
    });
  },

  onPullDownRefresh() {
    this.refreshFeed();
  },

  onShow() {
    this.startRealtimeFeed();
    // 每次页面显示时都重新获取帖子列表，确保能看到最新发布的帖子
    this.fetchPosts();
  },

  onHide() {
    this.stopRealtimeFeed();
  },

  onUnload() {
    this.stopRealtimeFeed();
  },

  refreshFeed() {
    setTimeout(() => {
      this.setData({
        postList: createInitialPosts(),
        hasMore: true,
        nextId: basePostSeeds.length + 1
      });
      wx.stopPullDownRefresh();
      wx.showToast({ title: "已更新", icon: "success" });
    }, 600);
  },

  loadMore() {
    if (this.data.loading || !this.data.hasMore) return;

    this.setData({ loading: true });

    var that = this;
    setTimeout(function() {
      var newPost = that.buildPost();
      var nextId = that.data.nextId + 1;
      var hasMore = nextId < 20;
      // 替换展开运算符为数组连接
      var updatedPostList = that.data.postList.slice();
      updatedPostList.push(newPost);
      that.setData({
        postList: updatedPostList,
        loading: false,
        hasMore: hasMore,
        nextId: nextId
      });
    }, 800);
  },

  buildPost: function() {
    var id = this.data.nextId;
    var likes = 900 + id * 37;
    var comments = 200 + id * 11;
    // 替换对象简写属性
    var tagArr = ["摄影", "日常", "互助"];
    var randomTextsIndex = id % randomTexts.length;
    var randomCoversIndex = id % randomCovers.length;
    var randomAvatarsIndex = id % randomAvatars.length;
    
    return decoratePost({
      id: id,
      author: "校园玩家 " + id,
      tag: tagArr[id % 3],
      meta: "刚刚 · 热门话题",
      content: randomTexts[randomTextsIndex],
      image: randomCovers[randomCoversIndex],
      avatar: randomAvatars[randomAvatarsIndex],
      likes: likes,
      comments: comments,
      liked: false
    });
  },

  startRealtimeFeed: function() {
    if (this.feedTimer) return;
    var that = this;
    // 替换箭头函数
    this.feedTimer = setInterval(function() {
      that.pushRealtimePost();
    }, 12000);
  },

  stopRealtimeFeed: function() {
    if (this.feedTimer) {
      clearInterval(this.feedTimer);
      this.feedTimer = null;
    }
  },

  pushRealtimePost: function() {
    var newPost = this.buildPost();
    var nextId = this.data.nextId + 1;
    // 替换展开运算符为数组操作
    var updated = [newPost];
    for (var i = 0; i < this.data.postList.length; i++) {
      updated.push(this.data.postList[i]);
    }
    if (updated.length > 25) {
      updated.pop();
    }
    this.setData({
      postList: updated,
      nextId: nextId
    });
  },

  onSearch: function() {
    wx.showToast({ title: "搜索功能建设中", icon: "none" });
  },

  openProfile: function() {
    wx.navigateTo({
      url: "/pages/profile/profile"
    });
  },

  createPost: function() {
    wx.navigateTo({ url: "/pages/post_create/post_create" });
  },

  openStory: function(e) {
    var id = e.currentTarget.dataset.id;
    wx.showToast({ title: "查看用户 " + id, icon: "none" });
  },

  openPost: function(e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: "/pages/post_detail/post_detail?postId=" + id });
  },

  showMore: function(e) {
    if (e.stopPropagation) {
      e.stopPropagation();
    }
    wx.showActionSheet({
      itemList: ["收藏", "举报", "取消"],
      fail: function() {}
    });
  },

  likePost: function(e) {
    if (e.stopPropagation) {
      e.stopPropagation();
    }
    var id = e.currentTarget.dataset.id;
    var targetId = Number(id);
    var list = [];
    for (var i = 0; i < this.data.postList.length; i++) {
      var post = this.data.postList[i];
      if (post.id === targetId) {
        var liked = !post.liked;
        var likes = Math.max(0, post.likes + (liked ? 1 : -1));
        var updatedPost = {
          id: post.id,
          author: post.author,
          tag: post.tag,
          meta: post.meta,
          content: post.content,
          image: post.image,
          avatar: post.avatar,
          likes: likes,
          comments: post.comments,
          liked: liked
        };
        list.push(decoratePost(updatedPost));
      } else {
        list.push(post);
      }
    }
    this.setData({ postList: list });
  },

  commentPost: function(e) {
    if (e.stopPropagation) {
      e.stopPropagation();
    }
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: "/pages/post_detail/post_detail?postId=" + id + "&comment=true" });
  },

  sharePost: function(e) {
    if (e.stopPropagation) {
      e.stopPropagation();
    }
    var id = e.currentTarget.dataset.id;
    var targetId = Number(id);
    wx.showShareMenu({ withShareTicket: true });
    wx.showToast({
      title: "分享帖子 " + targetId,
      icon: "none"
    });
  },

  // 导航到首页
  goToIndex: function() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  },

  // 导航到互助页面
  goToHelp: function() {
    wx.switchTab({
      url: '/pages/help/help'
    });
  },

  // 导航到个人中心页面
  goToProfile: function() {
    wx.switchTab({
      url: '/pages/profile/profile'
    });
  },

  createPost() {
    wx.navigateTo({ url: "/pages/post_create/post_create" });
  },

  onShareAppMessage() {
    return {
      title: "一起加入 SociaLink 动态广场",
      path: "/pages/social/social"
    };
  }
});