import util from "../lib";

const R = require("ramda");

let isDate = dateStr => {
  return /^[1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])|^[1-9]\d{3}(0[1-9]|1[0-2])(0[1-9]|[1-2][0-9]|3[0-1])$/.test(
    dateStr
  );
};

let needConvertDate = dateStr => {
  return /^[1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])|^[1-9]\d{3}(0[1-9]|1[0-2])(0[1-9]|[1-2][0-9]|3[0-1])$|^[1-9]\d{3}(0[1-9]|1[0-2])$/.test(
    dateStr
  );
};

let getSetting = options => {
  // const haveLegend = Reflect.has(options, "legend");
  let option;
  switch (options.data.header.length) {
    case 3:
      option = {
        legend: 0,
        x: 1,
        y: 2
      };
      break;
    case 2:
      option = {
        x: 0,
        y: 1
      };
      break;
    default:
      break;
  }
  option = Object.assign(
    option,
    {
      type: "bar",
      smooth: true
    },
    options
  );

  option.x = parseInt(option.x, 10);
  option.y = parseInt(option.y, 10);
  option.legend = parseInt(option.legend, 10);
  option.smooth = option.smooth !== "0";

  let data = options.data;
  let header = R.map(R.prop("title"))(data.header);

  // X轴为时间轴
  let dateAxis = needConvertDate(data.data[0][option.x]);

  if (dateAxis) {
    data.data = data.data.map(item => {
      item[option.x] = util.str2Date(item[option.x]);
      return item;
    });
  }

  // 堆叠数据需保证数据类型不为字符串
  if (option.stack) {
    data.data = R.map(item => {
      item[option.y] = util.str2Num(item[option.y]);
      return item;
    })(data.data);
  }

  // 柱状图不允许使用时间轴做x轴
  dateAxis = isDate(data.data[0][option.x]) && option.type !== "bar";

  if ("undefined" === option.legend) {
    let seriesItem = {
      type: option.type,
      encode: {
        x: option.x,
        y: option.y
      },
      smooth: option.smooth
    };
    seriesItem = handleSeriesItem(option, seriesItem);
    return {
      dataset: {
        source: data.data,
        dimensions: header
      },
      series: [seriesItem],
      dateAxis,
      axisName: {
        x: header[option.x],
        y: header[option.y]
      }
    };
  }

  let legend = R.compose(R.uniq, R.map(R.prop(option.legend)))(data.data);

  let series = [];
  let dataset = legend.map((name, i) => {
    let seriesItem = {
      name,
      type: option.type,
      encode: {
        x: option.x,
        y: option.y
      },
      datasetIndex: i,
      smooth: option.smooth
      // boundaryGap: false
    };

    seriesItem = handleSeriesItem(option, seriesItem);

    series.push(seriesItem);
    return {
      source: R.filter(R.propEq(option.legend, name))(data.data), //data.data.filter(item => item[option.legend] === legendItem),
      dimensions: header,
      sourceHeader: false
    };
  });
  return {
    dataset,
    series,
    dateAxis,
    axisName: {
      x: header[option.x],
      y: header[option.y]
    }
  };
};

let handleSeriesItem = (option, seriesItem) => {
  if (option.area && option.type !== "bar") {
    seriesItem.areaStyle = {
      normal: {
        opacity: 0.4
      }
    };
  }

  if (option.stack) {
    seriesItem.stack = "All";
  }
  return seriesItem;
};

// test URL: http://localhost:8000/chart/133#type=bar&x=0&y=1&smooth=1&max=100&min=70
// http://localhost:8000/chart/145#type=line&legend=0&x=1&y=2&smooth=1&max=100&min=70
let bar = options => {
  let settings = getSetting(options);
  let xAxis = {
    type: "category", //'time'局限性太多,比如不能使用stack等；settings.dateAxis ? "time" :
    name: settings.axisName.x
  };

  let yAxis = {
    name: settings.axisName.y,
    type: "value"
  };

  if (options.max) {
    yAxis.max = parseFloat(options.max);
  }
  if (options.min) {
    yAxis.min = parseFloat(options.min);
  }

  let axisOption = {
    nameLocation: "center",
    nameGap: 25,
    nameTextStyle: {
      fontWeight: "bold"
    }
  };
  xAxis = Object.assign(xAxis, axisOption);
  yAxis = Object.assign(yAxis, axisOption);

  var option = {
    title: [
      {
        left: "center",
        text: options.data.title
      }
    ],
    dataset: settings.dataset,
    yAxis,
    xAxis,
    series: settings.series,
    dataZoom: [
      {
        type: "inside",
        realtime: true,
        start: 0,
        end: 100,
        yAxisIndex: 0
      },
      {
        type: "inside",
        realtime: true,
        start: 0,
        end: 100,
        xAxisIndex: 0
      }
    ]
  };
  if (options.reverse) {
    option.xAxis = yAxis;
    option.yAxis = xAxis;
    option.series = option.series.map(item => {
      item.encode = {
        x: parseInt(options.y, 10),
        y: parseInt(options.x, 10)
      };
      return item;
    });
  }

  if (options.zoom) {
    option.dataZoom.push({
      realtime: true,
      start: 0,
      end: 100
    });
  }

  return util.handleColor(option);
};

export { bar };
