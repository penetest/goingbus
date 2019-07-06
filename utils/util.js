const amapFile = require('../libs/amap-wx.js');
const config = require('./config.js');
const globalData = getApp().globalData;

// 实例化高德地图api
const myAmapFun = new amapFile.AMapWX({ key: config.key.sdk });

//天气信息
function getWeather(longitude, latitude, callback){
  // wx.request({
    // url: "https://restapi.amap.com/v3/weather/weatherInfo",
    // data: {
    //   key: config.key.sdk, 
    //   city: "110108", 
    //   extensions: "all",
    //   s: "rsx", 
    //   platform: "WXJS", 
    //   appname: config.key.sdk, 
    //   sdkversion: "1.2.0", 
    //   logversion: "2.0" 
    // }, 
    // method: "GET", 
    // header: { "content-type": "application/json" },
  // myAmapFun.getWeather({
  var url = "https://free-api.heweather.com/v5/weather"
  var params = {
    city: `${longitude},${latitude}`,
    key: "894fc2a749104d679fa022c3e71afe83"
  }
  wx.request({
    url: url,
    data: params,
    success: function (res) {
      // console.log(res);
      if (res.data.HeWeather5.length > 0){
       callback(res.data.HeWeather5[0]);
      }else{
        failHandler(() => getWeather(longitude, latitude, callback));
      }
      //成功回调
    },
    fail: function (info) {
      //失败回调
      failHandler(() => getWeather(longitude, latitude, callback));
      // console.log(info)
    }
  })
}

//获取当前地理信息
function getlocation(callback){

  wx.getLocation({
    //type: 'wgs84',
    type: 'gcj02',
    success: function (res) {
      const longitude = res.longitude;
      const latitude = res.latitude;
      globalData.myLocation = { longitude, latitude };
      getLocationDescription(longitude, latitude, (myCity, myLocation) => {
        globalData.myCity = myCity;
        // globalData.myLocation = myLocation;
        callback({ address: myLocation, longitude, latitude });
      });

    },
    fail: function (e) {
      // console.log(e);
      wx.showModal({
        title: '提示',
        content: '\'上车走了\' 获取你的地理位置',
        success: function (res) {
          if (res.confirm) {
            wx.navigateTo({ url: '/page/auth/auth' });
          }
        }
      })
    }
  })
}

// 根据经纬度获取城市名和地点描述
function getLocationDescription(longitude, latitude, callback) {
  myAmapFun.getRegeo({
    location: `${longitude},${latitude}`,
    success(data) {
      const myCity = data[0].regeocodeData.addressComponent.city;
      const myLocation = data[0].desc;
      callback(myCity, myLocation);
    },
    fail() {
      failHandler(() => getLocationDescription(longitude, latitude, callback));
    },
  });
}

// 根据经纬度获取最近站台和其他站台信息
function getAroundStation(longitude, latitude, callback) {
  myAmapFun.getPoiAround({
    // 限定查询结果只包含公交站台
    querykeywords: '公交站',
    querytypes: '150700',
    location: `${longitude},${latitude}`,
    success(data) {
      let aroundStation = data.poisData;
      // 限定最多显示6条数据
      if (aroundStation.length > 6) aroundStation = aroundStation.slice(0, 6);
      // 提取最近站台和其他站台的数据
      let nearestStation;
      const otherStation = [];
      aroundStation.forEach((item, index) => {
        const { distance, id, name } = item;
        const stationInfo = { distance, id, name: name.replace('(公交站)', '') };
        if (index === 0) nearestStation = stationInfo;
        else otherStation.push(stationInfo);
      });
      callback(nearestStation, otherStation);
    },
    fail() {
      failHandler(() => getAroundStation(longitude, latitude, callback));
    },
  });
}

// 根据公交站台id获取通过该站台的线路列表
function getLineList(id, callback) {
  getLineIds(id, lineIds => getLineDetail(lineIds, lineDetail => callback(lineDetail)));
}

// 根据公交站台id获取通过该站台的所有线路的id
function getLineIds(id, callback) {
  wx.request({
    url: config.url.getLineIds,
    data: { id },
    success(res) {
      const lineIds = res.data.poi_list[0].stations.businfo_lineids;
      callback(lineIds);
    },
    fail() {
      failHandler(() => getLineIds(id, callback));
    },
  });
}

// 根据线路id获取线路详细信息
function getLineDetail(lineIds, callback) {
  wx.request({
    url: config.url.getLineDetail,
    data: { lineids: lineIds },
    success(res) {
      // 提取关键信息
      const lineDetail = res.data.data.map(item => {
        const info = item.item[0];
        const name = item.name.replace(/\(.*\)/g, '');
        // 整理存储键值
        const keyName = `${info.areacode}_${name}`;
        // 整理票价
        const price = info.basic_price || 1;
        const toltal_price = info.total_price || 1;
        // 整理站点
        const stations = info.stations.map(item => item.name);
        // 返回线路信息
        return {
          keyName,
          price,
          toltal_price,
          stations,
          name,
          id: info.id,
          start: info.front_name,
          terminal: info.terminal_name,
        };
      });
      callback(lineDetail);
    },
    fail() {
      failHandler(() => getLineDetail(lineIds, callback));
    },
  });
}

// 根据输入的关键字获取搜索到的站台和线路
function getSearchResult(searchValue, myCity, callback) {
  // wx.request({
  //   url: config.url.getSearchResult,
  //   data: {
  //     key: config.key.web,
  //     keywords: searchValue,
  //     // 优先搜索当前城市数据
  //     city: myCity,
  //     // 限定只搜索站台和线路
  //     datatype: 'bus|busline',
  //   },
  myAmapFun.getInputtips({
    keywords: searchValue,
    // 优先搜索当前城市数据
    city: myCity,
    //仅返回指定城市数据
    citylimit: true,
    // 限定只搜索站台和线路
    datatype: 'bus|busline',
    success(res) {
      if (res.tips.length > 0) {
        const searchResult = res.tips.map(item => ({
          id: item.id,
          name: item.name,
          address: item.address,
          // isStation: item.typecode === '150700' || item.typecode === '150500' || item.typecode === '150501',
          isStation: item.typecode != '999901',
        }));
        callback(searchResult);
      } else {
        // 未搜索到结果
        wx.showModal({
          title: '未搜索到结果',
          content: '请检查输入的是否为合法的线路、站台名，重新搜索',
          showCancel: false,
        });
      }
    },
    fail() {
      failHandler(() => getSearchResult(searchValue, myCity, callback));
    },
  });
}

// 格式化时间
function formatTime(time) {
  if (time < 60) {
    return '1分钟';
  } else if (time < 3600) {
    return `${parseInt(time / 60)}分钟`;
  } else {
    const hour = parseInt(time / 3600);
    const second = parseInt((time % 3600) / 60);
    return `${hour}小时${second}分钟`;
  }
}

// 格式化距离
function formatDistance(distance) {
  if (distance < 1000) {
    return `${distance}m`;
  } else {
    return `${(distance / 1000).toFixed(1)}km`;
  }
}

// 根据起始和终止位置的经纬度获取公交路线
function getLinePlan(startLocation, terminalLocation, myCity, callback) {
  wx.showLoading({ title: '获取中' });
  myAmapFun.getTransitRoute({
    origin: startLocation,
    destination: terminalLocation,
    city: myCity,
    // 不坐地铁
    // strategy: 5,
    success(data) {
      // 存在数据，并且存在换乘方案
      if (data && data.transits.length > 0) {
        // 所有线路规划方案
        const linePlans = [];
        // 整理数据
        data.transits.forEach(transit => {
          // 假的花费，API很脑残，有价格返回字符串价格，没价格时返回个空数组。假定每辆公交花费1元，进行计算。
          let mockCost = 0;
          // 该规划的距离
          const distance = formatDistance(transit.distance);
          // 该规划的耗时
          const duration = formatTime(transit.duration);
          // 该规划步行距离
          const walkDistance = formatDistance(transit.walking_distance);
          // 该规划换乘线路
          const transitionLine = [];
          // 该规划详细换乘
          const detailTransition = [];
          transit.segments.forEach(segment => {
            const walking = segment.walking;
            // 本次步行距离
            const segmentWalkDistance = formatDistance(walking.distance);
            detailTransition.push({ isBus: false, segmentWalkDistance });
            // 公交线路
            if (segment.bus.buslines.length > 0) {
              // 增加假的花费
              mockCost++;
              // 整理公交路线
              const busLine = segment.bus.buslines[0];
              // 上车站台
              const getonStation = busLine.departure_stop.name;
              // 线路名称
              const lineName = busLine.name.replace(/\(.*\)/g, '');
              // 记录换乘的线路
              transitionLine.push(lineName);
              // 下一站台
              const nextStation = busLine.via_stops[0].name;
              // 下车站台
              const getoffStation = busLine.arrival_stop.name;
              detailTransition.push({
                isBus: true,
                getonStation,
                lineName,
                nextStation,
                getoffStation,
              });
            }
          });
          const getCost = transit.cost;
          // 真正花费
          const cost = Array.isArray(getCost) ? mockCost : parseInt(getCost);
          // 记录线路规划信息
          linePlans.push({
            cost,
            distance,
            duration,
            walkDistance,
            detailTransition,
            transitionLine: transitionLine.join(' → '),
          });
        });
        wx.hideLoading();
        callback(linePlans);
      } else {
        wx.showModal({
          title: '提示',
          content: '未查询到路线',
          showCancel: false,
        });
      }
    },
    fail() {
      failHandler(() => getLinePlan(startLocation, terminalLocation, myCity));
    },
  });
}

// 数据获取失败处理函数
function failHandler(callback) {
  wx.hideLoading();
  wx.showModal({
    title: '数据获取失败',
    content: '请检查当前设备网络状况，确定是否重新获取数据',
    cancelText: '暂不需要',
    confirmText: '重新获取',
    success(res) {
      res.confirm && callback();
    },
  });
}

//获取线路id
function getLineId(linename, callback){
  var linename = linename.split("路");
  if(linename.length > 1)
  {
   if(linename[1] === "快车"){
     linename = linename[0]+"快";
   }else{
     linename = linename[0];
   }
  }else{
    linename = linename[0];
  }
  console.log(linename);
  wx.request({
    url: 'http://www.bjbus.com/home/ajax_rtbus_data.php',
    method: 'GET',
    header: {
      'Content-Type': 'application/json'
    },
    data: {
      act: 'getLineDirOption',
      selBLine: linename
    },
    success: function (res) {
      //<option value="" > 请选择行车方向 < /option><option value="5344736869918098950">344快(德胜门西-回龙观公交场站)</option > <option value="5662435559531614205" > 344快(回龙观公交场站 - 德胜门西) < /option>
      // console.log(res)
      var resdatas = [];
      var datas = res.data.match(/<option value="\d+">.*<\/option>/g) + "";
      if(datas != "null" )
      {
        resdatas = datas.split("</option><option").map(item => {
          var lineid = item.match(/\d+/g)[0];
          var linename = (item.match(/\(.*\)/g) + "").split("-");
          var startname = linename[0].substring(1);
          var endname = linename[1].substring(0, linename[1].length - 1);
          return {
            startname: startname,
            endname: endname,
            lineid: lineid
          };
        });
      }
      // console.log(resdatas);
      callback(resdatas);
    },
    fail: function(res){
      failHandler(() => getLineId(linename));
    }
  });
}

//实时线路信息获取
function getRealTimeLineInfo(linename, selBDir, callback, stopid){
  var stopid = stopid || 2;
  console.log(linename, selBDir);
  if (typeof (selBDir) === "undefined") {
    // wx.showModal({
    //   title: '提示',
    //   content: '不支持实时数据',
    //   showCancel: false,
    // });
    callback( {
      firstComeTips: '不支持实时数据',
      buss: [],
      busc: []
    });
    return;
  }
  
  wx.request({
    url: 'http://www.bjbus.com/home/ajax_rtbus_data.php',
    method: 'GET',
    header: {
      'Content-Type': 'application/json'
    },
    data: {
      act: 'busTime',
      selBLine: linename,
      selBDir: selBDir,
      selBStop: stopid
    },
    success: function (res) {
      // console.log(res.data.html)
      var busdata = res.data.html;
      var article = (busdata.match(/<article><p>.*<\/p><\/article>/) + "").replace(/<\/p><p>/g, ",").replace(/&nbsp;/g, " ").replace(/<article>|<\/article>|<p>|<\/p>|<\/span>|<span>/g, "").split(",")[1];
      console.log(article);
      var tbuss = busdata.match(/<div id="\d{1,}"><i class="buss"/g);
      var ttbuss = {};
      if (tbuss !=null && tbuss.length > 0) {
        tbuss = tbuss.map(item => parseInt(item.match(/\d+/)[0]));
        for (var i = 0; i < tbuss.length; i++) {
          ttbuss[tbuss[i]] = 1;
        }
      }
     
      console.log(ttbuss);
      var tbusc = busdata.match(/<div id="\d{1,}m"><i  class="busc"/g);
      var ttbusc = {};
      if (tbusc != null && tbusc.length > 0) {
        tbusc = tbusc.map(item => parseInt(item.match(/\d+/)[0]));
        for (var i = 0; i < tbusc.length; i++) {
          ttbusc[tbusc[i]] = 1;
        }
      }
      
      console.log(ttbusc);

      callback( {
        firstComeTips: article,
        buss: ttbuss,
        busc: ttbusc
      });
    },
    fail: function (res) {
      // console.log('实时公交获取失败');
      failHandler(() => getRealTimeLineInfo(linename, selBDir, stopid));
    }
  });
}

module.exports = {
  getWeather,
  getlocation,
  getLocationDescription,
  getAroundStation,
  getLineList,
  getLineIds,
  getLineDetail,
  getSearchResult,
  getLinePlan,
  getLineId,
  getRealTimeLineInfo,
};
