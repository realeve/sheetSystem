import { axios, DEV } from '../../../utils/axios';
import { handleSrcData } from '../../table/services/table';

import moment from 'moment';
const R = require('ramda');

const LOCAL = 'http://localhost:8000/data/';

const SERV = 'http://10.8.1.25:100/api/';
const API = {
  PERIOD_MAXID: DEV
    ? LOCAL + 'bc2e7d3404_periodid.json'
    : SERV + '150/bc2e7d3404.html',
  IF_INV: DEV ? LOCAL + 'f0d7f4eab9_inv.json' : SERV + '151/f0d7f4eab9.html',
  IF_PAY: DEV ? LOCAL + '16a5f99c46_pay.json' : SERV + '152/9b089d2e3c.html',
  IF_REC: DEV ? LOCAL + '9b089d2e3c_rec.json' : SERV + '153/16a5f99c46.html',
  EXCESS_INV: DEV
    ? LOCAL + '117dd652a7_inv_alanysis.json'
    : SERV + '155/117dd652a7/array.html?cache=60',
  IF_REMAIN: DEV
    ? LOCAL + '713e3e1011_invSub.json'
    : SERV + '154/713e3e1011.html',
  IF_IOS_COMBINE: DEV
    ? LOCAL + '4653126720_ios_combine.json'
    : SERV + '156/4653126720.html',
  ORG_LIST: DEV ? LOCAL + '5f830d1833_org.json' : SERV + '157/5f830d1833.html',
  IF_DISACC: DEV
    ? LOCAL + '99842b0552_disaccount.json'
    : SERV + '158/99842b0552.html',
  IF_MSN: DEV ? LOCAL + 'materialsn.json' : SERV + '187/61bc019d63.html',
  IF_DIS: DEV ? LOCAL + 'disaccount.json' : SERV + '188/51d67811cb.html'
};

export const getMsn = (params) =>
  axios({
    url: API.IF_MSN,
    params
  });

export const getDis = (params) =>
  axios({
    url: API.IF_DIS,
    params: { q1: params.q, q2: params.q }
  });

export const getOrgList = () =>
  axios({
    url: API.ORG_LIST
  }).then(({ data }) => data);

export const getPeriodid = async (periodName) => {
  let url = API.PERIOD_MAXID + '?period=' + periodName;
  let data = await axios({
    url
  });
  return data.rows === 1 ? data.data[0].periodId : -1;
};

/**
 * 根据当前日期获取当期id以及上期id
 * @param {当前日期} dateName
 */
export const getPeriodDate = async (curDay) => {
  const curMonth = moment(curDay, 'YYYY-MM').format('MM-YY');
  const latestDay = moment(curDay, 'YYYY-MM')
    .subtract(1, 'month')
    .format('MM-YY');
  const curId = await getPeriodid(curMonth);
  const latestId = await getPeriodid(latestDay);
  return {
    curId,
    latestId
  };
};

/**
*   @database: { 数管测试库 }
*   @desc:     { 物料收付存统计查询 } 
    const { periodid, baseid, sn, name,alias } = params;
*/
export const getIOSInv = (params) =>
  axios({
    url: API.IF_IOS_COMBINE,
    params
  }).then((res) => {
    if (DEV) {
      res.data = res.data.slice(0, 200);
      res.rows = res.data.length;
    }
    return res;
  });

export const getPayout = (params) =>
  axios({
    url: API.IF_DISACC,
    params
  }).then((res) => {
    if (DEV) {
      res.data = res.data.slice(0, 200);
      res.rows = res.data.length;
    }
    return res;
  });

export const getPeriodInv = async ({ baseid, periodid, orgName, sn, name }) => {
  let params = {
    periodid,
    sn,
    name
  };
  // 期初数据
  let baseData = await axios({
    url: API.IF_INV,
    params: {
      period: baseid,
      sn,
      name
    }
  });

  // 收付存数据
  let inputData = await axios({
    url: API.IF_PAY,
    params
  });
  let outputData = await axios({
    url: API.IF_REC,
    params
  });
  let remainData = await axios({
    url: API.IF_REMAIN,
    params
  });

  // 此处数据行数过大，暂时只输出80条.
  baseData = Object.assign(baseData, {
    data: [
      ...baseData.data.slice(0, 20),
      ...inputData.data.slice(0, 20),
      ...outputData.data.slice(0, 20),
      ...remainData.data.slice(0, 20)
    ],
    title: '物料收付存统计查询'
  });
  baseData.rows = baseData.data.length;
  return baseData;
};

/**
*   @database: { 数管测试库 }
*   @desc:     { ERP呆滞库存库存分析 } 
    const { from, to, periodid } = params;
*/
export const getExcess = (params) =>
  axios({
    url: API.EXCESS_INV,
    params
  });

export const handleInvData = (invData) => {
  let snList = R.uniq(R.map(R.pick(['sn', 'name']))(invData));
  // 获取期初情况
  const getBaseInfo = (snItems) => {
    let baseInfo = R.find(R.propEq('type', '0'))(snItems);
    if (R.isNil(baseInfo)) {
      baseInfo = {
        sn: snItems[0].sn,
        name: snItems[0].name,
        quantity: 0,
        figure: 0,
        remark: ''
      };
    }
    return R.compose(
      R.init,
      R.values,
      R.pickBy((val, key) => key !== 'type')
    )(baseInfo);
  };

  const handleSNInfo = (snItems, idx) =>
    R.compose(
      R.map(R.values),
      R.map(R.pick(['quantity', 'figure', 'remark'])),
      R.filter(R.propEq('type', idx))
    )(snItems);

  const extendIORInfo = (iorInfo, maxLength) => {
    let appendLen = maxLength - iorInfo.length;
    for (var i = 0; i < appendLen; i++) {
      iorInfo.push(['', '', '']);
    }
    return iorInfo;
  };

  const linkIORInfo = ({ baseInfo, inputInfo, outputInfo, remainInfo }) =>
    inputInfo.length > 0
      ? inputInfo.map((item, idx) => [
          ...baseInfo,
          ...item,
          ...outputInfo[idx],
          ...remainInfo[idx]
        ])
      : [[...baseInfo, ...new Array(9).fill('')]];

  let data = snList.map((item) => {
    let snItems = R.filter(R.propEq('sn', item.sn))(invData);
    // 期初信息
    let baseInfo = getBaseInfo(snItems);
    // 收付存信息
    let inputInfo = handleSNInfo(snItems, '1'),
      outputInfo = handleSNInfo(snItems, '2'),
      remainInfo = handleSNInfo(snItems, '3');
    // 最大数据行级
    let maxLength = R.max(
      R.max(inputInfo.length, outputInfo.length),
      remainInfo.length
    );

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
  data.forEach((item) => {
    dist = [...dist, ...item];
  });
  return dist;
};

export const handleDetailData = (dataDetail) => {
  // 转换dataSource为表格所需格式
  dataDetail.data = dataDetail.data
    .map((item) => Object.values(item))
    .map((item) => {
      if (dataDetail.rows <= 5) {
        return item;
      }
      let text = '';
      switch (parseInt(R.last(item), 10)) {
        case 0:
          text = '期初';
          break;
        case 1:
          text = '收入';
          break;
        case 2:
          text = '发出';
          break;
        case 3:
          text = '结存';
          break;
        default:
          break;
      }
      return [...R.init(item), text];
    });
  return handleSrcData(dataDetail);
};
