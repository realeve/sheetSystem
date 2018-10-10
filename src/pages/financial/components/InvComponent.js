import React from 'react';
import { connect } from 'dva';
import { DatePicker, Button, Icon, Row, Col, Radio } from 'antd';

import styles from './inv.less';

import classNames from 'classnames';
import InputSelect from './InputSelect';
import PinyinSelect from './PinyinSelect';
import InvTable from './InvTable';

import moment from 'moment';
import 'moment/locale/zh-cn';

moment.locale('zh-cn');

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

const R = require('ramda');

class InvComponent extends React.Component {
  // queryMode 0 means query by orgname and sn of materialsn;
  // queryMode 1 means query by disaccount .
  constructor(props) {
    super(props);
    this.state = {
      periodName: props.dateRange[1].substr(0, 7),
      statType: '1',
      orgName: '',
      materialSN: '',
      aliasName: '',
      // 物料编码
      materialType: true,
      orgList: props.orgList,
      loaded: false,
      queryMode: 0,
      fetching: false
    };
    // this.lastFetchId = 0;
  }

  componentDidUpdate = ({ orgList }) => {
    if (R.equals(orgList, this.state.orgList)) {
      return false;
    }
    this.setState({
      orgList
    });
  };

  chooseMode = e => {
    // 20181010, libin:不允许修改props中的内容，此处的目的是？
    this.props.dataSource.data = [];
    this.setState({ queryMode: e.target.value });
  };

  onDateChange = async (dates, dateStrings) => {
    await this.props.dispatch({
      type: 'financial/setStore',
      payload: { dateRange: [dateStrings, dateStrings] }
    });

    this.setState({
      periodName: dateStrings.substr(0, 7)
    });
  };

  handleStatTypeChange = e => {
    this.setState({
      statType: e.target.value
    });
  };

  onChangeAliasName = e => {
    this.setState({
      aliasName: e.target.value
    });
  };

  queryData = () => {
    this.setState({ loaded: true });
    // 必选的输入框无法清除，始终会有数据，故无需做数据校验

    // 20181010,libin: 试着用底下一段代码替换这里的，测试一下能否通过。
    this.props.dispatch({
      type: 'financial/refreshData',
      payload: this.state
    });
  };

  reset = () => {
    this.setState({
      statType: '1',
      orgName: '',
      materialSN: '',
      aliasName: '',
      materialType: true,
      orgList: this.props.orgList,
      loaded: false
    });
  };

  handleDisData = data => data.map(value => ({ value, text: value }));
  handleSNData = data =>
    data.map(({ sn: value, name }) => ({
      value,
      text: `${value}/${name}`
    }));

  render() {
    const HeaderOrgCol0 = () => {
      return (
        <>
          <div className={styles.formItem}>
            <label className={classNames(styles.formLabel, styles.required)}>
              库存组织:
            </label>
            <PinyinSelect
              value={this.state.orgName}
              onChange={orgName => {
                this.setState({ orgName });
              }}
              options={this.state.orgList}
              placeholder={'请选择库存组织'}
            />
          </div>
          <p className={styles.formItem}>
            此处支持首字母过滤，在选择框中输入 cl 或者 cailiao 或者 材料
            将匹配出所有含“材料”字样的库存组织
          </p>
        </>
      );
    };

    const QueryHeader = () => {
      const { dateRange } = this.props;
      const { materialSN, queryMode, aliasName, orgName } = this.state;

      const disabledQuery =
        queryMode === 0
          ? orgName.length * materialSN.length === 0
          : aliasName.length === 0;

      return (
        <Row gutter={8}>
          <Col span={12}>
            <div className={classNames(styles.formItem, styles.formAction)}>
              <label className={classNames(styles.formLabel, styles.required)}>
                查询期间:
              </label>
              <DatePicker.MonthPicker
                allowClear={false}
                format="YYYY-MM"
                onChange={this.onDateChange}
                defaultValue={moment(dateRange[1])}
                style={{ width: 203 }}
              />
            </div>
            {queryMode === 1 ? (
              <InputSelect
                placeholder="输入账户别名"
                label="帐户别名"
                value={aliasName}
                onChange={aliasName => {
                  this.setState({ aliasName });
                }}
                fetchingMethod="getDis"
                callback={this.handleDisData}
              />
            ) : (
              <HeaderOrgCol0 />
            )}

            <div className={styles.formItem}>
              <Button
                type="primary"
                onClick={this.queryData}
                disabled={disabledQuery}>
                <Icon type="search" />
                查询
              </Button>
              <Button onClick={this.reset} style={{ marginLeft: '2em' }}>
                <Icon type="search" />
                重置
              </Button>
            </div>
          </Col>
          <Col span={12}>
            <div className={styles.formItem}>
              <label className={classNames(styles.formLabel, styles.required)}>
                统计类型:
              </label>
              <RadioGroup
                className={styles.radioButton}
                defaultValue={this.state.statType}
                onChange={this.handleStatTypeChange}>
                <RadioButton value="0">期初至今</RadioButton>
                <RadioButton value="1">本期年初至今</RadioButton>
              </RadioGroup>
            </div>
            {queryMode === 0 && (
              <InputSelect
                placeholder="输入物料编码或名称"
                label="物料编码或名称"
                value={materialSN}
                onChange={materialSN => {
                  this.setState({ materialSN });
                }}
                fetchingMethod="getMsn"
                callback={this.handleSNData}
              />
            )}
          </Col>
        </Row>
      );
    };

    let { dataSource, loading } = this.props;

    return (
      <React.Fragment>
        <div className={styles.card}>
          <div className={styles.title}>
            查询条件
            <span style={{ marginLeft: '2em' }}>
              <RadioGroup
                className={styles.radioButton}
                defaultValue={this.state.queryMode}
                onChange={this.chooseMode}>
                <RadioButton value={0}>库存组织+物料编码</RadioButton>
                <RadioButton value={1}>账户别名</RadioButton>
              </RadioGroup>
            </span>
          </div>
          <div className={styles.header}>
            <QueryHeader />
          </div>
        </div>
        {this.state.loaded && (
          <InvTable loading={loading} dataSource={dataSource} {...this.state} />
        )}
      </React.Fragment>
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
