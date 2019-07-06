const server = require('../../utils/server.js');
const globalData = getApp().globalData;
Page({
  onLoad(options) {
    wx.showLoading({ title: '加载中...' });
    let { longitude, latitude } = globalData.myLocation;
    const data = options;
    longitude = options.lng || longitude;
    latitude = options.lat || latitude;
    // 设置标题
    wx.setNavigationBarTitle({ title: data.name });
    // 获取线路列表
    server.getLineList(longitude, latitude, data.name, lineList => {
      // console.log(lineList)
      lineList = lineList.map(line => {
          return {
            keyName: line.line.name,
            line_id: line.line.line_id,
            name: line.line.name,
            starting_station: line.line.start_station_name,
            terminal_station: line.line.terminal_station_name
          }
        });
      this.setData({ lineList });
      wx.hideLoading();
    });
  },
});
