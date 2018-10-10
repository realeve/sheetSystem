import React from 'react';
import { Button, Icon } from 'antd';
import * as lib from '../../../utils/lib';
import LoadingComponent from './LoadingComponent';

import styles from './inv.less';

const R = require('ramda');

function InvTable({
  periodName,
  orgList,
  orgName,
  queryMode,
  materialType,
  materialSN,
  aliasName,
  statType,
  loading,
  dataSource
}) {
  const getOrgName = () => {
    let org = orgList.find(({ k }) => k === orgName);
    if (org && org.v) {
      return org.v;
    }
    return '';
  };
  const TableTitle = () => (
    <div className={styles.head}>
      <h2>
        物料
        {queryMode === 0 ? '收付存' : '账户发放'}
        统计查询
      </h2>
      <ul>
        <li>
          <span>查询期间：</span>
          <div>{periodName}</div>
        </li>
        <li>
          <span>统计类型：</span>
          <div>{statType === '0' ? '期初至今' : '本期年初至今'}</div>
        </li>
        {queryMode === 0 && (
          <li>
            <span>库存组织：</span>
            <div>{getOrgName()}</div>
          </li>
        )}
        {queryMode === 0 && (
          <li>
            <span>{materialType ? '物料编码' : '物料名称 '}：</span>
            <div>{materialSN}</div>
          </li>
        )}

        {queryMode === 1 && (
          <li>
            <span>帐户别名：</span>
            <div>{aliasName}</div>
          </li>
        )}
      </ul>
    </div>
  );

  const Theader = () => {
    if (queryMode === 0) {
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
    if (queryMode === 0) {
      return <TableBodyOrg />;
    } else {
      return <TableBodyDisacc />;
    }
  };

  const TableBodyDisacc = () => {
    let data = dataSource.data;
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
    let data = dataSource.data;
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

  return loading ? (
    <LoadingComponent queryList="3" />
  ) : (
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
  );
}
export default InvTable;
