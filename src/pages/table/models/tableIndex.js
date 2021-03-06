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
      if (R.isNil(tid)) {
        return;
      }
      let axiosOptions = yield call(db.handleParams, {
        params,
        tid,
        dateRange
      });

      yield put({
        type: 'setStore',
        payload: {
          axiosOptions
        }
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
      // /table#id=98/8832903756&id=87/a7835c9ebc
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

        const match = pathToRegexp("/" + namespace).exec(pathname);

        if (!match) {
          return;
        }

        const [tstart, tend] = dateRanges["过去一月"];
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
      });
    }
  }
};
