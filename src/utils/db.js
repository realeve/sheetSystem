import {
  API
} from "./lib";
import {
  axios
} from "./axios";

export const getPeriodid = async (periodName) => {
  let url = API.PERIOD_MAXID + "?period=" + periodName;
  let data = await axios.get(url);
  console.log(data);
};
