import qs from "qs";
const R = require("ramda");

let getChartConfig = () => {
  // let search = window.location.search.slice(1);
  let search = window.location.hash.slice(1);
  search = search.length ? search : "type=bar";
  return qs.parse(search);
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

let handleDefaultOption = option => {
  option = Object.assign(
    {
      // color: ["#2C3E50", "#E74C3C", "#F1973A", "#3498DB", "#2980B9"],
      toolbox: {
        feature: {
          dataZoom: {},
          dataView: { readOnly: false },
          magicType: { type: ["line", "bar", "stack", "tiled"] },
          restore: {},
          saveAsImage: { type: "svg" }
        },
        left: "left"
      },
      legend: {
        top: 10,
        left: "right"
      },
      tooltip: {},
      grid: {
        left: 30,
        right: 20,
        top: 50,
        bottom: 60
      }
    },
    option
  );
  option.title = option.title ? option.title : [];
  option.title = [...option.title, getCopyRight()];
  // option.title.push(getCopyRight());
  return option;
};

// 字符串转日期
let str2Date = str => {
  let needConvert = /^[1-9]\d{3}(0[1-9]|1[0-2])(0[1-9]|[1-2][0-9]|3[0-1])$/.test(
    str
  );
  if (!needConvert) {
    return str;
  }
  let dates = [str.substr(0, 4), str.substr(4, 2), str.substr(6, 2)];
  return dates.join("-");
};

export default {
  getChartConfig,
  uniq,
  getCopyRight,
  handleDefaultOption,
  str2Date
};
