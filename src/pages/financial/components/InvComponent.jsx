import React from 'react';
import { connect } from 'dva';
import { DatePicker, Button, Icon, Row, Col, Radio, Select, Spin } from 'antd';
import * as lib from '../../../utils/lib';
import LoadingComponent from './LoadingComponent';
import debounce from 'lodash/debounce';

import styles from './inv.less';
import pinyin from '../../../utils/pinyin.js';
import * as db from '../services/db';

import moment from 'moment';
import 'moment/locale/zh-cn';

moment.locale('zh-cn');

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const Option = Select.Option;

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
      srcMsn: [],
      srcDis: [],
      fetching: false
    };
    // this.lastFetchId = 0;
    this.searchMsn = debounce(this.searchMsn, 800);
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

    // this.props.dispatch({
    //   type: "financial/refreshData"
    // });
  };

  handleStatTypeChange = e => {
    this.setState({
      statType: e.target.value
    });
  };

  handleOrgChange = orgName => {
    this.setState({
      orgName
    });
  };

  handleOrgFilter = (searchText, { props: { value, children: text } }) => {
    text = text.trim().toLowerCase();
    searchText = searchText.trim().toLowerCase();
    // let pyShort = pinyin.toPinYin(text).toLowerCase();
    // let pyFull = pinyin.toPinYinFull(text).toLowerCase();
    return [
      text,
      pinyin.toPinYin(text).toLowerCase(),
      pinyin.toPinYinFull(text).toLowerCase()
    ].find(a => a.includes(searchText));
  };

  onChangeMaterialSN = e => {
    // if (!e.taget) {
    //   return;
    // }
    console.log('e', e);
    // const materialType = /^\d+(\.\d+)?$/.test(e);
    // this.setState({
    //   materialSN: e,
    //   srcMsn: [],
    //   fetching: false,
    // });
    // this.setState({
    //   materialSN: e
    // });
    console.log('sn', this.state.materialSN);
  };

  onChangeAliasName = e => {
    this.setState({
      aliasName: e.target.value
    });
  };

  queryData = () => {
    this.setState({ loaded: true });
    // 必选的输入框无法清除，始终会有数据，故无需做数据校验
    const {
      periodName,
      statType,
      orgName,
      materialSN,
      aliasName,
      materialType,
      queryMode
    } = this.state;
    this.props.dispatch({
      type: 'financial/refreshData',
      payload: {
        periodName,
        statType,
        orgName,
        materialSN,
        aliasName,
        materialType,
        queryMode
      }
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

  // componentDidMount() {
  //   this.queryData();
  // }

  searchMsn = async (value = '') => {
    // this.lastFetchId += 1;
    // const fetchId = this.lastFetchId;

    if (this.state.fetching || value.length <= 3) {
      return;
    }
    // if (value && value.length >= 3) {
    //   this.setState({ srcMsn: [], fetching: true });

    //   let data = await this.props.dispatch({
    //     type: 'financial/getMsn',
    //     payload: { s: value }
    //   });
    //   // let srcMsn = data.map(item => item.sn + "/" + item.name);
    //   // this.setState({ srcMsn: R.isNil(data) ? [] : data.map(s => { return { value: s.sn, text: s.sn + "/" + s.name } }), fetching: false });
    //   data = data || [];
    //   console.log(data);
    //   let srcMsn = data.map(({ sn: value, name }) => ({
    //     value,
    //     text: `${value}/${name}`
    //   }));
    //   this.setState({ srcMsn, fetching: false });
    // }

    this.setState({ srcMsn: [], fetching: true });
    let data = await db.getMsn({ s: value });
    let srcMsn = data.map(({ sn: value, name }) => ({
      value,
      text: `${value}/${name}`
    }));
    this.setState({ srcMsn, fetching: false });
  };

  searchDis = async value => {
    // this.lastFetchId += 1;
    // const fetchId = this.lastFetchId;

    if (this.state.fetching) {
      return;
    }
    if (value && value.length >= 3) {
      this.setState({ srcMsn: [], fetching: true });
      let data = await this.props.dispatch({
        type: 'financial/getDis',
        payload: { s: value }
      });
      // let srcMsn = data.map(item => item.sn + "/" + item.name);
      this.setState({ srcDis: R.isNil(data) ? [] : data, fetching: false });
    }
  };

  onMsnSelect = value => {
    this.setState({ materialSN: value });
  };

  onDisSelect = value => {
    this.setState({ aliasName: value });
  };

  render() {
    const HeaderOrgCol0 = () => {
      return (
        <>
          <div className={styles.formItem}>
            <label className={[styles.formLabel, styles.required].join(' ')}>
              库存组织:
            </label>
            <Select
              showSearch
              className={styles.formContainer}
              placeholder="选择库存组织"
              optionFilterProp="children"
              onChange={this.handleOrgChange}
              value={this.state.orgName}
              filterOption={this.handleOrgFilter}>
              {this.state.orgList.map(({ value, name, code }) => (
                <Option value={value} key={code}>
                  {name}
                </Option>
              ))}
            </Select>
          </div>
          <p className={styles.formItem}>
            此处支持首字母过滤，在选择框中输入 cl 或者 cailiao 或者 材料
            将匹配出所有含“材料”字样的库存组织
          </p>
        </>
      );
    };

    const HeaderDisaccCol0 = () => {
      const { fetching, srcDis, aliasName } = this.state;
      const children = srcDis.map(d => <Option key={d}>{d}</Option>);
      return (
        <div className={styles.formItem}>
          <label className={[styles.formLabel, styles.required].join(' ')}>
            帐户别名:
          </label>
          <Select
            // dataSource={dataSource}
            showSearch
            // style={{ width: 350 }}
            className={styles.formContainer}
            onSelect={this.onDisSelect}
            value={aliasName}
            notFoundContent={fetching ? <Spin size="small" /> : null}
            filterOption={false}
            onSearch={this.searchDis}
            placeholder="输入账户别名">
            {children}
          </Select>
        </div>
      );
    };

    const HeaderCol0 = props => {
      if (parseInt(props.queryMode, 10) === 1) {
        return <HeaderDisaccCol0 />;
      } else {
        return <HeaderOrgCol0 />;
      }
    };

    const HeaderCol1 = props => {
      if (parseInt(props.queryMode, 10) === 1) {
        return null;
      } else {
        const { fetching, srcMsn, materialSN } = this.state;
        const children = srcMsn.map((sn, idx) => {
          return <Option key={sn.value}>{sn.text}</Option>;
        });
        return (
          <div className={[styles.formItem, styles.formAction].join(' ')}>
            <label className={[styles.formLabel, styles.required].join(' ')}>
              物料编码或名称
            </label>
            <Select
              // dataSource={dataSource}
              showSearch
              style={{ width: 350 }}
              onSelect={this.onMsnSelect}
              value={materialSN}
              notFoundContent={fetching ? <Spin size="small" /> : null}
              filterOption={false}
              onSearch={this.searchMsn}
              placeholder="输入物料编码或名称">
              {children}
            </Select>
          </div>
        );
      }
    };
    const QueryHeader = () => {
      const { dateRange } = this.props;
      const queryValidate =
        this.state.queryMode === 0
          ? this.state.orgName.length * this.state.materialSN.length === 0
          : this.state.aliasName.length === 0;
      return (
        <Row gutter={8}>
          <Col span={12}>
            <div className={[styles.formItem, styles.formAction].join(' ')}>
              <label className={[styles.formLabel, styles.required].join(' ')}>
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
            <HeaderCol0 queryMode={this.state.queryMode} />
            <div className={styles.formItem}>
              <Button
                type="primary"
                onClick={this.queryData}
                disabled={queryValidate}>
                <Icon type="search" />
                查询
              </Button>
              <Button
                type="primary"
                onClick={this.reset}
                style={{ marginLeft: '2em' }}>
                <Icon type="search" />
                重置
              </Button>
            </div>
          </Col>
          <Col span={12}>
            <div className={styles.formItem}>
              <label className={[styles.formLabel, styles.required].join(' ')}>
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
            <HeaderCol1 queryMode={this.state.queryMode} />
          </Col>
        </Row>
      );
    };

    const getOrgName = () => {
      let org = this.state.orgList.find(({ k }) => k === this.state.orgName);
      if (org && org.v) {
        return org.v;
      }
      return '';
    };
    const TableTitle = () => (
      <div className={styles.head}>
        <h2>
          物料
          {this.state.queryMode === 0 ? '收付存' : '账户发放'}
          统计查询
        </h2>
        <ul>
          <li>
            <span>查询期间：</span>
            <div>{this.state.periodName}</div>
          </li>
          <li>
            <span>统计类型：</span>
            <div>
              {this.state.statType === '0' ? '期初至今' : '本期年初至今'}
            </div>
          </li>
          {this.state.queryMode === 0 && (
            <li>
              <span>库存组织：</span>
              <div>{getOrgName()}</div>
            </li>
          )}
          {this.state.queryMode === 0 && (
            <li>
              <span>
                {this.state.materialType ? '物料编码' : '物料名称 '}：
              </span>
              <div>{this.state.materialSN}</div>
            </li>
          )}

          {this.state.queryMode === 1 && (
            <li>
              <span>帐户别名：</span>
              <div>{this.state.aliasName}</div>
            </li>
          )}
        </ul>
      </div>
    );

    const Theader = () => {
      if (this.state.queryMode === 0) {
        return <TheaderOrg />;
      } else {
        return <TheaderDisacc />;
      }
    };
    const TheaderOrg = () => {
      return (
        <thead>
          <tr>
            <th rowSpan="2">
              <span>物料编码</span>
            </th>
            <th rowSpan="2" width="160">
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
            <th width="70">
              <span>来源</span>
            </th>
            <th>
              <span>数量</span>
            </th>
            <th>
              <span>金额</span>
            </th>
            <th width="70">
              <span>帐户别名</span>
            </th>
            <th>
              <span>数量</span>
            </th>
            <th>
              <span>金额</span>
            </th>
            <th width="70">
              <span>子库名称</span>
            </th>
          </tr>
        </thead>
      );
    };
    const TheaderDisacc = () => {
      return (
        <thead>
          <tr>
            <th>
              <span>物料编码</span>
            </th>
            <th>
              <span>物料名称</span>
            </th>
            <th>
              <span>数量</span>
            </th>
            <th>
              <span>金额</span>
            </th>
          </tr>
        </thead>
      );
    };

    const TableBody = () => {
      if (this.state.queryMode === 0) {
        return <TableBodyOrg />;
      } else {
        return <TableBodyDisacc />;
      }
    };

    const TableBodyDisacc = () => {
      let data = this.props.dataSource.data;
      if (R.isNil(data)) {
        return null;
      }
      return (
        <tbody className="ant-table-tbody">
          {data.map(({ sn, name, quantity, figure }, idx) => (
            <tr className="ant-table-row" key={idx}>
              <td>{sn}</td>
              <td>{name}</td>
              <td>{quantity}</td>
              <td>{figure}</td>
            </tr>
          ))}
        </tbody>
      );
    };

    const TableBodyOrg = () => {
      let data = this.props.dataSource.data;
      if (R.isNil(data)) {
        return null;
      }
      // count data;
      let distData = R.groupWith((a, b) => a[0] === b[0])(data);

      let handleTdData = (td, keyTd) =>
        [2, 3, 4, 5, 7, 8, 10, 11].includes(keyTd) ? lib.thouandsNum(td) : td;

      let TrComponent = ({ trData }, i) => {
        let newRow = trData[0].slice(0, 4);
        trData[0].forEach((td, key) => {
          if (key < 4) {
            return;
          }
          if ([4, 5, 7, 8, 10, 11].includes(key)) {
            let sum = 0;
            trData.forEach(item => {
              // 汇总第key条数据
              sum += Number(item[key]);
            });
            newRow[key] = sum !== 0 ? '小计: ' + lib.thouandsNum(sum) : '';
          } else {
            newRow[key] = '';
          }
        });
        let newTrData = trData.map(item => item.slice(4, 13));

        return (
          <React.Fragment>
            <tr className="ant-table-row">
              {newRow.map((td, keyTd) => (
                <td
                  key={keyTd}
                  rowSpan={keyTd < 4 ? trData.length + 1 : 1}
                  style={{ textAlign: keyTd < 2 ? 'left' : 'right' }}>
                  {td}
                </td>
              ))}
            </tr>
            {newTrData.map((trs, j) => (
              <tr className="ant-table-row" key={j}>
                {trs.map((td, keyTd) => (
                  <td
                    key={keyTd}
                    style={{
                      textAlign: (keyTd + 1) % 3 === 0 ? 'left' : 'right'
                    }}>
                    {(keyTd + 1) % 3 === 0 ? td : lib.thouandsNum(td)}
                  </td>
                ))}
              </tr>
            ))}
          </React.Fragment>
        );
      };

      let TbodyComponent = distData.map(
        (trData, key) =>
          trData.length === 1 ? (
            <tr className="ant-table-row" key={key}>
              {trData[0].map((td, keyTd) => (
                <td
                  key={keyTd}
                  style={{
                    textAlign: [2, 3, 4, 5, 7, 8, 10, 11].includes(keyTd)
                      ? 'right'
                      : 'left'
                  }}>
                  {handleTdData(td, keyTd)}
                </td>
              ))}
            </tr>
          ) : (
            <TrComponent trData={trData} key={key} />
          )
      );

      // 数据列汇总
      let DatacountComponent = () => {
        let sumData = idx => {
          let sum = 0;
          data.forEach(trData => {
            sum += Number(trData[idx]);
          });
          return lib.thouandsNum(sum);
        };

        // 起初情况数据汇总
        let sumBaseData = idx => {
          let sum = 0;
          let baseData = R.compose(
            R.uniq,
            R.map(R.pick(['0', '1', '2', '3']))
          )(data);
          baseData.forEach(trData => {
            sum += Number(trData[idx]);
          });
          return lib.thouandsNum(sum);
        };

        let newRow = [
          '汇总',
          sumBaseData(2),
          sumBaseData(3),
          sumData(4),
          sumData(5),
          '',
          sumData(7),
          sumData(8),
          '',
          sumData(10),
          sumData(11),
          ''
        ];
        return (
          <tr className={`ant-table-row ${styles.countRow}`}>
            {newRow.map((item, key) => (
              <td key={key} colSpan={key > 0 ? 1 : 2}>
                {item}
              </td>
            ))}
          </tr>
        );
      };

      return (
        <tbody className="ant-table-tbody">
          {TbodyComponent}
          <DatacountComponent />
        </tbody>
      );
    };

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
        {this.state.loaded &&
          this.props.loading && <LoadingComponent queryList="3" />}
        {this.state.loaded &&
          !this.props.loading && (
            <div className={styles.pdfContainer}>
              <TableTitle />
              <table>
                <Theader />
                <TableBody />
              </table>
              <div className={styles.action}>
                <Button
                  type="primary"
                  onClick={() => {
                    window.print();
                  }}>
                  打印报表 <Icon type="printer" />
                </Button>
              </div>
            </div>
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
