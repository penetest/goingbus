Page({
  onLoad(options) {
    const data = JSON.parse(options.data);
    const { start, terminal, detailTransition } = JSON.parse(options.data);
    // console.log(detailTransition)
    this.setData({ start, terminal, detailTransition });
  },
  /**
  * 用户点击右上角分享
  */
  onShareAppMessage: function () {
    wx.showShareMenu({
      withShareTicket: true
    })
  }
});
