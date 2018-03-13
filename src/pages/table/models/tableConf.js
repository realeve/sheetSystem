import pathToRegexp from "path-to-regexp";
import * as db from "../services/table";
import dateRanges from "../../../utils/ranges";

const namespace = "tableConf";
export default {
  namespace,
  state: {
    dateRange: [],
    tid: []
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
    *updateDateRange({ payload: dateRange }, { put }) {
      yield put({
        type: "setDateRange",
        payload: dateRange
      });
    },
    *updateTid({ payload: tid }, { put }) {
      yield put({
        type: "setTid",
        payload: tid
      });
    }
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, query }) => {
        const match = pathToRegexp("/table/:tid").exec(pathname);
        if (match) {
          const [tstart, tend] = dateRanges["去年同期"];
          const [ts, te] = [tstart.format("YYYYMMDD"), tend.format("YYYYMMDD")];
          dispatch({
            type: "setDateRange",
            payload: [ts, te]
          });

          const tid = match[1];

          dispatch({
            type: "updateTid",
            payload: tid
          });

          const config = db.getQueryConfig({
            ...query,
            tid,
            tstart: ts,
            tend: te
          });
          dispatch(config);
        }
      });
    }
  }
};
