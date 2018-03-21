import qs from "qs";
const R = require("ramda");

let getChartConfig = idx => {
  let search = window.location.hash.slice(1);
  search = search.length ? search : "type=bar";
  let params = qs.parse(search);
  R.compose(
    R.forEach(item => {
      params[item] = params[item].split(",");
      params[item] =
        params[item].length - 1 < idx
          ? R.last(params[item])
          : params[item][idx];
    }),
    R.keys
  )(params);
  return params;
};

// let uniq = arr => Array.from(new Set(arr));

let uniq = arr => R.uniq(arr);

let getCopyRight = () => {
  return {
    text: "©成都印钞有限公司 印钞管理部",
    borderColor: "#999",
    borderWidth: 0,
    textStyle: {
      fontSize: 10,
      fontWeight: "normal"
    },
    x: "right",
    y2: 3
  };
};

let handleDefaultOption = (option, config) => {
  option = Object.assign(
    {
      toolbox: {},
      tooltip: {},
      legend: {}
    },
    option
  );

  let axisPointerType = "shadow";
  let tooltipTrigger = "axis";
  switch (config.type) {
    case "bar":
    case "histogram":
      axisPointerType = "shadow";
      break;
    case "line":
      axisPointerType = "cross";
      break;
    default:
      tooltipTrigger = "item";
      axisPointerType = "cross";
      break;
  }
  option.tooltip = {
    trigger: tooltipTrigger,
    axisPointer: {
      type: axisPointerType
    }
  };

  option.title.push(getCopyRight());
  return option;
};

// 字符串转日期
let str2Date = str => {
  let needConvert = /^[1-9]\d{3}(0[1-9]|1[0-2])(0[1-9]|[1-2][0-9]|3[0-1])$|^[1-9]\d{3}(0[1-9]|1[0-2])$/.test(
    str
  );
  if (!needConvert) {
    return str;
  }
  let dates = [str.substr(0, 4), str.substr(4, 2)];
  if (str.length === 8) {
    dates[2] = str.substr(6, 2);
  }
  return dates.join("-");
};

export default {
  getChartConfig,
  uniq,
  getCopyRight,
  handleDefaultOption,
  str2Date
};
