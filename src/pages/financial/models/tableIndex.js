import * as db from "../services/db";
import dateRanges from "../../../utils/ranges";

const namespace = "financial";
export default {
  namespace,
  state: {
    dateRange: [],
    dataSource: [],
    router: ''
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
        dateRange,
        router
      } = yield select(state => state[namespace]);
      const {
        curId,
        latestId
      } = yield call(db.getPeriodDate, dateRange[1]);

      // 根据路由调整数据
      let dataSource = [];
      switch (router) {
        case '/inv':
          dataSource = yield call(db.getPeriodInv, curId, latestId);
          break;
        case '/pay':
          dataSource = yield call(db.getPeriodPay, curId);
          break;
        case '/rec':
          dataSource = yield call(db.getPeriodRec, curId);
          break;
        default:
          break;
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
      return history.listen(({
        pathname
      }) => {
        const [tstart, tend] = dateRanges["过去一月"];
        const [ts, te] = [tstart.format("YYYY-MM-DD"), tend.format("YYYY-MM-DD")];

        const router = pathname.replace("/" + namespace, '');

        dispatch({
          type: "setStore",
          payload: {
            dateRange: [ts, te],
            router
          }
        });

        dispatch({
          type: "refreshData"
        });

      });
    }
  }
};
