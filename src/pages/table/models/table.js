import * as db from "../services/table";
/*
redux-saga:
  call:   调用 services中的异步事件
  put:    dispatch({type:'namespace/reducer',payload});
  select: getState(state)
*/
const namespace = "table";
export default {
  namespace,
  state: {
    dataSource: [],
    dataSrc: [],
    dataClone: [],
    dataSearchClone: [],
    columns: [],
    total: null,
    page: 1,
    pageSize: 15,
    filteredInfo: {},
    sortedInfo: {}
  },
  reducers: {
    save(state, { payload: { dataSrc, dataSource, total, dataSearchClone } }) {
      return { ...state, dataSrc, dataSource, total, dataSearchClone };
    },
    setPage(state, { payload: page }) {
      return {
        ...state,
        page
      };
    },
    setPageSize(state, { payload: pageSize }) {
      return {
        ...state,
        pageSize
      };
    },
    refreshTable(state, { payload: dataSource }) {
      return {
        ...state,
        dataSource
      };
    },
    setColumns(state, { payload: { dataClone, columns } }) {
      return {
        ...state,
        dataClone,
        columns
      };
    },
    setFilterInfo(state, { payload: { filteredInfo, total } }) {
      return {
        ...state,
        filteredInfo,
        total
      };
    },
    setSortedInfo(state, { payload: { sortedInfo, dataClone } }) {
      return {
        ...state,
        sortedInfo,
        dataClone
      };
    },
    setDataClone(state, { payload: { dataClone, total } }) {
      return {
        ...state,
        dataClone,
        total
      };
    },
    setDataSearchClone(state, { payload: { dataSearchClone, total } }) {
      return {
        ...state,
        dataSearchClone,
        total
      };
    }
  },
  effects: {
    *searchData({ payload: keyword }, { call, put, select }) {
      keyword = keyword.trim();
      const store = yield select(state => state.table);
      const { dataSearchClone, dataClone } = store;
      if (keyword === "") {
        // 如果有数据，还原dataClone;
        if (dataSearchClone.length) {
          yield put({
            type: "setDataClone",
            payload: {
              dataClone: dataSearchClone,
              total: dataSearchClone.length
            }
          });
        }
        return;
      }

      // 先将数据备份存储
      if (dataSearchClone.length === 0) {
        yield put({
          type: "setDataSearchClone",
          payload: { dataSearchClone: dataClone, total: dataClone.length }
        });
      }

      const data = dataSearchClone.filter(
        tr => Object.values(tr).filter(td => ("" + td).includes(keyword)).length
      );

      if (dataSearchClone.length) {
        yield put({
          type: "setDataClone",
          payload: { dataClone: data, total: data.length }
        });
      }
    },
    *customSorter({ payload: sortedInfo }, { call, put, select }) {
      const { field, order } = sortedInfo;
      if (typeof field === "undefined") {
        return;
      }
      const store = yield select(state => state.table);
      const { dataClone } = store;
      const sortedData = yield call(db.handleSort, { dataClone, field, order });

      yield put({
        type: "setSortedInfo",
        payload: { sortedInfo, dataClone: sortedData }
      });
    },
    *customFilter({ payload: filters }, { call, put, select }) {
      const store = yield select(state => state.table);
      const { dataSrc, columns } = store;

      let dataClone = yield call(db.handleFilter, {
        data: dataSrc.data,
        filters
      });

      let newColumn = yield call(db.updateColumns, { columns, filters });
      yield put({
        type: "setColumns",
        payload: {
          dataClone,
          columns: newColumn
        }
      });

      yield put({
        type: "setFilterInfo",
        payload: { filteredInfo: filters, total: dataClone.length }
      });
    },
    *changePageSize({ payload: pageSize }, { put, select }) {
      yield put({
        type: "setPageSize",
        payload: pageSize
      });
    },
    *changePage({ payload: page }, { put, select }) {
      const store = yield select(state => state.table);
      const { pageSize, dataClone } = store;
      const dataSource = db.getPageData({ data: dataClone, page, pageSize });

      yield put({
        type: "refreshTable",
        payload: dataSource
      });
      yield put({
        type: "setPage",
        payload: page
      });
    },
    *readGoodRate({ payload: { url, params } }, { call, put, select }) {
      let data = yield call(db.fetchData, { url, params });
      const store = yield select(state => state.table);
      const { pageSize, page, filteredInfo, sortedInfo } = store;

      let dataSource = [],
        dataClone = [];
      if (data.rows) {
        data.data = data.data.map((item, key) => {
          let col = { key };
          item.forEach((td, idx) => {
            col["col" + idx] = td;
          });
          return col;
        });
        dataClone = data.data;
        dataSource = db.getPageData({ data: dataClone, page, pageSize });
      }

      let columns = yield call(db.handleColumns, {
        dataSrc: data,
        filteredInfo: filteredInfo || {},
        sortedInfo: sortedInfo || {}
      });

      yield put({
        type: "setColumns",
        payload: {
          dataClone,
          columns
        }
      });

      yield put({
        type: "save",
        payload: {
          dataSrc: data,
          dataSource,
          total: data.rows,
          dataSearchClone: []
        }
      });
    }
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname, query }) => {
        if (pathname === "/" + namespace) {
          console.log(pathname);
        }
      });
    }
  }
};
