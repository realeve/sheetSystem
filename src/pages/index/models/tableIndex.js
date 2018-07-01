import pathToRegexp from "path-to-regexp";
import * as db from "../services/table";
import dateRanges from "../../../utils/ranges";
import qs from 'qs';
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
    setStore(state, {
      payload
    }) {
      return { ...state,
        ...payload
      };
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
        type: 'setStore',
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
        type: "setStore",
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
        hash
      }) => {
        let queryStr = hash.slice(1);
        let query = qs.parse(queryStr);
        let {
          id
        } = query;
        let params = R.clone(query);
        Reflect.deleteProperty(params, 'id');

        if ('String' === R.type(id)) {
          id = [id]
        }

        let needRefresh = id && id.length

        const match = pathToRegexp("/").exec(pathname);
        if (match) {
          const [tstart, tend] = dateRanges["去年同期"];
          const [ts, te] = [tstart.format("YYYYMMDD"), tend.format("YYYYMMDD")];
          dispatch({
            type: "setStore",
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
