import React from "react";
import { connect } from "dva";
import Table from "./components/Table";
import { DatePicker } from "antd";
import styles from "./index.less";
import moment from "moment";
import "moment/locale/zh-cn";
import { getPeriodid } from "./services/db";
moment.locale("zh-cn");

const MonthPicker = DatePicker.MonthPicker;

function Tables({ dispatch, dateRange, loading, dataSource }) {
  const onDateChange = async (dates, dateStrings) => {
    let monthB = moment(dateStrings, 'YYYY-MM').format("MM-YY");
    let monthA = moment(dateStrings, 'YYYY-MM').add(-1, "months").format("MM-YY");
    console.log(monthA, monthB);
    let periodA = await getPeriodid(monthB);
    let periodB = await getPeriodid(monthB);
    console.log(periodA, periodB);
    await dispatch({
      type: "financial/setStore",
      payload: { dateRange: [dateStrings, dateStrings] }
    });

    dispatch({
      type: "financial/refreshInvData"
    });
  };

  const disabledDate = (current) => {
    // Can not select days before today and today
    return current && current >= moment().endOf('day');
  }

  const DateRangePicker = () => (
    <div>
      <label className={styles.labelDesc}>查询期间:</label>
      <MonthPicker
        allowClear={false}
        format="YYYY-MM"
        onChange={onDateChange}
        disabledDate={disabledDate}
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
