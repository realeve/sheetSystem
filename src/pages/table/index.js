import React from "react";
import { connect } from "dva";
import Table from "./components/Table";
import { DatePicker, Card } from "antd";
import styles from "./index.less";
import dateRanges from "../../utils/ranges";
import moment from "moment";
import "moment/locale/zh-cn";
moment.locale("zh-cn");

const RangePicker = DatePicker.RangePicker;

function Tables({ dispatch, dateRange, loading, dataSource }) {
  const onDateChange = async (dates, dateStrings) => {
    await dispatch({
      type: "table/setStore",
      payload: { dateRange: dateStrings }
    });
    await dispatch({
      type: "table/updateParams"
    });
    dispatch({
      type: "table/refreshData"
    });
  };

  const DateRangePicker = () => (
    <div>
      <label className={styles.labelDesc}>起始时间:</label>
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
      {dataSource.length === 0 && <Card title="加载中" loading={true} />}
      {dataSource.map((dataSrc, key) => (
        <div key={key} className={key ? styles.tableContainer : null}>
          <Table
            dataSrc={dataSrc}
            subTitle={
              <small>
                时间范围 : {dateRange[0]} 至 {dateRange[1]}
              </small>
            }
          />
        </div>
      ))}
    </>
  );
}

function mapStateToProps(state) {
  return {
    loading: state.loading.models.table,
    ...state.table
  };
}

export default connect(mapStateToProps)(Tables);
