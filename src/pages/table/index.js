import React from "react";
import { connect } from "dva";
import Table from "./components/Table";
import { DatePicker, Button, Input, Card, Menu, Dropdown, Icon } from "antd";
import * as db from "./services/table";
import styles from "./index.less";
import Excel from "../../utils/excel";
import pdf from "../../utils/pdf";

import dateRanges from "../../utils/ranges";
import moment from "moment";
import "moment/locale/zh-cn";
moment.locale("zh-cn");

const Search = Input.Search;
const RangePicker = DatePicker.RangePicker;

const R = require("ramda");

function Tables({ dispatch, tid, dateRange, title, columns, data, loading }) {
  const onDateChange = async (dates, dateStrings) => {
    const [tstart, tend] = dateStrings;
    await dispatch(db.getQueryConfig({ tid, tstart, tend }));
    await dispatch({
      type: "tasks/handleTaskData"
    });
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

  let handleSearchChange = async e => {
    const value = e.target.value;

    await dispatch({
      type: "table/searchData",
      payload: value
    });

    dispatch({
      type: "table/changePage",
      payload: 1
    });
  };

  const getExportConfig = () => {
    const header = R.map(R.prop("title"))(columns);
    const filename = `${title}(${dateRange.join("至")})`;
    const keys = header.map((item, i) => "col" + i);
    const body = R.map(R.props(keys))(data);
    return {
      filename,
      header,
      body
    };
  };
  const downloadExcel = () => {
    const config = getExportConfig();
    config.filename = config.filename + ".xlsx";
    const xlsx = new Excel(config);
    xlsx.save();
  };

  const downloadPdf = () => {
    const config = getExportConfig();
    config.download = "open";
    config.title = title;
    pdf(config);
  };

  const Header = () => {
    return (
      <div className={styles.header}>
        <div className={styles.dateRange}>
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
          <div className={styles.search}>
            <Search
              placeholder="输入任意值过滤数据"
              onChange={handleSearchChange}
              style={{ width: 220 }}
            />
          </div>
        </div>
        {tableTitle()}
      </div>
    );
  };

  const Action = () => {
    const menu = (
      <Menu>
        <Menu.Item>
          <a rel="noopener noreferrer" onClick={downloadExcel}>
            <Icon type="file-excel" />
            excel
          </a>
        </Menu.Item>
        <Menu.Item>
          <a rel="noopener noreferrer" onClick={downloadPdf}>
            <Icon type="file-pdf" />
            PDF
          </a>
        </Menu.Item>
      </Menu>
    );
    return (
      <Dropdown overlay={menu}>
        <Button style={{ marginLeft: 0 }}>
          下载 <Icon type="down" />
        </Button>
      </Dropdown>
    );
  };

  return (
    <Card
      title={<Header />}
      // loading={loading}
      style={{ width: "100%" }}
      bodyStyle={{ padding: "0px 0px 12px 0px" }}
      extra={<Action />}
      className={styles.exCard}
    >
      <Table />
    </Card>
  );
}

function mapStateToProps(state) {
  return {
    ...state.tableConf,
    // loading: state.loading.models.table,
    title: state.table.dataSrc.title || "",
    columns: state.table.columns,
    data: state.table.dataClone
  };
}

export default connect(mapStateToProps)(Tables);
