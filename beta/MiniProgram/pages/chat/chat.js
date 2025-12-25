Page({
  data: {
    targetUser: {
      nickname: '同学A',
      avatar: 'https://images.unsplash.com/photo-1544723795-432537f90349?auto=format&fit=crop&w=200&q=60',
      taskName: '南门取快递'
    },
    messages: [
      {
        id: 1,
        type: 'other',
        content: '你好，请问是接了我的代取快递任务吗？',
        avatar: 'https://images.unsplash.com/photo-1544723795-432537f90349?auto=format&fit=crop&w=200&q=60'
      },
      {
        id: 2,
        type: 'me',
        content: '是的，我正好在南门这边。',
        avatar: 'https://img.icons8.com/fluency-systems-regular/48/999999/user.png' // Fallback or current user avatar
      },
      {
        id: 3,
        type: 'other',
        content: '太好了！取件码是 12-3-4567。',
        avatar: 'https://images.unsplash.com/photo-1544723795-432537f90349?auto=format&fit=crop&w=200&q=60'
      },
      {
        id: 4,
        type: 'me',
        content: '收到，我现在去拿，大概10分钟后送到你宿舍楼下。',
        avatar: 'https://img.icons8.com/fluency-systems-regular/48/999999/user.png'
      }
    ],
    inputContent: '',
    scrollToMessage: 'message-4'
  },

  onLoad(options) {
    // Load chat history
  },

  onBack() {
    wx.navigateBack();
  },

  onInput(e) {
    this.setData({ inputContent: e.detail.value });
  },

  sendMessage() {
    if (!this.data.inputContent.trim()) {
      wx.showToast({
        title: '内容不能为空',
        icon: 'none'
      });
      return;
    }

    const newMsg = {
      id: this.data.messages.length + 1,
      type: 'me',
      content: this.data.inputContent,
      avatar: 'https://img.icons8.com/fluency-systems-regular/48/999999/user.png'
    };

    const newMessages = [...this.data.messages, newMsg];

    this.setData({
      messages: newMessages,
      inputContent: '',
      scrollToMessage: `message-${newMsg.id}`
    });
  },

  showMoreActions() {
    wx.showToast({
      title: '更多功能开发中',
      icon: 'none'
    });
  }
})