import React from "react";
import { connect } from "dva";
import Table from "./components/Table";
import { DatePicker } from "antd";
import styles from "./index.less";
import moment from "moment";
import "moment/locale/zh-cn";
moment.locale("zh-cn");

function Tables({ dispatch, dateRange, loading, dataSource }) {
  const onDateChange = async (dates, dateStrings) => {
    await dispatch({
      type: "financial/setStore",
      payload: { dateRange: [dateStrings, dateStrings] }
    });

    dispatch({
      type: "financial/refreshInvData"
    });
  };

  const DateRangePicker = () => (
    <div>
      <label className={styles.labelDesc}>查询期间:</label>
      <DatePicker
        allowClear={false}
        format="YYYY-MM-DD"
        onChange={onDateChange}
        defaultValue={moment(dateRange[1])}
      />
    </div>
  );
  return (
    <>
      <div className={styles.header}>
        <div className={styles.dateRange}>
          <DateRangePicker />
        </div>
      </div>
      <div className={styles.tableContainer}>
        {dataSource.rows && (
          <Table
            dataSrc={dataSource}
            subTitle={<small>查询区间 : {dateRange[1]}</small>}
          />
        )}
      </div>
    </>
  );
}

function mapStateToProps(state) {
  return {
    loading: state.loading.models.financial,
    ...state.financial
  };
}

export default connect(mapStateToProps)(Tables);
