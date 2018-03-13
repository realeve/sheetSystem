import pathToRegexp from "path-to-regexp";
import * as db from "../services/table";
import dateRanges from "../../../utils/ranges";

const namespace = "tableIndex";
export default {
  namespace,
  state: {
    dataSrc: [],
    dateRange: [],
    tid: []
  },
  reducers: {
    fetchData(state, { payload: dataSrc }) {
      return { ...state, dataSrc };
    },
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
    *fetchAPIData({ payload: { url, params } }, { call, put, select }) {
      let dataSrc = yield call(db.fetchData, { url, params });
      yield put({
        type: "fetchData",
        payload: dataSrc
      });
    },
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
        const match = pathToRegexp("/index/:tid").exec(pathname);
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
