var app = getApp();
var server = require('../../utils/server');
const storage = require('../../utils/storage.js');
const globalData = getApp().globalData;

Page({
	data: {
		filterId: 1,
		searchWords: '',
		placeholder: '',
    suggests: []
	},
  //事件处理函数
  getSug: function (e) {
    wx.request({
      url: 'https://gongjiao.xiaojukeji.com/api/transit/search/suggest',
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        imei: 'general_app',
        token: 't49GcWlrGxJ0d2tGQtC9zA_MYpKZXtCpEcwSEJk1jSpUjTsOAyEMRO8ytQucZY3t25B_KiJQlAJx91hKte28p3kTFQ4QzvCTci7ZipjJxplwhSvhBp941zG-rccSjnCYwoTRPv0SfF-E-xE94pZ342SJddMoPP-hFzytXwAAAP__',
        lng: '116.29319741622',
        lat: '40.041375934019',
        city: 1,
        filter: 'poi,line,banner',
        pattern: e.detail.value
      },
      success: function (res) {

        if (res.data.matches && res.data.matches.length) {
          // console.log(res.data.matches);
          this.setData({ suggests: res.data.matches });
        }
      }.bind(this)
    });
  },
	onLoad: function () {
		var self = this;
	},
  // 显示详情
  showDetail(e) {
    const line_id = e.currentTarget.dataset.line_id;
    const name = e.currentTarget.dataset.name;
    // 使当前项置顶
    // storage.addRecently({ keyName: name, line_id, name, isStation: false });
    // 导航到相应页面
    // const data = JSON.stringify({ id, name });
    const url = `/page/line/line?name=${name}&line_id=${line_id}`;
    wx.navigateTo({ url });
  },
  
});

