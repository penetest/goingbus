// page/me/me.js
const storage = require('../../utils/storage.js');
const collected = storage.getCollected();

Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.updateData();
  },
  // 更新数据
  updateData() {
    // console.log(collected.value);
    this.setData({ collectedList: collected.value });
  },
  // 取消收藏
  cancleCollection(e) {
    const index = e.detail.index;
    const keyName = collected.keyName[index];
    storage.deleteCollected(keyName);
    this.updateData();
  },
  // 清空收藏数据
  clearCollected() {
    wx.showModal({
      title: '提示',
      content: '确定清空收藏',
      confirmText: '确定',
      cancelText: '取消',
      success: res => {
        if (res.confirm) {
          storage.clearCollected();
          this.updateData();
        }
      },
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.updateData();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    // 显示导航栏loading
    wx.showNavigationBarLoading();
    // 调用接口加载数据
    // this.getMyLocationlines();
    // 隐藏导航栏loading
    wx.hideNavigationBarLoading();
    // 当处理完数据刷新后，wx.stopPullDownRefresh可以停止当前页面的下拉刷新
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {
  
  // }
})