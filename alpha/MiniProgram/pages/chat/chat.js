// pages/chat/chat.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userId: '',
    userName: '刘琦晟',
    inputContent: '',
    scrollToMessage: '',
    messages: [
      {
        id: '1',
        type: 'other',
        content: '你好，感谢接单',
        time: '10:30'
      },
      {
        id: '2', 
        type: 'other',
        content: '你什么时候到？我在哪里等你？',
        time: '10:31'
      },
      {
        id: '3',
        type: 'mine',
        content: '我5分钟后到图书馆',
        time: '10:32'
      },
      {
        id: '4',
        type: 'mine',
        content: '可以在一楼自习室门口见吗',
        time: '10:32'
      },
      {
        id: '5',
        type: 'other',
        content: '可以的，到数计后找陈泽荣就可以😊',
        time: '10:33'
      },
      {
        id: '6',
        type: 'mine',
        content: '明白，我马上就到',
        time: '10:34'
      }
    ],
    isKeyboardUp: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 从参数中获取用户ID和用户名
    if (options.userId) {
      this.setData({
        userId: options.userId
      })
    }
    if (options.userName) {
      this.setData({
        userName: options.userName
      })
    }
    // 滚动到底部
    this.scrollToBottom()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 监听键盘高度变化
    this.keyboardHeightListener = wx.onKeyboardHeightChange((res) => {
      this.setData({
        isKeyboardUp: res.height > 0
      })
      if (res.height > 0) {
        // 键盘弹出时滚动到底部
        setTimeout(() => {
          this.scrollToBottom()
        }, 100)
      }
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    // 移除键盘高度监听
    if (this.keyboardHeightListener) {
      this.keyboardHeightListener()
    }
  },

  /**
   * 返回上一页
   */
  navigateBack: function() {
    wx.navigateBack({
      delta: 1
    })
  },

  /**
   * 显示用户信息
   */
  showUserInfo: function() {
    wx.showModal({
      title: this.data.userName,
      content: '用户ID：' + this.data.userId + '\n可以在这里查看更多用户信息',
      showCancel: false
    })
  },

  /**
   * 显示更多操作
   */
  showMoreActions: function() {
    wx.showActionSheet({
      itemList: ['发送图片', '发送文件', '位置共享', '语音通话'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            wx.chooseImage({
              count: 1,
              success: (res) => {
                console.log('选择图片:', res.tempFilePaths)
                // 这里可以实现发送图片的逻辑
              }
            })
            break
          case 1:
            wx.chooseMessageFile({
              count: 1,
              type: 'file',
              success: (res) => {
                console.log('选择文件:', res.tempFiles)
                // 这里可以实现发送文件的逻辑
              }
            })
            break
          case 2:
            wx.chooseLocation({
              success: (res) => {
                console.log('选择位置:', res)
                // 这里可以实现发送位置的逻辑
              }
            })
            break
          case 3:
            wx.showToast({
              title: '语音通话功能开发中',
              icon: 'none'
            })
            break
        }
      }
    })
  },

  /**
   * 输入内容变化
   */
  onInput: function(e) {
    this.setData({
      inputContent: e.detail.value
    })
  },

  /**
   * 输入框获得焦点
   */
  onInputFocus: function() {
    this.setData({
      isKeyboardUp: true
    })
  },

  /**
   * 输入框失去焦点
   */
  onInputBlur: function() {
    this.setData({
      isKeyboardUp: false
    })
  },

  /**
   * 发送消息
   */
  sendMessage: function() {
    const content = this.data.inputContent.trim()
    if (!content) {
      return
    }

    // 创建新消息
    const newMessage = {
      id: Date.now().toString(),
      type: 'mine',
      content: content,
      time: this.formatTime(new Date())
    }

    // 更新消息列表
    const messages = [...this.data.messages, newMessage]
    this.setData({
      messages: messages,
      inputContent: ''
    })

    // 滚动到底部
    this.scrollToBottom()

    // 模拟发送消息到服务器
    console.log('发送消息:', content)

    // 模拟收到回复
    setTimeout(() => {
      // 这里可以根据需要模拟不同的回复内容
      const replies = [
        '好的，我知道了',
        '收到',
        '明白了',
        '😊',
        '好的，那我们一会儿见'
      ]
      const randomReply = replies[Math.floor(Math.random() * replies.length)]
      this.receiveMessage(randomReply)
    }, 1000 + Math.random() * 2000) // 随机延迟1-3秒
  },

  /**
   * 接收消息
   */
  receiveMessage: function(content) {
    const newMessage = {
      id: Date.now().toString(),
      type: 'other',
      content: content,
      time: this.formatTime(new Date())
    }

    const messages = [...this.data.messages, newMessage]
    this.setData({
      messages: messages
    })

    this.scrollToBottom()
  },

  /**
   * 滚动到底部
   */
  scrollToBottom: function() {
    if (this.data.messages.length > 0) {
      this.setData({
        scrollToMessage: 'message-' + this.data.messages[this.data.messages.length - 1].id
      })
    }
  },

  /**
   * 格式化时间
   */
  formatTime: function(date) {
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return hours + ':' + minutes
  },

  /**
   * 滚动事件处理
   */
  onScroll: function(e) {
    // 可以在这里实现上拉加载更多消息
    console.log('滚动位置:', e.detail.scrollTop)
  }
})