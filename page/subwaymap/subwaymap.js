// page/subwaymap/subwaymap.js
const ctx = wx.createCanvasContext('myCanvas')
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // ctx.setFillStyle("red");
    // // console.log(line.labelp[0].x, line.labelp[0].y);
    // ctx.fillRect(0, 0, 50,40);
    // ctx.draw()
   
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.request({
      url: 'https://gongjiao.xiaojukeji.com/api/transit/line/getsubway',
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        imei: '5925495961739758082',
        token: 't49GcWlrGxJ0d2tGQtC9zA_MYpKZXtCpEcwSEJk1jSpUjTsOAyEMRO8ytQucZY3t25B_KiJQlAJx91hKte28p3kTFQ4QzvCTci7ZipjJxplwhSvhBp941zG-rccSjnCYwoTRPv0SfF-E-xE94pZ342SJddMoPP-hFzytXwAAAP__',
        lng: '39.9732864786721',
        lat: '39.9732864786721',
        city: 1
      },
      success: function (res) {
        // console.log(res);
        var linedatas = res.data.data.l;
        console.log(linedatas);
        linedatas.map(line => {
          ctx.setFillStyle('rgb(' + line.color + ')');
          ctx.setStrokeStyle('rgb(' + line.color + ')')
          ctx.beginPath()
          ctx.setLineWidth(5)
          ctx.moveTo(line.p[0].x, line.p[0].y)

          var i = 0;
          line.p.map(p1 => {
            if (i != 0) {
              ctx.lineTo(p1.x, p1.y);
            }
            i++;
          });


          ctx.stroke()


          // console.log(line.labelp[0].x, line.labelp[0].y);
          // console.log(line.name.lenght)
          ctx.fillRect(line.labelp[0].x, line.labelp[0].y, 40, 10);


          ctx.setFillStyle('black')
          ctx.setFontSize(8)
          ctx.fillText(line.name, line.labelp[0].x, line.labelp[0].y)
          // ctx.draw()
        });
        ctx.draw();
      }

    });
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})