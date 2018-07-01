import {
  API
} from "../../../utils/lib";
import * as axios from "axios";
import moment from "moment";

const getPeriodid = async periodName => {
  let url = API.PERIOD_MAXID + "?period=" + periodName;
  let data = await axios.get(url).then(res => res.data);
  return data.rows === 1 ? data.data[0].PERIODID : -1;
};

/**
 * 根据当前日期获取当期id以及上期id
 * @param {当前日期} dateName
 */
export const getPeriodDate = async curDay => {
  const latestDay = moment(curDay)
    .subtract(1, "month")
    .format("YYYY-MM-DD");
  const curId = await getPeriodid(curDay);
  const latestId = await getPeriodid(latestDay);
  return {
    curId,
    latestId
  };
};

export const getPeriodInv = async (startPeriodid, endPeriodid) => {
  let url = API.IF_INV + "?tstart=" + startPeriodid + "&tend=" + endPeriodid;
  // let data = 
  return await axios.get(url).then(res => res.data);
  // return data.data;
};

export const getPeriodPay = async periodid => {
  let url = API.IF_PAY + "?periodid=" + periodid;
  let data = await axios.get(url).then(res => res.data);
  return data.data;
};

export const getPeriodRec = async periodid => {
  let url = API.IF_REC + "?periodid=" + periodid;
  let data = await axios.get(url).then(res => res.data);
  return data.data;
};
