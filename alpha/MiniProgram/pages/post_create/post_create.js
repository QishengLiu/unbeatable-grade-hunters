// pages/post_create/post_create.js
const { request } = require('../../utils/api') 

Page({
  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: 0,
    content: '',
    title: '',
    images: [], // 本地图片路径
    imageUrls: [], // 已上传图片的URL
    categories: [],
    selectedCategory: null,
    tags: [],
    inputTag: '',
    isAnonymous: false,
    showCategoryPicker: false,
    uploading: false, // 图片上传状态
    uploadProgress: 0, // 上传进度
    // 标签搜索建议相关
    tagSuggestions: [],
    showTagSuggestions: false,
    tagSearchTimer: null, // 用于防抖
    // AI生成相关
    showAIPromptModal: false,
    aiPrompt: '',
    aiGenerating: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 获取状态栏高度（优先使用新版 API）
    let statusBarHeight = 0;
    if (wx.getWindowInfo) {
      const windowInfo = wx.getWindowInfo();
      statusBarHeight = windowInfo.statusBarHeight || 0;
    } else {
      const systemInfo = wx.getSystemInfoSync();
      statusBarHeight = systemInfo.statusBarHeight || 0;
    }
    this.setData({ statusBarHeight });
    
    // 加载分类列表
    this.loadCategories();
  },

  /**
   * 加载分类列表
   */
  loadCategories() {
    request({
      url: '/api/public/categories',
      method: 'GET'
    }).then(res => {
      if (res.statusCode === 200 && res.data.code === 200) {
        const categories = res.data.data.map(item => ({
          id: item.categoryId,
          name: item.categoryName
        }));
        this.setData({
          categories: categories
        });
      } else {
        console.error('获取分类列表失败:', res);
        wx.showToast({
          title: '获取分类失败',
          icon: 'none'
        });
      }
    }).catch(err => {
      console.error('获取分类列表异常:', err);
      wx.showToast({
        title: '网络请求失败',
        icon: 'none'
      });
    });
  },

  /**
   * 取消按钮点击事件
   */
  onCancel() {
    wx.navigateBack({
      delta: 1
    });
  },

  /**
   * 重置按钮点击事件
   */
  onReset() {
    wx.showModal({
      title: '提示',
      content: '确定要重置所有内容吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            content: '',
            title: '',
            images: [],
            imageUrls: [],
            selectedCategory: null,
            tags: [],
            inputTag: '',
            isAnonymous: false,
            tagSuggestions: [],
            showTagSuggestions: false
          });
          wx.showToast({
            title: '已重置',
            icon: 'success'
          });
        }
      }
    });
  },

  /**
   * 标题输入事件
   */
  onTitleInput(e) {
    this.setData({
      title: e.detail.value
    });
  },

  /**
   * 内容输入事件
   */
  onContentInput(e) {
    this.setData({
      content: e.detail.value
    });
  },

  /**
   * 显示分类选择器
   */
  showCategoryPicker() {
    this.setData({
      showCategoryPicker: true
    });
  },

  /**
   * 隐藏分类选择器
   */
  hideCategoryPicker() {
    this.setData({
      showCategoryPicker: false
    });
  },

  /**
   * 选择分类
   */
  selectCategory(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({
      selectedCategory: category,
      showCategoryPicker: false
    });
  },

  /**
   * 输入标签
   */
  onTagInput(e) {
    const inputValue = e.detail.value;
    this.setData({
      inputTag: inputValue
    });

    // 清除之前的定时器
    if (this.data.tagSearchTimer) {
      clearTimeout(this.data.tagSearchTimer);
    }

    // 如果输入为空，隐藏建议列表
    if (!inputValue.trim()) {
      this.setData({
        tagSuggestions: [],
        showTagSuggestions: false
      });
      return;
    }

    // 设置新的定时器，实现防抖
    const timer = setTimeout(() => {
      this.searchTags(inputValue);
    }, 300);

    this.setData({
      tagSearchTimer: timer
    });
  },

  /**
   * 搜索标签
   */
  searchTags(tagName) {
    if (!tagName.trim()) {
      return;
    }

    request({
      url: '/api/public/tags/search',
      method: 'GET',
      data: {
        tagName: tagName
      }
    }).then(res => {
      if (res.statusCode === 200 && res.data.code === 200) {
        // 处理返回的标签数据
        const tag = res.data.data;
        if (tag && tag.tagName) {
          // 检查是否已经在建议列表中
          const exists = this.data.tagSuggestions.some(item => item.tagId === tag.tagId);
          if (!exists) {
            this.setData({
              tagSuggestions: [tag],
              showTagSuggestions: true
            });
          }
        } else {
          // 没有找到匹配的标签
          this.setData({
            tagSuggestions: [],
            showTagSuggestions: false
          });
        }
      } else {
        console.error('搜索标签失败:', res);
        this.setData({
          tagSuggestions: [],
          showTagSuggestions: false
        });
      }
    }).catch(err => {
      console.error('搜索标签异常:', err);
      this.setData({
        tagSuggestions: [],
        showTagSuggestions: false
      });
    });
  },

  /**
   * 添加标签
   */
  addTag() {
    const { inputTag, tags } = this.data;
    if (inputTag.trim() && tags.length < 5 && !tags.includes(inputTag.trim())) {
      this.setData({
        tags: [...tags, inputTag.trim()],
        inputTag: '',
        tagSuggestions: [],
        showTagSuggestions: false
      });
    }
  },

  /**
   * 选择建议的标签
   */
  selectSuggestedTag(e) {
    const selectedTag = e.currentTarget.dataset.tag;
    const { tags } = this.data;
    
    // 检查标签是否已存在
    if (tags.length < 5 && !tags.includes(selectedTag.tagName)) {
      this.setData({
        tags: [...tags, selectedTag.tagName],
        inputTag: '',
        tagSuggestions: [],
        showTagSuggestions: false
      });
    }
  },

  /**
   * 删除标签
   */
  removeTag(e) {
    const index = e.currentTarget.dataset.index;
    const tags = this.data.tags.filter((tag, i) => i !== index);
    this.setData({
      tags
    });
  },

  /**
   * 标签输入框获得焦点
   */
  onTagInputFocus() {
    if (this.data.tagSuggestions.length > 0) {
      this.setData({
        showTagSuggestions: true
      });
    }
  },

  /**
   * 标签输入框失去焦点
   */
  onTagInputBlur() {
    // 延迟隐藏，确保点击建议项时不会立即隐藏
    setTimeout(() => {
      this.setData({
        showTagSuggestions: false
      });
    }, 200);
  },

  /**
   * 切换匿名发布
   */
  toggleAnonymous() {
    this.setData({
      isAnonymous: !this.data.isAnonymous
    });
  },

  /**
   * 添加图片
   */
  onAddImage() {
    const that = this;
    wx.chooseImage({
      count: 9 - that.data.images.length, // 最多9张
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        const tempFilePaths = res.tempFilePaths;
        that.setData({
          images: [...that.data.images, ...tempFilePaths]
        });
        
        // 选择图片后立即上传
        that.uploadNewImages(tempFilePaths);
      },
      fail(err) {
        console.error('选择图片失败', err);
        wx.showToast({
          title: '选择图片失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 删除图片
   */
  removeImage(e) {
    const index = e.currentTarget.dataset.index;
    const images = this.data.images.filter((image, i) => i !== index);
    const imageUrls = this.data.imageUrls.filter((url, i) => i !== index);
    this.setData({
      images,
      imageUrls
    });
  },

  /**
   * 上传新选择的图片
   */
  uploadNewImages(newImages) {
    const app = getApp();
    
    // 为每张新图片创建上传任务
    newImages.forEach((imagePath, index) => {
      wx.showLoading({ title: `上传图片中 ${index + 1}/${newImages.length}` });
      
      wx.uploadFile({
        url: 'http://localhost:8081/api/public/oss/upload',
        filePath: imagePath,
        name: 'file',
        header: {
          'Authorization': `Bearer ${app.globalData.accessToken}`
        },
        success: (res) => {
          try {
            console.log('图片上传原始响应:', res); // 调试信息
            const data = JSON.parse(res.data);
            console.log('解析后的数据:', data); // 调试信息
            
            if (res.statusCode === 200 && data.code === 200) {
              // 根据实际的数据结构提取URL
              // 实际结构: data = "https://ls-study.oss-cn-beijing.aliyuncs.com/..."
              let imageUrl = null;
              
              // 检查data是否直接就是URL字符串
              if (typeof data.data === 'string' && data.data.startsWith('http')) {
                imageUrl = data.data;
              }
              
              console.log('提取的图片URL:', imageUrl); // 调试信息
              
              if (imageUrl) {
                // 将上传成功的URL添加到imageUrls数组中
                const currentImageUrls = [...this.data.imageUrls];
                currentImageUrls.push(imageUrl);
                this.setData({
                  imageUrls: currentImageUrls
                });
                
                wx.hideLoading();
                wx.showToast({
                  title: '图片上传成功',
                  icon: 'success'
                });
              } else {
                throw new Error('无法提取图片URL，响应数据: ' + JSON.stringify(data));
              }
            } else {
              throw new Error(data.message || '上传失败');
            }
          } catch (parseError) {
            wx.hideLoading();
            console.error('响应解析失败:', parseError);
            console.error('原始响应数据:', res.data);
            wx.showToast({
              title: '响应解析失败',
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          wx.hideLoading();
          console.error('图片上传失败:', err);
          wx.showToast({
            title: '图片上传失败',
            icon: 'none'
          });
        }
      });
    });
  },

  /**
   * 显示AI提示词输入弹窗
   */
  showAIPromptModal() {
    this.setData({
      showAIPromptModal: true,
      aiPrompt: ''
    });
  },

  /**
   * 隐藏AI提示词输入弹窗
   */
  hideAIPromptModal() {
    this.setData({
      showAIPromptModal: false,
      aiPrompt: ''
    });
  },

  /**
   * AI提示词输入事件
   */
  onAIPromptInput(e) {
    this.setData({
      aiPrompt: e.detail.value
    });
  },

  /**
   * AI生成内容
   */
  generateWithAI() {
    const prompt = this.data.aiPrompt.trim();
    
    if (!prompt) {
      wx.showToast({
        title: '请输入提示词',
        icon: 'none'
      });
      return;
    }
    
    // 显示加载状态
    this.setData({
      aiGenerating: true,
      showAIPromptModal: false
    });
    
    // 调用AI生成接口
    request({
      url: '/api/student/posts/generate',
      method: 'POST',
      data: {
        prompt: prompt
      }
    }).then(res => {
      // 隐藏加载状态
      this.setData({
        aiGenerating: false
      });
      
      if (res.statusCode === 200 && res.data.code === 200) {
        const aiData = res.data.data;
        
        // 查找对应的分类对象
        const category = this.data.categories.find(cat => cat.id === aiData.categoryId);
        
        // 更新表单数据
        this.setData({
          title: aiData.title || '',
          content: aiData.content || '',
          selectedCategory: category || null,
          tags: Array.isArray(aiData.tagNames) ? aiData.tagNames.slice(0, 5) : []
        });
        
        wx.showToast({
          title: '生成成功',
          icon: 'success'
        });
      } else {
        wx.showToast({
          title: res.data.msg || '生成失败',
          icon: 'none'
        });
      }
    }).catch(err => {
      // 隐藏加载状态
      this.setData({
        aiGenerating: false
      });
      
      console.error('AI生成失败:', err);
      wx.showToast({
        title: '网络请求失败',
        icon: 'none'
      });
    });
  },

  /**
   * 提交表单
   */
  onSubmit() {
    const { title, content, selectedCategory, tags, isAnonymous, imageUrls } = this.data;
    
    // 表单验证
    if (!title.trim()) {
      wx.showToast({ title: '请输入标题', icon: 'none' });
      return;
    }

    if (!content.trim()) {
      wx.showToast({ title: '请输入内容', icon: 'none' });
      return;
    }

    if (!selectedCategory) {
      wx.showToast({ title: '请选择分类', icon: 'none' });
      return;
    }

    // 过滤掉无效的URL
    const validImageUrls = imageUrls.filter(url => url && typeof url === 'string');
    console.log('准备发布的图片URL:', validImageUrls); // 调试信息

    wx.showLoading({ title: '发布中...', mask: true });

    // 发起真实请求，使用指定的接口参数格式
    request({
      url: '/api/student/posts',
      method: 'POST',
      data: {
        title: title,
        content: content,
        categoryId: selectedCategory.id,
        tagNames: tags,
        images: validImageUrls, // 使用已上传的图片URL
        isAnonymous: isAnonymous ? 1 : 0, // 是否匿名
        location: '校园内', // 默认地点信息
        contactInfo: '站内信联系' // 默认联系方式
      }
    }).then(res => {
      wx.hideLoading();
      if (res.statusCode === 200 && res.data.code === 200) {
        wx.showToast({ title: '发布成功', icon: 'success' });
        // 延迟返回，让用户看清提示
        setTimeout(() => {
          wx.navigateBack({ delta: 1 });
        }, 1500);
      } else {
        wx.showToast({ 
          title: res.data.message || '发布失败', 
          icon: 'none' 
        });
      }
    }).catch(err => {
      wx.hideLoading();
      console.error('发帖请求失败:', err);
      wx.showToast({ title: '网络请求失败', icon: 'none' });
    });
  },

  /**
   * 阻止事件冒泡
   */
  stopPropagation(e) {
    // 阻止事件冒泡，防止点击弹窗内部时关闭弹窗
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    return false;
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    // 清理定时器
    if (this.data.tagSearchTimer) {
      clearTimeout(this.data.tagSearchTimer);
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})