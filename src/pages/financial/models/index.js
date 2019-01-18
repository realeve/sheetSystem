import * as db from '../services/db';
import dateRanges from '../../../utils/ranges';
import moment from 'moment';

const namespace = 'financial';
export default {
  namespace,
  state: {
    dateRange: [],
    dataSource: [],
    orgList: [],
    router: ''
  },
  reducers: {
    setStore(state, { payload }) {
      return {
        ...state,
        ...payload
      };
    }
  },
  effects: {
    *getOrgList(payload, { call, put }) {
      let orgList = yield call(db.getOrgList);
      yield put({
        type: 'setStore',
        payload: {
          orgList
        }
      });
    },
    *refreshData({ payload }, { call, put, select }) {
      const { router } = yield select((state) => state[namespace]);
      // 根据路由调整数据
      let dataSource = [];
      switch (router) {
        case '/inv':
          let {
            aliasName,
            materialSN,
            orgName,
            periodName,
            statType,
            materialType,
            queryMode
          } = payload;

          let period;

          // 期初至今
          if (statType === '0') {
            period = moment(periodName, 'YYYY-MM')
              .subtract(1, 'months')
              .format('MM-YY');
          } else {
            // 本期年初至今
            let [year] = periodName.split('-');
            period = moment(`12-${parseInt(year, 10) - 1}`, 'MM-YYYY').format(
              'MM-YY'
            );
          }
          let curPeriodName = moment(periodName, 'YYYY-MM').format('MM-YY');
          // 期初情况(基础数据)
          const baseid = yield call(db.getPeriodid, period);
          // 当期收付存id
          const curId = yield call(db.getPeriodid, curPeriodName);

          if (queryMode === 1) {
            dataSource = yield call(db.getPayout, {
              periodid: curId,
              baseid,
              alias: `%${aliasName}%`
            });
          } else {
            // 传入sn及name参数，减少数据行级。
            // dataSource = yield call(db.getPeriodInv, {
            dataSource = yield call(db.getIOSInv, {
              periodid: curId,
              baseid,
              orgid: orgName,
              sn:
                materialType && materialSN.length > 0
                  ? `%${materialSN}%`
                  : '%%',
              name:
                !materialType && materialSN.length > 0
                  ? `%${materialSN}%`
                  : '%%'
            });

            if (dataSource.data.length) {
              // console.log(dataSource);
              // 合并行级
              dataSource.data = db.handleInvData(dataSource.data);
            }
          }
          break;
        case '/excess':
          // 当前时间
          payload.periodid = yield call(
            db.getPeriodid,
            moment().format('MM-YY')
          );
          dataSource = yield call(db.getExcess, payload);
          break;
        default:
          break;
      }

      yield put({
        type: 'setStore',
        payload: {
          dataSource
        }
      });
    }
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname }) => {
        if (!pathname.includes(namespace)) {
          return;
        }
        const [tstart, tend] = dateRanges['过去一月'];
        const [ts, te] = [
          tstart.format('YYYY-MM-DD'),
          tend.format('YYYY-MM-DD')
        ];

        const router = pathname.replace('/' + namespace, '');

        dispatch({
          type: 'setStore',
          payload: {
            dateRange: [ts, te],
            router
          }
        });

        dispatch({
          type: 'getOrgList'
        });
      });
    }
  }
};
