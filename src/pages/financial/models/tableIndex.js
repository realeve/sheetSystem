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
    * refreshInvData(payload, {
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
      let inv = yield call(db.getPeriodInv, curId, latestId)
      let pay = yield call(db.getPeriodPay, curId);
      let rec = yield call(db.getPeriodRec, curId);
      const dataSource = [];
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
        dispatch({
          type: "setStore",
          payload: {
            dateRange: [ts, te]
          }
        });

        const match = pathname.replace("/" + namespace, '');
        switch (match) {
          case '/inv':
            dispatch({
              type: "refreshInvData"
            });
            break;
          case '/pay':
            break;
          case '/rec':
            break;
          default:
            break;
        }

      });
    }
  }
};
