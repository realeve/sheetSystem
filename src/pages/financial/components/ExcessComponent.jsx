import React from "react";
import { connect } from "dva";
import { Button, Icon, Slider } from "antd";

import styles from "./inv.less";
import moment from "moment";
import "moment/locale/zh-cn";
moment.locale("zh-cn");

const R = require("ramda");

class InvComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      timeLength: 3
    };
  }

  handleStatTypeChange = e => {
    this.setState({
      statType: e.target.value
    });
  };

  queryData = () => {
    // 必选的输入框无法清除，始终会有数据，故无需做数据校验
    const { timeLength } = this.state;
    console.log({
      timeLength
    });
    this.props.dispatch({
      type: "financial/refreshData"
    });
  };

  render() {
    const marks = {
      0: "1-2年",
      1: "2-3年",
      2: "3-4年",
      3: "4-5年",
      4: {
        style: {
          color: "#f50"
        },
        label: <strong>5年以上</strong>
      }
    };

    const QueryHeader = () => (
      <>
        <div
          className={styles.formItem}
          style={{ display: "flex", alignItems: "center", paddingTop: 0 }}
        >
          <label
            className={[styles.formLabel, styles.required].join(" ")}
            style={{ paddingTop: -14 }}
          >
            呆滞距今时间:
          </label>
          <Slider
            style={{ width: 300, marginLeft: 15 }}
            marks={marks}
            defaultValue={this.state.timeLength}
            min={0}
            max={4}
            tipFormatter={idx => (idx === 4 ? "5年以上" : marks[idx])}
            onAfterChange={timeLength => this.setState({ timeLength })}
          />
        </div>
        <div className={styles.formItem}>
          <Button type="primary" onClick={this.queryData}>
            <Icon type="search" />查询
          </Button>
        </div>
      </>
    );

    const TableTitle = () => (
      <div className={styles.head}>
        <h2>呆滞库存分析</h2>
        <ul>
          <li>
            <span>呆滞距今时间：</span>
            <div>
              {this.state.statType === "1" ? "期初至今" : "本期年初至今"}
            </div>
          </li>
        </ul>
      </div>
    );

    const TableBody = () => {
      let data = this.props.dataSource.data;
      if (R.isNil(data)) {
        return null;
      }

      let TbodyComponent = data.map((trData, key) => (
        <tr className="ant-table-row" key={key}>
          {trData.map((td, keyTd) => (
            <td
              key={keyTd}
              style={{
                textAlign: [2, 3, 4, 5, 7, 8, 10, 11].includes(keyTd)
                  ? "right"
                  : "left"
              }}
            >
              {td}
            </td>
          ))}
        </tr>
      ));

      return <tbody className="ant-table-tbody">{TbodyComponent}</tbody>;
    };

    return (
      <>
        <div className={styles.card}>
          <div className={styles.title}>查询条件</div>
          <div className={styles.header}>
            <QueryHeader />
          </div>
        </div>
        <div className={styles.pdfContainer}>
          <TableTitle />
          <table>
            <thead>
              <tr>
                <th rowSpan="2">
                  <span>物料编码</span>
                </th>
                <th rowSpan="2">
                  <span>物料名称</span>
                </th>
                <th colSpan="4">
                  <span>末次收发情况</span>
                </th>
                <th colSpan="3">
                  <span>当前结存</span>
                </th>
                <th rowSpan="2">
                  <span>呆滞时长</span>
                </th>
              </tr>
              <tr>
                <th>
                  <span>事务处理类型</span>
                </th>
                <th>
                  <span>数量</span>
                </th>
                <th>
                  <span>金额</span>
                </th>
                <th>
                  <span>来源/帐户</span>
                </th>
                <th>
                  <span>数量</span>
                </th>
                <th>
                  <span>金额</span>
                </th>
                <th>
                  <span>子库</span>
                </th>
              </tr>
            </thead>
            <TableBody />
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
}

function mapStateToProps(state) {
  return {
    loading: state.loading.models.financial,
    ...state.financial
  };
}

export default connect(mapStateToProps)(InvComponent);
