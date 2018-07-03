import {
  axios,
  DEV
} from "../../../utils/axios";

import moment from "moment";
const R = require('ramda');

const LOCAL = "http://localhost:8000/data/";

const SERV = "http://10.8.1.25:100/api/";
const API = {
  PERIOD_MAXID: DEV ? LOCAL + "bc2e7d3404_periodid.json" : SERV + "150/bc2e7d3404.html",
  IF_INV: DEV ? LOCAL + "f0d7f4eab9_inv.json" : SERV + "151/f0d7f4eab9/array.html",
  IF_PAY: DEV ? LOCAL + "16a5f99c46_pay.json" : SERV + "152/9b089d2e3c.html",
  IF_REC: DEV ? LOCAL + "9b089d2e3c_rec.json" : SERV + "153/16a5f99c46.html",
  EXCESS_INV: DEV ? LOCAL + 'excessInv.json' : SERV + '/'
};

export const getPeriodid = async periodName => {
  let url = API.PERIOD_MAXID + "?period=" + periodName;
  let data = await axios({
    url
  })
  return data.rows === 1 ? data.data[0].PERIODID : -1;
};

/**
 * 根据当前日期获取当期id以及上期id
 * @param {当前日期} dateName
 */
export const getPeriodDate = async curDay => {
  const curMonth = moment(curDay, "YYYY-MM").format("MM-YY");
  const latestDay = moment(curDay, "YYYY-MM")
    .subtract(1, "month")
    .format("MM-YY");
  const curId = await getPeriodid(curMonth);
  const latestId = await getPeriodid(latestDay);
  return {
    curId,
    latestId
  };
};

export const getPeriodInv = async (startPeriodid, endPeriodid) => {
  let url = API.IF_INV + "?tstart=" + startPeriodid + "&tend=" + endPeriodid;
  return await axios({
    url
  })
};

export const getPeriodPay = async periodid => {
  let url = API.IF_PAY + "?periodid=" + periodid;
  return await axios({
    url
  })
};

export const getPeriodRec = async periodid => {
  let url = API.IF_REC + "?periodid=" + periodid;
  return await axios({
    url
  })
};

// 呆滞距今时间
export const getExcess = async type => {
  let url = API.EXCESS_INV + '?type=' + type;
  return await axios({
    url
  })
}

export const handleInvData = invData => {
  let snList = R.uniq(R.map(R.pick(['sn', 'name']))(invData));

  // 获取期初情况
  const getBaseInfo = snItems => {
    let baseInfo = R.find(R.propEq('type', 0))(snItems);
    if (R.isNil(baseInfo)) {
      baseInfo = {
        sn: snItems[0].sn,
        name: snItems[0].name,
        quantity: 0,
        figure: 0,
        remark: ''
      }
    }
    return R.compose(R.init, R.values, R.pickBy((val, key) => key !== 'type'))(baseInfo);
  }

  const handleSNInfo = (snItems, idx) => R.compose(R.map(R.values), R.map(R.pick(['quantity', 'figure', 'remark'])), R.filter(R.propEq('type', idx)))(snItems)

  const extendIORInfo = (iorInfo, maxLength) => {
    let appendLen = maxLength - iorInfo.length;
    for (var i = 0; i < appendLen; i++) {
      iorInfo.push(['', '', ''])
    }
    return iorInfo;
  }

  const linkIORInfo = ({
    baseInfo,
    inputInfo,
    outputInfo,
    remainInfo
  }) => ((inputInfo.map((item, idx) => [...baseInfo, ...item, ...outputInfo[idx], ...remainInfo[idx]])))

  let data = snList.map(item => {
    let snItems = R.filter(R.propEq('sn', item.sn))(invData);
    // 期初信息
    let baseInfo = getBaseInfo(snItems);

    // 收付存信息
    let inputInfo = handleSNInfo(snItems, 1),
      outputInfo = handleSNInfo(snItems, 2),
      remainInfo = handleSNInfo(snItems, 3);
    // 最大数据行级
    let maxLength = R.max((R.max(inputInfo.length, outputInfo.length)), remainInfo.length);


    // 数据补齐
    inputInfo = extendIORInfo(inputInfo, maxLength);
    outputInfo = extendIORInfo(outputInfo, maxLength);
    remainInfo = extendIORInfo(remainInfo, maxLength);

    // 连接数据
    return linkIORInfo({
      baseInfo,
      inputInfo,
      outputInfo,
      remainInfo
    });
  });
  let dist = [];
  data.forEach(item => {
    dist = [...dist, ...item]
  })
  return dist;
};
