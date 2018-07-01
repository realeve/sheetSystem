import pathToRegexp from "path-to-regexp";
import * as db from "../services/db";
import dateRanges from "../../../utils/ranges";

const namespace = "financial";
export default {
  namespace,
  state: {
    dateRange: [],
    dataSource: []
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
    * refreshData(payload, {
      call,
      put,
      select
    }) {
      const {
        dateRange
      } = yield select(state => state[namespace]);

      const {
        curId,
        latestId
      } = yield call(db.getPeriodDate, dateRange[1]);
      const dataSource = yield call(db.getPeriodInv, curId, latestId)
      console.log(dataSource)
      return;
      // yield put({
      //   type: "setStore",
      //   payload: {
      //     dataSource
      //   }
      // });
    }
  },
  subscriptions: {
    setup({
      dispatch,
      history
    }) {
      return history.listen(({
        pathname,
        hash
      }) => {
        const match = pathToRegexp("/" + namespace).exec(pathname);
        if (match) {
          const [tstart, tend] = dateRanges["过去一月"];
          const [ts, te] = [tstart.format("YYYY-MM-DD"), tend.format("YYYY-MM-DD")];
          dispatch({
            type: "setStore",
            payload: {
              dateRange: [ts, te]
            }
          });

          dispatch({
            type: "refreshData"
          });

          // if (needRefresh) {
          //   dispatch({
          //     type: "refreshData"
          //   });
          // }

        }
      });
    }
  }
};
