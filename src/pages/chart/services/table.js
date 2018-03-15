// import request from "../../../utils/request";
import axios from "axios";
import * as lib from "../../../utils/lib";
const R = require("ramda");

export const fetchData = async ({ url, params }) =>
  await axios({ url, params }).then(res => res.data);

export const getQueryConfig = ({ tid, tstart, tend, idx }) => ({
  type: "fetchAPIData",
  payload: {
    url: lib.apiHost,
    params: {
      ID: tid,
      cache: 10,
      tstart,
      tend,
      tstart2: tstart,
      tend2: tend,
      tstart3: tstart,
      tend3: tend
    },
    idx
  }
});
