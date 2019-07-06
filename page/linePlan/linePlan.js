const getLinePlan = require('../../utils/server.js').getLinePlan;

const globalData = getApp().globalData;

Page({
  data: {
    start: '',
    terminal: '',
    showModal: false,
    travelModel: '最佳路线',
    travelId: 4
  },
  // 本地数据
  localData: {
    myCity: '',
    start: {},
    terminal: {},
    travelModel: '最佳路线',
    travelId: 4
  },
  onLoad(options) {
    // 记录当前城市名
    this.localData.myCity = globalData.myCity || '';
    // 获取当前位置，默认起点就是当前位置
    const startLocation = globalData.myLocation || {};
    if (startLocation.hasOwnProperty('longitude') && startLocation.hasOwnProperty('latitude')) {
      this.localData.start = startLocation;
      this.setData({ start: '我的位置' });
    }
  },
  // 获取起点位置
  getStartLocation() {
    wx.chooseLocation({
      success: res => {
        const { longitude, latitude, name } = res;
        this.localData.start = { longitude, latitude };
        this.setData({ start: name });
      },
    });
  },
  // 获取终点位置
  getTerminalLocation() {
    wx.chooseLocation({
      success: res => {
        const { longitude, latitude, name } = res;
        this.localData.terminal = { longitude, latitude };
        this.setData({ terminal: name });
      },
    });
  },
  // 切换起点和终点
  switchStartTerminal() {
    // 切换起点和终点显示的内容
    const startValue = this.data.start;
    const terminalValue = this.data.terminal;
    this.setData({ start: terminalValue, terminal: startValue });
    // 切换起点和终点坐标
    let { start, terminal } = this.localData;
    [start, terminal] = [terminal, start];
    this.localData.start = start;
    this.localData.terminal = terminal;
  },
  // 获取线路规划
  getLinePlan() {
    const startName = this.data.start;
    const terminalName = this.data.terminal;
    const strategy = this.data.travelId;
    
    // 确认起点和终点不为空
    if (startName && terminalName) {
      const { start, terminal, myCity } = this.localData;
      const startLocation = `${start.longitude},${start.latitude}`;
      const terminalLocation = `${terminal.longitude},${terminal.latitude}`;
      // 确定起点和终点经纬度不为空
      if (startLocation && terminalLocation) {
        // 确定起点和终点不相同
        if (startName === terminalName || startLocation === terminalLocation) {
          wx.showModal({
            title: '提示',
            content: '起点和终点不能相同',
            showCancel: false,
          });
        } else {
          getLinePlan(startLocation, terminalLocation, myCity, strategy , linePlans => {
            const data = JSON.stringify({ linePlans, start: startName, terminal: terminalName });
            wx.navigateTo({ url: `/page/linePlanResult/linePlanResult?data=${data}` });
          });
        }
      } else {
        wx.showModal({
          title: '提示',
          content: '请重新选择位置',
          showCancel: false,
        });
      }
    } else {
      wx.showModal({
        title: '提示',
        content: '输入不能为空',
        showCancel: false,
      });
    }
  },
  chooseway: function (e) {
    const no = e.currentTarget.dataset.no;
    const name = e.currentTarget.dataset.name;
    this.localData.travelModel = name;
    this.localData.travelId = this.data.travelId;
    this.setData({
      travelId: no
    });
  },
  /**
     * 弹窗
     */
  showDialogBtn: function () {
    this.setData({
      showModal: true
    })
  },
  /**
   * 弹出框蒙层截断touchmove事件
   */
  preventTouchMove: function () {
  },
  /**
   * 隐藏模态对话框
   */
  hideModal: function () {
    this.setData({
      showModal: false
    });
  },
  /**
   * 对话框取消按钮点击事件
   */
  onCancel: function () {
    this.hideModal();
    this.setData({
      travelId: this.localData.travelId
    });
  },
  /**
   * 对话框确认按钮点击事件
   */
  onConfirm: function () {
    var that = this;
    this.hideModal();
    this.setData({
      travelModel: that.localData.travelModel
    });
  }
});
