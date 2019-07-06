// page/line/linemap/linemap.js
const globalData = getApp().globalData;
// var map;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    markers: [],
    polyline: [],
    scale: 12,
    direction: 0
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    let { longitude, latitude } = globalData.myLocation;

    console.log('options', options);
    var linename = options.linename;
    wx.setNavigationBarTitle({
      title: linename +"路线地图"
    })
    var via_stops = JSON.parse(options.via_stops);
    var polylines = JSON.parse(options.polyline);
    var points = [];
    // var circles = [];
    var markers = [];
    
    polylines.forEach(p =>{
      var lon = parseFloat(p.split(',')[0]);
      var lat = parseFloat(p.split(',')[1]);
      points.push({
        longitude: lon,
        latitude: lat,
        arrowLine: true
      });
    });

    via_stops.forEach((p , index) => {
      var lon = parseFloat(p.location.split(',')[0]);
      var lat = parseFloat(p.location.split(',')[1]);
      var iconurl ;
      var size = 10;
      if(index === 0)
      {
        iconurl = "/imgs/line/begin.png";
        size = 25;
      } else if (index === (via_stops.length -1)){
        iconurl = "/imgs/line/end.png";
        size = 25;
      }else{
        iconurl = "/imgs/line/stop.png";
      }
      markers.push({
        id: index,
        iconPath: iconurl,
        latitude: lat,
        label: { content: p.name, fontSize: 5 },
        longitude: lon,
        width: size,
        height: size
      });
    });


    wx.onCompassChange(function (res) {
      that.setData({ direction: res.direction });
    })

    // 设置当前位置图标，方向角度
    // markers.push({
    //     id: 3897,
    //     iconPath: "/imgs/index/location.png",
    //     longitude: longitude,
    //     latitude: longitude,
    //     rotate: that.data.direction,
    //     width: 30,
    //     height: 30
    //   });

    that.setData({
      longitude: longitude,
      latitude: latitude,
      polyline: [{
        points: points,
        color: "#0091ff",
        width: 3
      }],
      markers: markers,
      // circles: circles,
      include_points: points,
      show_location: true
    });


    // // 动态设置map的宽和高
    // wx.getSystemInfo({
    //   success: function (res) {
    //     console.log('getSystemInfo');
    //     console.log(res.windowWidth);
    //     that.setData({
    
    //       controls: [{
    //         id: 1,
    //         iconPath: "/imgs/index/location.png",
    //         position: {
    //           left: res.windowWidth / 2 - 8,
    //           top: res.windowWidth / 2 - 16,
    //           width: 30,
    //           height: 30
    //         },
    //         clickable: true
    //       }]
    //     })
    //   }
    // })
  },
  //获取中间点的经纬度
  getLngLat: function () {
    var that = this;
    this.mapCtx = wx.createMapContext("navi_map");
    this.mapCtx.getCenterLocation({
      success: function (res) {
        var longitude = res.longitude;
        var latitude = res.latitude;
        that.data.markers.push(
          {
            id: 3897,
            iconPath: "/imgs/index/location.png", 
            longitude: longitude, 
            latitude: longitude, 
            rotate: that.data.direction, 
            width: 30, 
            height: 30
          });

      }
    });
  }, 
  regionchange(e) {
    // console.log(e, this.data.scale);
    // 地图发生变化的时候，获取中间点，也就是用户选择的位置
    // if (e.type == 'end') {
      // this.getLngLat()
    // }
    // 地图放缩 设置 图标大小
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // if(!map){
    //   map = wx.createMapContext("navi_map", this)
    // }
    // var info = wx.getSystemInfoSync()
    // this.setData({
    //   controls:[{
    //     id:1,
    //     position:{
    //       left: info.windowWidth,
    //       top: info.windowHeight,
    //       width: 15,
    //       height: 15
    //     },
    //     clickable: true,
    //     iconPath: "/imgs/index/location.png",
    //   }]
    // });
  },
  // onControlclick: function(e){
  //   switch (e.controlId){
  //     case 1: map.moveToLocation()
  //   }
  // },
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