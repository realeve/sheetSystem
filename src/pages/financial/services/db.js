import {
  axios,
  DEV
} from "../../../utils/axios";

import moment from "moment";

const LOCAL = "http://localhost:8000/data/";

const SERV = "http://10.8.1.25:100/api/";
const API = {
  PERIOD_MAXID: DEV ? LOCAL + "bc2e7d3404_periodid.json" : SERV + "150/bc2e7d3404.html",
  IF_INV: DEV ? LOCAL + "f0d7f4eab9_inv.json" : SERV + "151/f0d7f4eab9/array.html",
  IF_PAY: DEV ? LOCAL + "16a5f99c46_pay.json" : SERV + "152/9b089d2e3c.html",
  IF_REC: DEV ? LOCAL + "9b089d2e3c_rec.json" : SERV + "153/16a5f99c46.html"
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
