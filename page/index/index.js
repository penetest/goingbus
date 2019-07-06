var app = getApp();
const util = require('../../utils/util.js');
const globalData = getApp().globalData;
const storage = require('../../utils/storage.js');
const recently = storage.getRecently();

Page({
	data: {
		filterId: 1,
		address: '定位中…',
    day :["今天", "明天", "后天"],
  },
	onLoad: function () {
    this.updateData();
    this.refreshLocation();
	},
  refreshLocation(){
    this.setData({ myLocation: '正在定位中...' });
    var self = this;
    util.getlocation(Location => {
      self.setData({ address: Location.address });
      let { longitude, latitude } = Location;
      util.getWeather(longitude, latitude, weather => {
        var date = weather.daily_forecast[0].date.replace("-", "年").replace("-", "月")+"日";
        var tmp = weather.now.tmp;
        var txt = weather.now.cond.txt;
        var code = weather.now.cond.code;
        var qlty = weather.aqi.city.qlty;
        var dir = weather.now.wind.dir;
        var sc = weather.now.wind.sc;
        var hum = weather.now.hum;
        var fl = weather.now.fl;
        self.setData({
          date:date,
          tmp: tmp,
          txt: txt,
          code: code,
          qlty: qlty,
          dir: dir,
          sc: sc,
          hum: hum,
          fl: fl,
          daily_forecast: weather.daily_forecast
        })
      });
    });
  },
  toNearby(){
    var self = this;
    util.getlocation(Location=>{
      self.setData({ address: Location.address });
      let { longitude, latitude } = Location;
      util.getWeather(longitude, latitude, weather => {
        var date = weather.daily_forecast[0].date.replace("-", "年").replace("-", "月") + "日";
        var tmp = weather.now.tmp;
        var txt = weather.now.cond.txt;
        var code = weather.now.cond.code;
        var qlty = weather.aqi.city.qlty;
        var dir = weather.now.wind.dir;
        var sc = weather.now.wind.sc;
        var hum = weather.now.hum;
        var fl = weather.now.fl;
        self.setData({
          date: date,
          tmp: tmp,
          txt: txt,
          code: code,
          qlty: qlty,
          dir: dir,
          sc: sc,
          hum: hum,
          fl: fl,
          daily_forecast: weather.daily_forecast
        })
      });
      wx.openLocation({
        latitude: latitude,
        longitude: longitude,
        scale: 18,
        name: '当前位置',
        address: Location.address,
      })
    });
    
    // wx.getLocation({
    //   //type: 'wgs84',
    //   type: 'gcj02',
    //   success: function (res) {
    //     const longitude = res.longitude;
    //     const latitude = res.latitude;
    //     globalData.myLocation = { longitude, latitude };
    //     util.getLocationDescription(longitude, latitude, (myCity, myLocation) => {
    //       globalData.myCity = myCity;
    //       self.setData({ address: myLocation });
    //     });

    //   },
    //   fail: function (e) {
    //     console.log(e);
    //     wx.showModal({
    //       title: '提示',
    //       content: '\'上车走了\' 获取你的地理位置',
    //       success: function (res) {
    //         if (res.confirm) {
    //           wx.navigateTo({ url: '/page/auth/auth' });
    //         }
    //       }
    //     })
    //   }
    // })
  },
  onShow() {
    this.updateData();
  },
  // 更新数据
  updateData() {
    this.setData({ recentlyList: recently.value });
  },
  // 显示详情
  showDetail(e) {
    const index = e.currentTarget.dataset.index;
    const { line_id, name, isStation } = this.data.recentlyList[index];
    // 使当前项置顶
    // storage.addRecently({ keyName: name, line_id, name, isStation });
    // 导航到相应页面
    // const data = JSON.stringify({ id, name });
    const url = `/page/${isStation ? 'lineList/lineList' : 'line/line'}?name=${name}&line_id=${line_id}`;
    wx.navigateTo({ url });
  },
  // 删除该项目
  deleteItem(e) {
    const index = e.currentTarget.dataset.index;
    const keyName = recently.keyName[index];
    storage.deleteRecently(keyName);
    this.updateData();
  },
  // 清空最近使用记录
  clearRecently() {
    wx.showModal({
      title: '提示',
      content: '确定清空记录',
      confirmText: '确定',
      cancelText: '取消',
      success: res => {
        if (res.confirm) {
          storage.clearRecently();
          this.updateData();
        }
      },
    });
  },
	tapSearch: function () {
    wx.navigateTo({ url: '/page/search/search'});
	},
  // 下拉刷新
  onPullDownRefresh: function () {
    // 显示导航栏loading
    wx.showNavigationBarLoading();
    // 调用接口加载数据
    // this.getMyLocationlines();
    this.refreshLocation();
    // 隐藏导航栏loading
    wx.hideNavigationBarLoading();
    // 当处理完数据刷新后，wx.stopPullDownRefresh可以停止当前页面的下拉刷新
    wx.stopPullDownRefresh();
  },

});

