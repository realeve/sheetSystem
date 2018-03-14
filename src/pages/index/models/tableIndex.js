import pathToRegexp from "path-to-regexp";
import * as db from "../services/table";
import dateRanges from "../../../utils/ranges";

const namespace = "tableIndex";
export default {
  namespace,
  state: {
    dateRange: [],
    tid: [],
    config: {},
    query: {}
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
    },
    setConfig(state, { payload: config }) {
      return {
        ...state,
        config
      };
    },
    setQuery(state, { payload: query }) {
      return {
        ...state,
        query
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
    },
    *updateQuery({ payload: query }, { put }) {
      yield put({
        type: "setQuery",
        payload: query
      });
    },
    *updateConfig({ payload: { tstart, tend } }, { put, call, select }) {
      const { tid, query } = yield select(state => state.tableIndex);
      const config = tid.map(
        item =>
          db.getQueryConfig({
            ...query,
            tid: item,
            tstart,
            tend
          }).payload
      );
      yield put({
        type: "setConfig",
        payload: config
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

          const tid = match[1].split(",");

          dispatch({
            type: "updateTid",
            payload: tid
          });

          dispatch({
            type: "updateQuery",
            payload: query
          });

          dispatch({
            type: "updateConfig",
            payload: {
              tstart: ts,
              tend: te
            }
          });
        }
      });
    }
  }
};
