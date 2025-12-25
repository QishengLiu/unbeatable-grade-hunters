const app = getApp();
const { createTask, request } = require('../../utils/api');

Page({
  data: {
    statusBarHeight: 20, // default
    taskType: 'general', // 'general' or 'task'
    formData: {
      title: '',
      desc: '',
      contact: '',
      location: '',
      latitude: null,
      longitude: null,
      duration: '',
      price: '',
      time: '',
      deadlineDate: '',
      deadlineHour: '',
      category: '',
      categoryId: null
    },
    durationOptions: ['30分钟内', '1小时内', '2小时内', '半天', '一天'],
    taskCategories: [],
    canSubmit: false,
    scrollId: ''
  },

  onLoad() {
    const sysInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: sysInfo.statusBarHeight
    });
    this.loadTaskCategories();
  },

  loadTaskCategories() {
    request({
      url: '/api/public/categories',
      method: 'GET'
    }).then(res => {
      if (res.statusCode === 200 && res.data.code === 200) {
        const list = (res.data.data || []).map(item => ({
          id: item.categoryId,
          name: item.categoryName
        }));
        this.setData({
          taskCategories: list
        });
      } else {
        console.error('加载任务分类失败', res);
      }
    }).catch(err => {
      console.error('加载任务分类异常', err);
    });
  },

  onBack() {
    wx.navigateBack();
  },

  switchType(e) {
    const type = e.currentTarget.dataset.type;
    if (type === this.data.taskType) return;
    
    // Reset relevant form data when switching, but keep common fields if desired? 
    // For simplicity, let's keep common fields (title, desc, contact) if they exist, or just clear non-relevant ones.
    // Actually, user might want to start over. Let's keep it simple and just switch type, 
    // validation will re-run and might fail if fields are missing.
    this.setData({
      taskType: type
    }, () => {
      this.validateForm();
    });
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    
    this.setData({
      [`formData.${field}`]: value
    }, () => {
      this.validateForm();
    });
  },

  chooseLocation() {
    wx.chooseLocation({
      success: (res) => {
        const latitude = Number(res.latitude);
        const longitude = Number(res.longitude);

        if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
          wx.showToast({
            title: '获取位置信息失败，请重试',
            icon: 'none'
          });
          return;
        }

        this.setData({
          ['formData.location']: res.name || res.address,
          ['formData.latitude']: latitude,
          ['formData.longitude']: longitude
        }, () => {
          this.validateForm();
        });
      },
      fail: (err) => {
        console.error('Choose location failed', err);
        if (err && err.errMsg && err.errMsg.indexOf('auth') !== -1) {
          wx.showToast({
            title: '需授权位置信息',
            icon: 'none'
          });
        }
      }
    });
  },

  onDurationChange(e) {
    const index = e.detail.value;
    this.setData({
      ['formData.duration']: this.data.durationOptions[index]
    }, () => {
      this.validateForm();
    });
  },

  onCategoryChange(e) {
    const index = e.detail.value;
    const options = this.data.taskCategories || [];
    const item = options[index];
    if (!item) {
      return;
    }
    this.setData({
      'formData.category': item.name,
      'formData.categoryId': item.id
    }, () => {
      this.validateForm();
    });
  },

  onDateChange(e) {
    this.setData({
      ['formData.deadlineDate']: e.detail.value
    }, () => {
      this.updateDeadlineDisplay();
      this.validateForm();
    });
  },

  onHourChange(e) {
    this.setData({
      ['formData.deadlineHour']: e.detail.value
    }, () => {
      this.updateDeadlineDisplay();
      this.validateForm();
    });
  },

  updateDeadlineDisplay() {
    const formData = this.data.formData || {};
    const date = formData.deadlineDate;
    const time = formData.deadlineHour;
    const display = date && time ? `${date} ${time}` : '';
    this.setData({
      ['formData.time']: display
    });
  },

  validateForm() {
    const { taskType, formData } = this.data;
    let isValid = false;

    if (taskType === 'general') {
      if (formData.title && formData.desc && formData.category && formData.time && formData.location && formData.contact) {
        isValid = true;
      }
    } else if (taskType === 'task') {
      if (formData.title && formData.desc && formData.category && formData.price && formData.time && formData.location && formData.contact) {
        isValid = true;
      }
    }

    this.setData({
      canSubmit: isValid
    });
    return isValid;
  },

  onSubmit() {
    if (!this.data.canSubmit) {
        // Find the first missing required field to show error
        this.showValidationError();
        return;
    }

    const { taskType, formData } = this.data;
    
    const mappedType = taskType === 'general' ? 'normal' : 'task';

    const deadline =
      formData.deadlineDate && formData.deadlineHour
        ? this.buildDeadlineDateTime(formData.deadlineDate, formData.deadlineHour)
        : (taskType === 'general' ? this.getFutureDate(1) : null);

    const requestData = {
      type: mappedType,
      title: formData.title,
      description: formData.desc || formData.title,
      contactInfo: formData.contact,
      location: formData.location || "线上",
      latitude: formData.latitude,
      longitude: formData.longitude,
      publisherId: app.globalData.userInfo ? (app.globalData.userInfo.userId || app.globalData.userInfo.id) : null,
      
      // Fields specific to type
      ...(taskType === 'general'
        ? {
            categoryId: formData.categoryId,
            reward: 0,
            deadline
          }
        : {
            categoryId: formData.categoryId,
            reward: Number(formData.price),
            deadline
          })
    };

    if (!requestData.publisherId) {
        wx.showToast({
            title: '未登录，请先登录',
            icon: 'none'
        });
        return;
    }

    wx.showLoading({ title: '发布中...' });

    createTask(requestData).then(res => {
      wx.hideLoading();
      if (res.statusCode === 200 && (res.data.code === 200 || res.data.code === 0)) {
        wx.showToast({
          title: '发布成功',
          icon: 'success',
          duration: 1500
        });

        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else {
        wx.showToast({
          title: res.data.message || '发布失败',
          icon: 'none'
        });
      }
    }).catch(err => {
      wx.hideLoading();
      console.error('Create task failed', err);
      wx.showToast({
        title: '网络错误',
        icon: 'none'
      });
    });
  },

  formatDateForBackend(timeStr) {
    // 支持两种格式：
    // 1) "HH:mm" 旧格式，仅时间
    // 2) "YYYY-MM-DD" 新格式，仅日期
    if (!timeStr) {
      return null;
    }

    let date;

    if (timeStr.indexOf('-') !== -1) {
      // 日期格式：YYYY-MM-DD
      const parts = timeStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        date = new Date(year, month, day, 23, 59, 0);
      }
    } else {
      // 时间格式：HH:mm
      const now = new Date();
      const [hours, minutes] = timeStr.split(':');
      now.setHours(hours);
      now.setMinutes(minutes);
      now.setSeconds(0);
      if (now < new Date()) {
        now.setDate(now.getDate() + 1);
      }
      date = now;
    }

    if (!date) {
      return null;
    }

    return this.formatDate(date);
  },

  getFutureDate(days) {
      const date = new Date();
      date.setDate(date.getDate() + days);
      return this.formatDate(date);
  },

  formatDate(date) {
      const pad = n => n < 10 ? '0' + n : n;
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  },

  buildDeadlineDateTime(dateStr, timeStr) {
    if (!dateStr || !timeStr) {
      return null;
    }
    const dateParts = dateStr.split('-');
    if (dateParts.length !== 3) {
      return null;
    }
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1;
    const day = parseInt(dateParts[2], 10);
    const timeParts = timeStr.split(':');
    const hour = parseInt(timeParts[0], 10);
    const date = new Date(year, month, day, isNaN(hour) ? 0 : hour, 0, 0);
    return this.formatDate(date);
  },

  showValidationError() {
    const { taskType, formData } = this.data;
    let errorMsg = '';
    let errorField = '';

    if (taskType === 'general') {
      if (!formData.title) { errorMsg = '请输入互助标题'; errorField = 'field-title'; }
      else if (!formData.desc) { errorMsg = '请输入互助描述'; errorField = 'field-desc'; }
      else if (!formData.category) { errorMsg = '请选择互助分类'; errorField = 'field-category'; }
      else if (!formData.time) { errorMsg = '请选择截止时间'; errorField = 'field-time'; }
      else if (!formData.location) { errorMsg = '请选择服务地点'; errorField = 'field-location'; }
      else if (!formData.contact) { errorMsg = '请输入联系方式'; errorField = 'field-contact'; }
    } else {
      if (!formData.title) { errorMsg = '请输入任务标题'; errorField = 'field-title'; }
      else if (!formData.desc) { errorMsg = '请输入任务描述'; errorField = 'field-desc'; }
      else if (!formData.category) { errorMsg = '请选择任务分类'; errorField = 'field-category'; }
      else if (!formData.price) { errorMsg = '请输入酬金'; errorField = 'field-price'; }
      else if (!formData.time) { errorMsg = '请选择截止时间'; errorField = 'field-time'; }
      else if (!formData.location) { errorMsg = '请选择服务地点'; errorField = 'field-location'; }
      else if (!formData.contact) { errorMsg = '请输入联系方式'; errorField = 'field-contact'; }
    }

    if (errorMsg) {
      wx.showToast({
        title: errorMsg,
        icon: 'none'
      });
      if (errorField) {
          this.setData({
              scrollId: errorField
          });
      }
    }
  }
});
