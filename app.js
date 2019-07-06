var server = require('./utils/server');
App({
	onLaunch: function () {
		console.log('App Launch')
		var self = this;
		var rd_session = wx.getStorageSync('rd_session');
		console.log('rd_session', rd_session)
		if (!rd_session) {
			self.login();
		} else {
			wx.checkSession({
				success: function () {
					// 登录态未过期
					console.log('登录态未过期')
					self.rd_session = rd_session;
					self.getUserInfo();
				},
				fail: function () {
					//登录态过期
					self.login();
				}
			})
		}

    // 收藏数据和最近使用
    const collected = wx.getStorageSync(this.globalData.storageKey.collected);
    const recently = wx.getStorageSync(this.globalData.storageKey.recently);
    // 整理成Object
    if (collected) this.globalData.storageValue.collected = JSON.parse(collected);
    if (recently) this.globalData.storageValue.recently = JSON.parse(recently);
	},
	globalData: {
    // storage存储的键值
    storageKey: {
      collected: 'collected',
      recently: 'recently',
    },
    // storage存储的数据
    storageValue: {
      collected: { keyName: [], value: [] },
      recently: { keyName: [], value: [] },
    },
		hasLogin: false
	},
  rd_session: null,
	login: function() {
		var self = this;
		wx.login({
			success: function (res) {
				console.log('wx.login', res)
			}
		});
	},
	getUserInfo: function() {
		var self = this;
		wx.getUserInfo({
			success: function(res) {
				console.log('getUserInfo', res)
				self.globalData.userInfo = res.userInfo;
			}
		});
	}
})
