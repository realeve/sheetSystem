import React from "react";
import { connect } from "dva";
import Table from "./components/Table";
import { DatePicker } from "antd";
import * as db from "./services/table";
import styles from "./index.less";

import dateRanges from "../../utils/ranges";
import moment from "moment";
import "moment/locale/zh-cn";
moment.locale("zh-cn");

const RangePicker = DatePicker.RangePicker;

function Tables({ dispatch, tid, dateRange, dataSrc, loading }) {
  const onDateChange = async (dates, dateStrings) => {
    const [tstart, tend] = dateStrings;
    let config = db.getQueryConfig({ tid, tstart, tend });
    config.type = "tableIndex/fetchAPIData";
    await dispatch(config);
    dispatch({
      type: "tableIndex/setDateRange",
      payload: dateStrings
    });
  };

  const DateRangePicker = () => (
    <div>
      {/* <label className={styles.labelDesc}>起始时间:</label> */}
      <RangePicker
        ranges={dateRanges}
        format="YYYYMMDD"
        onChange={onDateChange}
        defaultValue={[moment(dateRange[0]), moment(dateRange[1])]}
        locale={{
          rangePlaceholder: ["开始日期", "结束日期"]
        }}
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
      <Table dataSrc={dataSrc} dateRange={dateRange} />
    </>
  );
}
// loading={loading}

function mapStateToProps(state) {
  return {
    loading: state.loading.models.tableIndex,
    ...state.tableIndex
  };
}

export default connect(mapStateToProps)(Tables);
