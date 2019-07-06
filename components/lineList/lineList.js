const storage = require('../../utils/storage.js');

Component({
  // 属性传值
  properties: {
    lineList: {
      type: Array,
      value: [],
    },
    showPrice: {
      type: Boolean,
      value: true,
    },
  },
  data: {
    isShowMap: false
  },
  methods: {
    // 显示线路详情
    showLineDetail(e) {
      const index = e.currentTarget.dataset.index;
      const item = this.properties.lineList[index];
      const { line_id, name } = item;
      // storage.addRecently({ keyName: name, line_id, name, isStation: false });
      wx.navigateTo({ url: `/page/line/line?name=${name}&line_id=${line_id}` });
    },
    cancleCollection(e) {
      const index = e.currentTarget.dataset.index;
      const detail = { index };
      this.triggerEvent('canclecollection', detail);
    },
  },
});
