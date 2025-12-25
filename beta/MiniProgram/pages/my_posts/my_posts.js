const { request } = require('../../utils/api')

Page({
  data: {
    statusBarHeight: 0,
    posts: [],
    loading: false,
    page: 1,
    size: 10,
    hasMore: true
  },

  onLoad() {
    const systemInfo = wx.getSystemInfoSync()
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight || 0
    })
    this.loadPosts(true)
  },

  onPullDownRefresh() {
    this.loadPosts(true)
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadPosts(false)
    }
  },

  handleBack() {
    wx.navigateBack({
      delta: 1
    })
  },

  loadPosts(isRefresh) {
    if (this.data.loading) return

    const nextPage = isRefresh ? 1 : this.data.page

    this.setData({ loading: true })

    request({
      url: '/api/student/posts',
      method: 'GET',
      data: {
        page: nextPage,
        size: this.data.size,
        sortBy: 'created_at',
        order: 'desc',
        onlyMine: true
      }
    }).then(res => {
      if (res.statusCode === 200 && (res.data.code === 200 || res.data.code === 0)) {
        const data = res.data.data || {}
        const records = data.records || []

        const list = records.map(item => {
          const createdAt = item.createdAt || ''
          let timeDisplay = createdAt
          if (createdAt && createdAt.indexOf('T') !== -1) {
            timeDisplay = createdAt.substring(0, 16).replace('T', ' ')
          }

          let statusText = '已发布'
          if (item.status === 'pending') statusText = '待审核'
          else if (item.status === 'rejected') statusText = '已拒绝'
          else if (item.status === 'deleted') statusText = '已删除'

          return {
            id: item.postId,
            title: item.title || '未命名动态',
            time: timeDisplay,
            status: item.status,
            statusText,
            cover: (item.images && item.images.length > 0) ? item.images[0] : '/image/user_avatar.png'
          }
        })

        const newList = isRefresh ? list : this.data.posts.concat(list)
        const hasMore = data.hasNext !== undefined ? data.hasNext : (list.length === this.data.size)

        this.setData({
          posts: newList,
          loading: false,
          page: nextPage + 1,
          hasMore
        })
      } else {
        this.setData({ loading: false })
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        })
      }
    }).catch(() => {
      this.setData({ loading: false })
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }).finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  viewDetail(e) {
    const postId = e.currentTarget.dataset.postId
    if (!postId) return
    wx.navigateTo({
      url: `/pages/post_detail/post_detail?postId=${postId}`
    })
  },

  editPost(e) {
    const id = e.currentTarget.dataset.id
    if (!id) return
    wx.navigateTo({
      url: `/pages/post_create/post_create?postId=${id}`
    })
  },

  deletePost(e) {
    const id = e.currentTarget.dataset.id
    if (!id) return

    wx.showModal({
      title: '删除动态',
      content: '确定要删除这条动态吗？',
      success: (res) => {
        if (res.confirm) {
          request({
            url: `/api/student/posts/${id}`,
            method: 'DELETE'
          }).then(resp => {
            if (resp.statusCode === 200 && (resp.data.code === 200 || resp.data.code === 0)) {
              const list = this.data.posts.filter(item => String(item.id) !== String(id))
              this.setData({ posts: list })
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              })
            } else {
              wx.showToast({
                title: resp.data.message || '删除失败',
                icon: 'none'
              })
            }
          }).catch(() => {
            wx.showToast({
              title: '网络错误',
              icon: 'none'
            })
          })
        }
      }
    })
  }
})

