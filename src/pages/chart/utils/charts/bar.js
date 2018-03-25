import util from "../lib";

const R = require("ramda");

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

  // option.x = parseInt(option.x, 10);
  // option.y = parseInt(option.y, 10);
  // option.legend = parseInt(option.legend, 10);
  R.forEach(key => (option[key] = parseInt(option[key], 10)))([
    "x",
    "y",
    "legend"
  ]);

  option.smooth = option.smooth !== "0";

  let { data } = options;

  let { header } = data;
  if (R.compose((R.equals, R.type, R.nth(0), "Object"))) {
    header = R.map(R.prop("title"))(header);
  }

  // X轴为时间轴
  let dateAxis = util.needConvertDate(data.data[0][option.x]);

  if (dateAxis) {
    data.data = R.map(item =>
      R.update(option.x, util.str2Date(R.nth(option.x, item)))(item)
    )(data.data);
  }

  // 堆叠数据需保证数据类型不为字符串
  if (option.stack) {
    // data.data = R.map(item => {
    //   item[option.y] = util.str2Num(item[option.y]);
    //   return item;
    // })(data.data);
    data.data = R.map(item =>
      R.update(option.y, util.str2Num(R.nth(option.y, item)))(item)
    )(data.data);
  }

  // 柱状图不允许使用时间轴做x轴
  dateAxis = util.isDate(data.data[0][option.x]) && option.type !== "bar";

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

  let legend = R.compose(R.uniq, R.map(R.nth(option.legend)))(data.data);

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
    name: settings.axisName.y
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

  let configs = util.handleColor(option);
  if (options.pareto) {
    configs = handlePareto(option);
  }
  return configs;
};

const handlePareto = option => {
  let yAxis = option.yAxis;
  let { name } = yAxis;
  option.yAxis = [
    yAxis,
    {
      name: "帕累托(%)",
      nameLocation: "middle",
      nameGap: 15,
      nameTextStyle: {
        fontSize: 16
      },
      type: "value",
      position: "right",
      scale: true,
      axisLabel: {
        show: true,
        interval: "auto",
        margin: 10,
        textStyle: {
          fontSize: 16
        }
      },
      axisTick: {
        show: false
      },
      splitArea: {
        show: false
      },
      max: 100,
      min: 0
    }
  ];
  option.legend = { data: [name, "Pareto"] };
  option.series[0].name = name;

  let { source } = option.dataset[0];
  source = R.compose(
    R.sortBy(R.descend(R.prop(1))),
    R.map(item => {
      item[1] = parseFloat(item[1]);
      return item;
    })
  )(source);

  let valueIndex = R.map(R.prop(1))(source);
  valueIndex.forEach((item, i) => {
    if (i < valueIndex.length - 1) {
      valueIndex[i + 1] = parseInt(valueIndex[i + 1], 10) + parseInt(item, 10);
    }
  });
  let sum = R.last(valueIndex);
  valueIndex = R.map(item => (100 * parseInt(item, 10) / sum).toFixed(2))(
    valueIndex
  );

  option.dataset[0].source = source.map((item, i) =>
    item.concat(valueIndex[i])
  );
  option.dataset[0].dimensions.push("比例");

  option.grid = { right: 50 };

  option.series.push({
    name: "Pareto",
    encode: {
      x: 0,
      y: 2
    },
    datasetIndex: 0,
    yAxisIndex: 1,
    markLine: {
      symbol: "none",
      lineStyle: {
        normal: {
          type: "dot"
        }
      },
      data: [
        {
          name: "80%",
          yAxis: 80,
          label: {
            normal: {
              show: false
            }
          }
        }
        // {
        //   name: "80%",
        //   xAxis: "1250"
        // }
      ]
    },
    type: "line",
    smooth: true,
    symbolSize: "4",
    symbol: "circle",
    lineStyle: {
      normal: {
        width: 2,
        type: "solid",
        shadowColor: "rgba(0,0,0,0)",
        shadowBlur: 0,
        shadowOffsetX: 0,
        shadowOffsetY: 0
      }
    }
  });
  return option;
};

export { bar };