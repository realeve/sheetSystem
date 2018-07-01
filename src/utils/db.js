import {
  API
} from "./lib";
import * as axios from "axios";

export const getPeriodid = async (periodName) => {
  let url = API.PERIOD_MAXID + "?period=" + periodName;
  let data = await axios.get(url).then(res => res.data);
  return data.rows === 1?data.data[0].PERIODID:-1;
};

export const getPeriodInv = async(startPeriodid,endPeriodid) => {
  let url = API.IF_INV + "?tstart="+startPeriodid+"&tend="+endPeriodid;
  let data = await axios.get(url).then(res => res.data);
  return data.data;
}

export const getPeriodPay = async(periodid) => {
  let url = API.IF_PAY + "?periodid="+periodid;
  let data = await axios.get(url).then(res => res.data);
  return data.data;
}

export const getPeriodRec = async(periodid) => {
  let url = API.IF_REC + "?periodid="+periodid;
  let data = await axios.get(url).then(res => res.data);
  return data.data;
}