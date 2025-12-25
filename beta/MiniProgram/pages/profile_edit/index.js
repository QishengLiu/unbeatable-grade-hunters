const app = getApp();
const { updateUserProfile, getUserProfile, uploadToOSS } = require('../../utils/api');

Page({
  data: {
    userInfo: {},
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
    avatarChanged: false,
    tempAvatarUrl: '',
    statusBarHeight: 20
  },

  onLoad() {
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight
    });

    const globalUser = app.globalData.userInfo || {};
    if (globalUser && Object.keys(globalUser).length > 0) {
      this.setData({
        userInfo: {
          avatar: globalUser.avatarUrl || globalUser.avatar || '/image/默认头像.jpg',
          username: globalUser.username || globalUser.name || '',
          phone: globalUser.phone || '',
          email: globalUser.email || ''
        }
      });
    }

    getUserProfile().then(res => {
      if (res.statusCode === 200 && (res.data.code === 200 || res.data.code === 0)) {
        const data = res.data.data || {};
        this.setData({
          userInfo: {
            avatar: data.avatarUrl || data.avatar || '/image/默认头像.jpg',
            username: data.username || data.name || '',
            phone: data.phone || '',
            email: data.email || ''
          }
        });
        app.globalData.userInfo = { ...(app.globalData.userInfo || {}), ...data };
      }
    }).catch(() => {});
  },

  onBack() {
    wx.navigateBack();
  },

  chooseAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        wx.showLoading({ title: '上传中...' });
        uploadToOSS(tempFilePath).then(data => {
          wx.hideLoading();
          if (data && (data.code === 200 || data.code === 0) && data.url) {
            this.setData({
              'userInfo.avatar': data.url,
              tempAvatarUrl: data.url,
              avatarChanged: true
            });
            wx.showToast({ title: '上传成功', icon: 'success' });
          } else {
            wx.showToast({ title: (data && data.message) || '上传失败', icon: 'none' });
          }
        }).catch(() => {
          wx.hideLoading();
          wx.showToast({ title: '上传失败', icon: 'none' });
        });
      }
    });
  },

  onNicknameInput(e) {
    this.setData({
      'userInfo.username': e.detail.value
    });
  },

  onPhoneInput(e) {
    this.setData({
      'userInfo.phone': e.detail.value
    });
  },

  onEmailInput(e) {
    this.setData({
      'userInfo.email': e.detail.value
    });
  },

  onOldPasswordInput(e) {
    this.setData({ oldPassword: e.detail.value });
  },

  onNewPasswordInput(e) {
    this.setData({ newPassword: e.detail.value });
  },

  onConfirmPasswordInput(e) {
    this.setData({ confirmPassword: e.detail.value });
  },

  saveChanges() {
    const { userInfo, oldPassword, newPassword, confirmPassword, avatarChanged, tempAvatarUrl } = this.data;

    const updateData = {};
    const originalUserInfo = app.globalData.userInfo || {};

    if (userInfo.username && userInfo.username !== originalUserInfo.username) {
        updateData.name = userInfo.username;
        updateData.username = userInfo.username;
    }

    if (newPassword || oldPassword || confirmPassword) {
      if (!oldPassword) {
        wx.showToast({ title: '请输入旧密码', icon: 'none' });
        return;
      }
      if (!newPassword) {
        wx.showToast({ title: '请输入新密码', icon: 'none' });
        return;
      }
      if (newPassword !== confirmPassword) {
        wx.showToast({ title: '两次密码不一致', icon: 'none' });
        return;
      }
      updateData.oldPassword = oldPassword;
      updateData.newPassword = newPassword;
    }

    if (avatarChanged) {
        updateData.avatarUrl = tempAvatarUrl;
    }

    if (userInfo.phone && userInfo.phone !== originalUserInfo.phone) {
        updateData.phone = userInfo.phone;
    }

    if (userInfo.email && userInfo.email !== originalUserInfo.email) {
        updateData.email = userInfo.email;
    }

    if (Object.keys(updateData).length === 0) {
        wx.showToast({ title: '没有修改', icon: 'none' });
        return;
    }

    wx.showLoading({ title: '保存中...' });

    updateUserProfile(updateData).then(res => {
        wx.hideLoading();
        if (res.statusCode === 200 && res.data.code === 200) {
             wx.showToast({ title: '保存成功', icon: 'success' });
             
             // Update global data
             if (app.globalData.userInfo) {
                 app.globalData.userInfo = { ...app.globalData.userInfo, ...userInfo };
                 if (avatarChanged) app.globalData.userInfo.avatar = tempAvatarUrl;
             }

             setTimeout(() => {
                wx.navigateBack();
             }, 1500);
        } else {
             wx.showToast({ title: res.data.message || '保存失败', icon: 'none' });
        }
    }).catch(err => {
        wx.hideLoading();
        wx.showToast({ title: '请求失败', icon: 'none' });
    });
  }
});
