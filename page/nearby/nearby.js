const util = require('../../utils/util.js');
const server = require('../../utils/server.js');
const storage = require('../../utils/storage.js');

Page({
  // 是否已经允许获取用户定位
  canGetLocation: true,
  onLoad() {
    this.getMyLocationlines();
  },
  // 获取我的位置
  getMyLocationlines() {
    wx.showLoading({ title: '刷新中' });
    //重新定位
    util.getlocation(Location => {
      // self.setData({ address: myLocation.address });
      let { longitude, latitude } = Location;
      // 获取周围站台列表
      server.getAroundStation(longitude, latitude, (nearestStation, otherStation) => {
        this.setData({ nearestStation, otherStation });
        // // 获取最近站台线路列表
        server.getLineList(longitude, latitude, nearestStation.name, lineDetail => {
          // 最多显示3条线路信息
          const lineList = (lineDetail.length > 3 ? lineDetail.slice(0, 3) : lineDetail).map(line=>{
          return { 
            keyName: line.line.name,
            line_id: line.line.line_id,
            name: line.line.name , 
            starting_station: line.line.start_station_name, 
            terminal_station: line.line.terminal_station_name
            }
          });

          this.setData({ lineList });
          wx.hideLoading();
        });
      });
    });
  },
  onShow() {
    // 强制用户必须允许访问位置信息
    if (!this.canGetLocation) {
      wx.getSetting({
        success: res => {
          if (!res.authSetting['scope.userLocation']) {
            wx.openSetting();
          } else {
            this.canGetLocation = true;
            this.getMyLocationlines();
          }
        },
      });
    }
  },
  // 下拉刷新
  onPullDownRefresh: function () {
    // 显示导航栏loading
    wx.showNavigationBarLoading();
    // 调用接口加载数据
    this.getMyLocationlines();
    // 隐藏导航栏loading
    wx.hideNavigationBarLoading();
    // 当处理完数据刷新后，wx.stopPullDownRefresh可以停止当前页面的下拉刷新
    wx.stopPullDownRefresh();
  },
  // 显示线路列表
  showLineList(e) {
    const { name } = e.currentTarget.dataset;
    // 记录最近使用记录
    // storage.addRecently({ keyName: name, name, isStation: true });
    // 显示线路列表页
    wx.navigateTo({ url: `/page/lineList/lineList?name=${ name}` });
  },
});
