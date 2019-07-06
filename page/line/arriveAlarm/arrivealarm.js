// page/line/arriveAlarm/arrivealarm.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    starttime: '12:01',
    endtime: '12:01',
    array: ['亮屏', '震动'],
    index: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // var via_stops = JSON.parse(options.via_stops);
    // var stops = via_stops.map(stop=>stop.name);
    // this.setData({
    //   stops
    // });
    var stop = JSON.parse(options.stop);
    wx.setNavigationBarTitle({ title: "到站提醒设置" });
    this.setData({
      stopname:stop.name,
      linename:options.linename,
      starting_station: options.starting_station,
      terminal_station: options.terminal_station,
      first_time: options.first_time,
      last_time: options.last_time,
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
  onShow: function () {
  
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
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },
  bindStartTimeChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      starttime: e.detail.value
    })
  },
  bindEndTimeChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      endtime: e.detail.value
    })
  },
  bindPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      index: e.detail.value
    })
  },
  // bindStopChange: function (e) {
  //   console.log('picker发送选择改变，携带值为', e.detail.value)
  //   this.setData({
  //     stop: e.detail.value
  //   })
  // },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})