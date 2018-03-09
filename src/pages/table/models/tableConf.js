import pathToRegexp from "path-to-regexp";
import * as db from "../services/table";
import dateRanges from "../../../utils/ranges";

const namespace = "tableConf";
export default {
  namespace,
  state: {
    tid: "",
    dateRange: []
  },
  reducers: {
    setTid(state, { payload: tid }) {
      return {
        ...state,
        tid
      };
    },
    setDateRange(state, { payload: dateRange }) {
      return {
        ...state,
        dateRange
      };
    }
  },
  effects: {
    *updateTid({ payload: tid }, { put }) {
      yield put({
        type: "setTid",
        payload: tid
      });
    },
    *updateDateRange({ payload: dateRange }, { put }) {
      yield put({
        type: "setDateRange",
        payload: dateRange
      });
    }
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, query }) => {
        const match = pathToRegexp("/table/:tid").exec(pathname);
        // console.log(pathname, match, query);
        if (match) {
          const tid = match[1];
          dispatch({
            type: "updateTid",
            payload: tid
          });
          const [tstart, tend] = dateRanges["去年同期"];
          const [ts, te] = [tstart.format("YYYYMMDD"), tend.format("YYYYMMDD")];
          const config = db.getQueryConfig({
            ...query,
            tid,
            tstart: ts,
            tend: te
          });
          dispatch(config);
          dispatch({
            type: "setDateRange",
            payload: [ts, te]
          });
        }
      });
    }
  }
};
