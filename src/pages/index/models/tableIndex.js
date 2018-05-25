import pathToRegexp from "path-to-regexp";
import * as db from "../services/table";
import dateRanges from "../../../utils/ranges";
const R = require('ramda');

const namespace = "table";
export default {
  namespace,
  state: {
    dateRange: [],
    tid: [],
    dataSource: [],
    params: [],
    axiosOptions: []
  },
  reducers: {
    updateTid(state, {
      payload: {
        tid,
        params
      }
    }) {
      return {
        ...state,
        tid,
        params
      };
    },
    setDateRange(state, {
      payload: {
        dateRange,
        tid,
        params
      }
    }) {
      if (state.tid.length === 0) {
        return {
          ...state,
          dateRange,
          tid,
          params
        };
      }

      return {
        ...state,
        dateRange
      };
    },
    saveData(state, {
      payload: {
        dataSource
      }
    }) {
      return {
        ...state,
        dataSource
      }
    },
    setParams(state, {
      payload: params
    }) {
      return {
        ...state,
        params
      }
    },
    setAxiosOptions(state, {
      payload: axiosOptions
    }) {
      return {
        ...state,
        axiosOptions,
      }
    }
  },
  effects: {
    * updateParams(payload, {
      put,
      call,
      select
    }) {
      const {
        dateRange,
        params,
        tid
      } = yield select(state => state[namespace]);

      let param = yield call(db.handleParams, {
        params,
        tid,
        dateRange
      });
      yield put({
        type: 'setAxiosOptions',
        payload: param
      })
    },
    * refreshData(payload, {
      call,
      put,
      select
    }) {
      const {
        axiosOptions,
        dataSource
      } = yield select(state => state[namespace]);

      for (let idx = 0; idx < axiosOptions.length; idx++) {
        dataSource[idx] = yield call(db.fetchData, axiosOptions[idx])
      }

      yield put({
        type: "saveData",
        payload: {
          dataSource
        }
      });
    }
  },
  subscriptions: {
    setup({
      dispatch,
      history
    }) {
      // ?id=98/8832903756&id=/131/4172bb514d&id=87/a7835c9ebc
      return history.listen(({
        pathname,
        query
      }) => {
        const {
          id
        } = query;
        let params = R.clone(query);
        Reflect.deleteProperty(params, 'id');

        let needRefresh = id && id.length

        const match = pathToRegexp("/").exec(pathname);
        if (match) {
          const [tstart, tend] = dateRanges["去年同期"];
          const [ts, te] = [tstart.format("YYYYMMDD"), tend.format("YYYYMMDD")];
          dispatch({
            type: "setDateRange",
            payload: {
              dateRange: [ts, te],
              tid: id,
              params
            }
          });

          dispatch({
            type: 'updateParams'
          })

          if (needRefresh) {
            dispatch({
              type: "refreshData"
            });
          }

        }
      });
    }
  }
};
