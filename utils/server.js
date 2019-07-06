
// 根据经纬度获取最近站台和其他站台信息
function getAroundStation(longitude, latitude, callback) {
  wx.request({
    url: 'https://gongjiao.xiaojukeji.com/api/transit/line/recommendation',
    method: 'POST',
    header: {
      'Content-Type': 'application/json'
    },
    data: {
      token: 't49GcWlrGxJ0d2tGQtC9zA_MYpKZXtCpEcwSEJk1jSpUjTsOAyEMRO8ytQucZY3t25B_KiJQlAJx91hKte28p3kTFQ4QzvCTci7ZipjJxplwhSvhBp941zG-rccSjnCYwoTRPv0SfF-E-xE94pZ342SJddMoPP-hFzytXwAAAP__',
      omgid: 'general_app',
      imei: "general_app",
      lat: latitude,
      lng: longitude,
      mode: 1,
      city: 1
    },
    success(data) {
      console.log(data)
      let aroundStation = data.data.stops;
      // 限定最多显示6条数据
      if (aroundStation.length > 6) aroundStation = aroundStation.slice(0, 6);
      // 提取最近站台和其他站台的数据
      let nearestStation;
      const otherStation = [];
      aroundStation.forEach((item, index) => {
        const { distance, line_num, name, locations} = item;
        const stationInfo = { distance, line_num, name, locations };
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

// 根据线路id获取线路详细信息
function getLineDetail(line_id, callback) {
  wx.request({
    url: 'https://gongjiao.xiaojukeji.com/api/transit/line/query',
    method: 'POST',
    header: {
      'Content-Type': 'application/json'
    },
    data: {
      imei: '5925495961739758082',
      client_ver: '5.0.6', token: 't49GcWlrGxJ0d2tGQtC9zA_MYpKZXtCpEcwSEJk1jSpUjTsOAyEMRO8ytQucZY3t25B_KiJQlAJx91hKte28p3kTFQ4QzvCTci7ZipjJxplwhSvhBp941zG-rccSjnCYwoTRPv0SfF-E-xE94pZ342SJddMoPP-hFzytXwAAAP__',
      lng: '116.29319741622',
      lat: '40.041375934019',
      city: 1,
      channel: 74011,
      g_poly: 1,
      oid: 5925495961739758082,
      filter: '0',
      line_id: line_id
    },
    success: function (res) {
      // console.log(res)
      if (res.data.metrobus) {
        res.data.metrobus.polyline = decodeLine(res.data.metrobus.polyline);
        callback(res.data.metrobus);
      }else{
        failHandler(() => getLineDetail(lineId, callback));
      }
    },
    fail() {
      failHandler(() => getLineDetail(lineId, callback));
    },
  });
}

// 根据公交站台 name 获取通过该站台的线路列表
function getLineList(longitude, latitude, name, callback) {
  wx.request({
    url: 'https://gongjiao.xiaojukeji.com/api/transit/line/recommendation',
    method: 'POST',
    header: {
      'Content-Type': 'application/json'
    },
    data: {
      token: 't49GcWlrGxJ0d2tGQtC9zA_MYpKZXtCpEcwSEJk1jSpUjTsOAyEMRO8ytQucZY3t25B_KiJQlAJx91hKte28p3kTFQ4QzvCTci7ZipjJxplwhSvhBp941zG-rccSjnCYwoTRPv0SfF-E-xE94pZ342SJddMoPP-hFzytXwAAAP__',
      omgid: 'general_app',
      imei: "general_app",
      lat: latitude,
      lng: longitude,
      focus_stop: "[\""+name+"\"]",
      mode: 0,
      city: 1
    },
    success(data) {
      console.log(data)
      let location = data.data.location;
      callback(location);
    },
    fail() {
      failHandler(() => getLineList(longitude, latitude, name));
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

function getLinePlan(startLocation, terminalLocation, myCity, strategy, callback) {
  wx.showLoading({ title: '获取中' });
  console.log(strategy);
  wx.request({
    url: 'https://gongjiao.xiaojukeji.com/api/transit/routeplan/search',
    method: 'POST',
    header: {
      'Content-Type': 'application/json'
    },
    data: {
      ct_id: "hc_tf_10000",
      channel: "74011",
      city: "1",
      departure_time: 0,
      departure_time_value: "现在",
      destination: terminalLocation,
      feedback: "false",
      g_poly:1,
      imei: "5925495961739758082",
      maptype:"soso",
      oid:"5925495961739758082",
      openid:"general_app",
      origin: startLocation,
      phone :"",
      routeplan_expr:"2",
      search_version:1,
      source:"1",
      strategy: strategy+",", // 4, 表示： 推荐+公交+地铁
      token: 't49GcWlrGxJ0d2tGQtC9zA_MYpKZXtCpEcwSEJk1jSpUjTsOAyEMRO8ytQucZY3t25B_KiJQlAJx91hKte28p3kTFQ4QzvCTci7ZipjJxplwhSvhBp941zG-rccSjnCYwoTRPv0SfF-E-xE94pZ342SJddMoPP-hFzytXwAAAP__',
      traffic:1
    },
    success(data) {
      console.log(data)
      // 存在数据，并且存在换乘方案
      data = data.data;
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
            if (walking){
             const segmentWalkDistance = formatDistance(walking.distance);
              const segmentWalkduration = formatTime(walking.duration);
              const destination = walking.destination;
              const origin = walking.origin;
              const Walkpolylines = walking.steps.map(step => {
                return decodeLine(step.polyline);
              });
              detailTransition.push({ isBus: false, segmentWalkDistance, segmentWalkduration, Walkpolylines, destination, origin  });
            }
            
            var flag = false;
            //若是 地铁 就有 进出口
            var entrance;
            var exit;
            if (segment.entrance || segment.exit) {
              flag = true;
              entrance = segment.entrance.name;
              exit = segment.exit.name;
            }
           
            if (segment.metrobus && segment.metrobus.length > 0) {      
                const busLine = segment.metrobus[0];
                // console.log(busLine)
                //首班车时间
                const first_time = busLine.first_time;
                //末班车时间
                const last_time = busLine.last_time;
                
                // 增加假的花费
                mockCost += busLine.price/100;
                // 上车站台
                var getonStation = busLine.departure_stop.name;
                if (entrance)
                {
                  getonStation += "(" + entrance+")";
                }
                // 线路名称
                const lineName = busLine.name.replace(/\(.*\)/g, '');
                // 记录换乘的线路
                transitionLine.push(lineName);
                // 中间站台
                const via_stops = busLine.via_stops;
                // var nextStation = '';
                // if (busLine.via_stops.length > 0){
                //    nextStation = busLine.via_stops[0].name;
                // }else{
                  
                // }
                // const via_stops = busLinevia_stops;
                // 下车站台
                var getoffStation = busLine.arrival_stop.name;
                if (exit) {
                  getoffStation += "(" + exit + ")";
                }
                //耗时
                const segmentbusduration = formatTime(busLine.duration);
                
                const buspolyline = decodeLine(busLine.polyline);

                detailTransition.push({
                  isBus: true,
                  isSubway: flag,
                  first_time: first_time,
                  last_time: last_time,
                  buspolyline,
                  segmentbusduration,
                  getonStation,
                  lineName,
                  // nextStation,
                  via_stops,
                  getoffStation,
                });
              
            }
          });
          const getCost = transit.cost/100;
          // 真正花费
          const cost = (Array.isArray(getCost) ? mockCost : parseInt(getCost));
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
      failHandler(() => getLinePlan(startLocation, terminalLocation, myCity, strategy));
    },
  });
}

function decodeLine(t) {
  // var e = t.length, n = 0, r = [], o = 0, i = 0;
  try {
    var e = t.length, n = 0, r = [], o = 0, i = 0;
    for (; n < e;) {
      var u, a = 0, c = 0;
      do
        u = t.charCodeAt(n++) - 63, c |= (31 & u) << a, a += 5;
      while (u >= 32);
      var s = 1 & c ? ~(c >> 1) : c >> 1;
      o += s, a = 0, c = 0;
      do
        u = t.charCodeAt(n++) - 63, c |= (31 & u) << a, a += 5;
      while (u >= 32);
      var f = 1 & c ? ~(c >> 1) : c >> 1;
      i += f, r.push(i / 1e5 + "," + o / 1e5);
    }
  } catch (t) {
    return [];
  }
  return r;
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

module.exports = {
  getAroundStation,
  getLineDetail,
  getLineList,
  getLinePlan,
  decodeLine,
};