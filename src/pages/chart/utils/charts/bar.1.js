import util from "../lib";

let isDate = dateStr => {
  return /^[1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])|^[1-9]\d{3}(0[1-9]|1[0-2])(0[1-9]|[1-2][0-9]|3[0-1])$/.test(
    dateStr
  );
};

let getSetting = options => {
  const haveLegend = Reflect.has(options, "legend");
  let option = Object.assign(
    {
      x: haveLegend ? 1 : 0,
      y: haveLegend ? 2 : 1,
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
  let header = data.header.map(item => item.title);

  // X轴为时间轴
  let dateAxis = isDate(data.data[0][option.x]);

  if (dateAxis) {
    data.data = data.data.map(item => {
      item[option.x] = util.str2Date(item[option.x]);
      return item;
    });
  }

  // 柱状图不允许使用时间轴做x轴
  dateAxis = dateAxis && option.type !== "bar";

  if (!haveLegend) {
    return {
      dataset: {
        source: data.data,
        dimensions: header
      },
      series: [
        {
          type: option.type,
          encode: {
            x: option.x,
            y: option.y
          },
          stack: Reflect.get(option, "stack"),
          smooth: option.smooth
        }
      ]
    };
  }

  let legend = data.data.map(item => item[option.legend]);
  legend = util.uniq(legend);
  let series = [];
  let dataset = legend.map((legendItem, i) => {
    let seriesItem = {
      name: legendItem,
      type: option.type,
      encode: {
        x: option.x,
        y: option.y
      },
      datasetIndex: i,
      stack: Reflect.get(option, "stack"),
      smooth: option.smooth
      // boundaryGap: false
    };
    series.push(seriesItem);
    return {
      source: data.data.filter(item => item[option.legend] === legendItem),
      dimensions: header,
      sourceHeader: false
    };
  });
  return {
    dataset,
    series,
    dateAxis
  };
};

let bar = options => {
  let settings = getSetting(options);

  var option = {
    title: [
      {
        left: "center",
        text: options.data.title
      }
    ],
    dataset: settings.dataset,
    yAxis: { max: options.max, min: options.min },
    xAxis: {
      type: settings.dateAxis ? "time" : "category"
    },
    series: settings.series,
    dataZoom: [
      {
        type: "inside",
        realtime: true,
        start: 0,
        end: 100
      }
    ]
  };
  if (options.reverse) {
    option.xAxis = { max: options.max, min: options.min };
    option.yAxis = {
      type: settings.dateAxis ? "time" : "category"
    };
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

  return option;
};

export { bar };
