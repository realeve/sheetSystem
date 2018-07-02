import React from "react";
import { connect } from "dva";
import { DatePicker, Button, Icon } from "antd";
import styles from "./inv.less";
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
      <DatePicker.MonthPicker
        allowClear={false}
        format="YYYY-MM"
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
      <div className={styles.pdfContainer}>
        <div className={styles.head}>
          <h2>物料收付存报表</h2>
          <p>
            <span>查询物料：</span>
            <span>某纸张</span>
          </p>
          <p>
            <span>查询期间：</span>
            <span>05-2018</span>
          </p>
          <p>
            <span>金额类型：</span>
            <span>期初至今</span>
          </p>
          <p>
            <span>查询部门：</span>
            <span>企划信息部</span>
          </p>
        </div>
        <table>
          <thead>
            <tr>
              <th rowSpan="2">
                <span>物料编码</span>
              </th>
              <th rowSpan="2">
                <span>物料名称</span>
              </th>
              <th colSpan="2">
                <span>期初情况</span>
              </th>
              <th colSpan="3">
                <span>收入情况</span>
              </th>
              <th colSpan="3">
                <span>发出情况</span>
              </th>
              <th colSpan="3">
                <span>结存情况</span>
              </th>
            </tr>
            <tr>
              <th>
                <span>数量</span>
              </th>
              <th>
                <span>金额</span>
              </th>
              <th>
                <span>收入数量</span>
              </th>
              <th>
                <span>收入金额</span>
              </th>
              <th>
                <span>来源情况</span>
              </th>
              <th>
                <span>发出数量</span>
              </th>
              <th>
                <span>发出金额</span>
              </th>
              <th>
                <span>领用说明</span>
              </th>
              <th>
                <span>结存数量</span>
              </th>
              <th>
                <span>结存金额</span>
              </th>
              <th>
                <span>结存位置</span>
              </th>
            </tr>
          </thead>
          <tbody className="ant-table-tbody">
            <tr className="ant-table-row">
              <td>4</td>
              <td>3213.000001</td>
              <td>ITEM_NAME_4</td>
              <td>0</td>
              <td>0</td>
              <td>0</td>
              <td>0</td>
              <td>0</td>
              <td>0</td>
              <td>0</td>
              <td>0</td>
              <td>0</td>
              <td>0</td>
            </tr>
            <tr className="ant-table-row">
              <td>6</td>
              <td>3213.000000</td>
              <td>ITEM_NAME_6</td>
              <td>0</td>
              <td>0</td>
              <td>0</td>
              <td>0</td>
              <td>0</td>
              <td>0</td>
              <td>0</td>
              <td>0</td>
              <td>0</td>
              <td>0</td>
            </tr>
          </tbody>
        </table>
        <div className={styles.action}>
          <Button
            type="primary"
            onClick={() => {
              window.print();
            }}
          >
            打印报表 <Icon type="printer" />
          </Button>
        </div>
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
