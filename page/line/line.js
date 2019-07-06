// const getLineDetail = require('../../utils/util.js').getLineDetail;
const util = require('../../utils/util.js');
const server = require('../../utils/server.js');
const storage = require('../../utils/storage.js');
const collected = storage.getCollected();

const globalData = getApp().globalData;

Page({
  // 收藏需要的数据
  collectedData: {},
  data:{
    // text:"这是一个页面"
    lineData: {},
    currentId: 1,
    firstComeTips:'',
    buss: {},
    busc: {}
  },
  localData:{
    linename: '',
    selBDir: '',
    lineids: [],
    currentId: 1
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    wx.showLoading({ title: '加载中...' });
   
    var that = this;
    // console.log('options',options);
    // console.log('options', storage.getCollectedByKeyName(options.name));
    that.localData.linename = options.name;
    wx.setNavigationBarTitle({
      title: options.name
    })
     // 是否被收藏
    if (storage.hasCollected(options.name) || storage.hasRecently(options.name))
    {
      var item;
      if ( storage.hasRecently(options.name) ) {
        item = storage.getRecentlyByKeyName(options.name);
        // console.log("最近使用了", item);
      }else {
        // console.log("收藏了");
        item = storage.getCollectedByKeyName(options.name);
      }

      that.setData({ isCollected: storage.hasCollected(options.name), currentId: item.stopid });

      that.localData.currentId = item.stopid;
      that.localData.selBDir = item.selBDir;
      that.localData.lineids = item.lineids;

      this.getLineData(options.line_id);
      // wx.hideLoading();
    }else{
      this.setData({ isCollected: false });
      util.getLineId(options.name, datas => {
        datas.map(item => this.localData.lineids.push({
            startname:item.startname,
            endname: item.endname,
            lineid: item.lineid
        })
        );
        this.getLineData(options.line_id);
        // wx.hideLoading();
      });
    }
    // this.getLineData(options.line_id);
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
  },
  //切换方向
  ballClickEvent: function (e) {
    wx.showLoading({ title: '加载中...' });
    var line_id = e.currentTarget.dataset.no
    // console.log(line_id);
    this.getLineData(line_id);
  },
  // 点击某一站
  ClickStop: function (e) {
    wx.showLoading({ title: '加载中...' });
    // console.log(e);
    var that = this;
    var id = e.currentTarget.dataset.no;
    that.setData({
      currentId: id
    });
    that.localData.currentId = id;
    this.getRealTimeDatas();
  },
  // 下拉刷新
  onPullDownRefresh: function () {
    // 显示导航栏loading
    wx.showNavigationBarLoading();
    // 调用接口加载数据
    this.getRealTimeDatas();
    // 隐藏导航栏loading
    wx.hideNavigationBarLoading();
    // 当处理完数据刷新后，wx.stopPullDownRefresh可以停止当前页面的下拉刷新
    wx.stopPullDownRefresh();
  },
  getLineData: function (line_id) {
    var that = this;
    //获取线路详情
    server.getLineDetail(line_id, metrobus =>{
      console.log(metrobus)
      if(metrobus) {
        that.setData({
          lineData: metrobus
        });
      //  console.log(that.localData.lineids);
        var lineidk = that.localData.lineids.map(item => {
          if (item.startname ===metrobus.starting_station && item.endname === metrobus.terminal_station) { 
            return item.lineid;
            } 
        }).filter(item => typeof (item) !== "undefined"); 
        
        that.localData.selBDir = lineidk[0];

        var line_id = metrobus.line_id;
        var name = metrobus.name;
        var starting_station = metrobus.starting_station;
        var terminal_station = metrobus.terminal_station;
        var keyName = name;
        this.collectedData = { keyName: name, line_id, name, starting_station, terminal_station, selBDir: lineidk[0], stopid: 2, lineids: this.localData.lineids, isStation: false};
      
        this.getRealTimeDatas();

      }
    });
        // complete: function () {
        //   if (that.timeout) {
        //     clearTimeout(that.timeout)
        //   }
        //   // 页面自动刷新，30秒一次
        //   if (getCurrentPages()[0] == that) {
        //     that.timeout = setTimeout(that.getRealTimeDatas, 30 * 1000);
        //   }
        // }
    // );
  },
  getRealTimeDatas: function(){
    var that = this;
    util.getRealTimeLineInfo(that.localData.linename, that.localData.selBDir, lineinfo => {
      that.setData({
        firstComeTips: lineinfo.firstComeTips,
        buss: lineinfo.buss,
        busc: lineinfo.busc
      });
      wx.hideLoading();
    }, that.localData.currentId + 1);
    this.collectedData.stopid = that.localData.currentId;
    //  若是收藏了，更新缓存
    if (this.data.isCollected) {
      storage.deleteCollected(this.collectedData.keyName);
      storage.addCollected(this.collectedData);
    }

  },
  onHide:function(){
    // 页面隐藏
    storage.addRecently(this.collectedData);
  },
  //页面卸载
  onUnload:function(){
    if (this.timeout) {
      clearTimeout(this.timeout)
    }
    storage.addRecently(this.collectedData);
  },
  // 收藏
  collectLine: function() {
    if (this.data.isCollected) {
      // 移除数据
      this.setData({ isCollected: false });
      wx.showToast({
        title: '取消收藏!',
        icon: 'success'
      });
      
      storage.deleteCollected(this.collectedData.keyName);
    } else {
      // 保存数据
      this.setData({ isCollected: true });
      storage.addCollected(this.collectedData);
      wx.showToast({
        title: '收藏成功!',
        icon: 'success'
      });
    }
  },
  //上车了
  goBus:function(){

  },
  //同站路线
  sameStopLine:function(){
    var stop = this.data.lineData.via_stops[this.data.currentId];
    var name = stop.name;
    var lng = stop.location.split(",")[0];
    var lat = stop.location.split(",")[1];
    wx.navigateTo({ url: `/page/lineList/lineList?name=${name}&lng=${lng}&lat=${lat}` });
  },
  //到站提醒
  arriveStop:function(){
    if (this.data.isSetAlarm) {
      // 移除数据
      this.setData({ isSetAlarm: false });
      // wx.navigateTo({ url: '/page/line/linemap/linemap?linename=' + this.localData.linename + '&via_stops=' + JSON.stringify(this.data.lineData.via_stops) + "&polyline=" + JSON.stringify(this.data.lineData.polyline) });
    } else {
      // 保存数据
      this.setData({ isSetAlarm: true });
      wx.navigateTo({
        url: '/page/line/arriveAlarm/arrivealarm?stop=' + JSON.stringify(this.data.lineData.via_stops[this.data.currentId])
          + '&linename=' + this.localData.linename + '&starting_station=' + this.data.lineData.starting_station + '&terminal_station=' + this.data.lineData.terminal_station + '&first_time=' + this.data.lineData.first_time + '&last_time=' + this.data.lineData.last_time
      } );
    }
    wx.vibrateLong();
  },
  //地图路线
  linemap:function(){
    console.log(this.data.lineData)
    wx.navigateTo({ url: '/page/line/linemap/linemap?linename=' + this.localData.linename + '&via_stops=' + JSON.stringify(this.data.lineData.via_stops) + "&polyline=" + JSON.stringify(this.data.lineData.polyline)} );
  },
   /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    wx.showShareMenu({
      withShareTicket: true
    })
  }
  
})