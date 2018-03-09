import React from "react";
import { connect } from "dva";
import Table from "./components/Table";
import { DatePicker, Button, Input } from "antd";
import * as db from "./services/table";
import styles from "./index.less";
import dateRanges from "../../utils/ranges";
import moment from "moment";
import "moment/locale/zh-cn";
moment.locale("zh-cn");

const Search = Input.Search;
const RangePicker = DatePicker.RangePicker;

function Tables({ dispatch, tid, dateRange, title }) {
  const onDateChange = (dates, dateStrings) => {
    const [tstart, tend] = dateStrings;
    dispatch(db.getQueryConfig({ tid, tstart, tend }));
    dispatch({
      type: "tableConf/setDateRange",
      payload: dateStrings
    });
  };

  const tableTitle = () => {
    if (title) {
      return (
        <div className={styles.tips}>
          <div className={styles.title}>{title}</div>
          <small>时间范围 : {dateRange.join("至")}</small>
        </div>
      );
    }
    return "";
  };

  const searchData = value => {
    console.log(value);
  };

  const searchUp = e => {
    const value = e.target.value;
    console.log(value);
  };

  return (
    <>
      <div className={styles.header}>
        <div className={styles.action}>
          <Button icon="file-excel">下载excel</Button>
          <Button icon="file-pdf" style={{ marginLeft: 10 }}>
            下载pdf
          </Button>
        </div>
        {tableTitle()}
        <div className={styles.dateRange}>
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
          <div className={styles.search}>
            <Search
              placeholder="输入任意值过滤数据"
              onSearch={searchData}
              onKeyUp={searchUp}
              style={{ width: 220 }}
            />
          </div>
        </div>
      </div>
      <Table />
    </>
  );
}

function mapStateToProps(state) {
  return {
    ...state.tableConf,
    title: state.table.dataSrc.title || ""
  };
}

export default connect(mapStateToProps)(Tables);
