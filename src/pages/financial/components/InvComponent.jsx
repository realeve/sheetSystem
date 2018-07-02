import React from "react";
import { connect } from "dva";
import { DatePicker, Button, Icon, Row, Col, Card } from "antd";
import { Radio, Select, Input } from "antd";

import styles from "./inv.less";
import moment from "moment";
import "moment/locale/zh-cn";
moment.locale("zh-cn");

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const Option = Select.Option;

const R = require("ramda");

class InvComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      periodName: props.dateRange[1].substr(0, 7),
      statType: "1",
      orgName: "企划信息部",
      materialSN: "",
      aliasName: "",
      materialType: true
    };
  }

  onDateChange = async (dates, dateStrings) => {
    await this.props.dispatch({
      type: "financial/setStore",
      payload: { dateRange: [dateStrings, dateStrings] }
    });

    this.setState({
      periodName: dateStrings.substr(0, 7)
    });

    this.props.dispatch({
      type: "financial/refreshData"
    });
  };

  handleStatTypeChange = e => {
    this.setState({
      statType: e.target.value
    });
  };

  handleOrgChange = orgName => {
    console.log(orgName);
    this.setState({
      orgName
    });
  };

  // handleOrgFilter = (input, option) =>
  //   option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;

  onChangeMaterialSN = e => {
    const materialType = /^\d*.\d*$/.test(e.target.value);
    this.setState({
      materialSN: e.target.value,
      materialType
    });
  };

  onChangeAliasName = e => {
    this.setState({
      aliasName: e.target.value
    });
  };

  queryData = () => {
    console.log("query");
  };

  render() {
    const QueryHeader = () => {
      const { dateRange } = this.props;
      return (
        <Row gutter={8}>
          <Col span={12}>
            <div className={[styles.formItem, styles.formAction].join(" ")}>
              <label className={styles.formLabel}>查询期间:</label>
              <DatePicker.MonthPicker
                allowClear={false}
                format="YYYY-MM"
                onChange={this.onDateChange}
                defaultValue={moment(dateRange[1])}
                style={{ width: 203 }}
              />
            </div>
            <div className={styles.formItem}>
              <label className={styles.formLabel}>统计类型:</label>
              <RadioGroup
                className={styles.radioButton}
                defaultValue={this.state.statType}
                onChange={this.handleStatTypeChange}
              >
                <RadioButton value="1">期初至今</RadioButton>
                <RadioButton value="2">本期年初至今</RadioButton>
              </RadioGroup>
            </div>
            <div className={styles.formItem}>
              <label className={styles.formLabel}>库存组织:</label>
              <Select
                showSearch
                className={styles.formContainer}
                placeholder="选择库存组织"
                optionFilterProp="children"
                onChange={this.handleOrgChange}
                value={this.state.orgName}
                // filterOption={this.handleOrgFilter}
              >
                <Option value="企划信息部">企划信息部</Option>
                <Option value="组织2">组织2</Option>
                <Option value="组织3">组织3</Option>
              </Select>
            </div>
          </Col>
          <Col span={12}>
            <div className={[styles.formItem, styles.formAction].join(" ")}>
              <label className={styles.formLabel}>
                {this.state.materialType ? "物料编码" : "物料名称 "}:
              </label>
              <Input
                placeholder="输入物料编码/名称"
                prefix={
                  <Icon type="barcode" style={{ color: "rgba(0,0,0,.25)" }} />
                }
                defaultValue={this.state.materialSN}
                onBlur={this.onChangeMaterialSN}
                className={styles.formContainer}
              />
            </div>
            <div className={styles.formItem}>
              <label className={styles.formLabel}>帐户别名:</label>
              <Input
                placeholder="输入帐户别名"
                prefix={
                  <Icon type="team" style={{ color: "rgba(0,0,0,.25)" }} />
                }
                defaultValue={this.state.aliasName}
                onBlur={this.onChangeAliasName}
                className={styles.formContainer}
              />
            </div>
            <div className={styles.formItem}>
              <Button type="primary" onClick={this.queryData}>
                <Icon type="search" />查询
              </Button>
            </div>
          </Col>
        </Row>
      );
    };

    const TableTitle = () => (
      <div className={styles.head}>
        <h2>物料收付存统计查询</h2>
        <p>
          <span>查询期间：</span>
          <span>{this.state.periodName}</span>
        </p>
        <p>
          <span>统计类型：</span>
          <span>
            {this.state.statType === "1" ? "期初至今" : "本期年初至今"}
          </span>
        </p>
        <p>
          <span>库存组织：</span>
          <span>{this.state.orgName}</span>
        </p>
        {this.state.materialSN.length > 0 && (
          <p>
            <span>{this.state.materialType ? "物料编码" : "物料名称 "}：</span>
            <span>{this.state.materialSN}</span>
          </p>
        )}
        {this.state.aliasName.length > 0 && (
          <p>
            <span>帐户别名：</span>
            <span>{this.state.aliasName}</span>
          </p>
        )}
      </div>
    );

    const TableBody = () => {
      let data = this.props.dataSource.data;
      if (R.isNil(data)) {
        return null;
      }
      // count data;
      let distData = R.groupWith((a, b) => a[0] === b[0])(data);

      let TrComponent = ({ trData }) => (
        <tr className="ant-table-row">
          {trData[0].map((td, key) => {
            if (key < 4) {
              return <td key={key}>{td}</td>;
            }

            if ([4, 5, 7, 8, 10, 11].includes(key)) {
              let sum = 0;
              trData.forEach(item => {
                // 汇总第key条数据
                sum += parseFloat(item[key]);
              });
              return (
                <td className={styles.tblMultiline}>
                  <p>
                    <span>小计:</span>
                    {sum}
                  </p>
                  {trData.map((td, tdkey) => <p key={tdkey}>{td[key]}</p>)}
                </td>
              );
            }
            return (
              <td className={styles.tblSingleline}>
                {trData.map((td, tdkey) => <p key={tdkey}>{td[key]}</p>)}
              </td>
            );
          })}
        </tr>
      );

      let TbodyComponent = distData.map(trData => {
        if (trData.length === 1) {
          return (
            <tr className="ant-table-row">
              {trData[0].map((td, keyTd) => <td key={keyTd}>{td}</td>)}
            </tr>
          );
        }
        return <TrComponent trData={trData} />;
      });

      return (
        <tbody className="ant-table-tbody">
          {TbodyComponent}
          {/* {data.map((tr, key) => (
            <tr className="ant-table-row" key={key}>
              {tr.map((td, keyTd) => <td key={keyTd}>{td}</td>)}
            </tr>
          ))} */}
        </tbody>
      );
    };

    return (
      <>
        <Card title="查询条件" className={styles.header}>
          <QueryHeader />
        </Card>
        <Card className={styles.pdfContainer}>
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
                  <span>数量</span>
                </th>
                <th>
                  <span>金额</span>
                </th>
                <th>
                  <span>来源</span>
                </th>
                <th>
                  <span>数量</span>
                </th>
                <th>
                  <span>金额</span>
                </th>
                <th>
                  <span>帐户别名</span>
                </th>
                <th>
                  <span>数量</span>
                </th>
                <th>
                  <span>金额</span>
                </th>
                <th>
                  <span>子库名称</span>
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
        </Card>
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
