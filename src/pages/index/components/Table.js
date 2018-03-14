import React, { Component } from "react";
import {
  Table,
  Pagination,
  Card,
  Button,
  Input,
  Menu,
  Dropdown,
  Icon
} from "antd";
import * as db from "../services/table";
import styles from "./Table.less";

import Excel from "../../../utils/excel";
import pdf from "../../../utils/pdf";

const R = require("ramda");

const Search = Input.Search;

class Tables extends Component {
  constructor(props) {
    super(props);
    this.config = props.config;
    this.dataSrc = [];
    this.dataClone = [];
    this.dataSearchClone = [];

    this.state = {
      dataSource: [],
      total: 10,
      page: 1,
      pageSize: 10,
      columns: [],
      source: "",
      timing: "",
      filteredInfo: {},
      sortedInfo: {},
      loading: false
    };
  }

  init = async () => {
    let start = new Date();

    this.setState({ loading: true });
    this.dataSrc = await db.fetchData(this.config);
    this.setState({ loading: false });

    let end = new Date();
    console.log(
      "表格",
      this.config.params.ID,
      "加载完成，总耗时：",
      end.getTime() - start.getTime(),
      "ms"
    );

    const { page, pageSize } = this.state;
    let data = this.dataSrc;
    const { source, timing } = data;

    this.setState({
      total: this.dataSrc.rows,
      source,
      timing
    });

    let dataSource = [];

    if (data.rows) {
      if (typeof data.data[0].key === "undefined") {
        data.data = data.data.map((item, key) => {
          let col = { key };
          item.forEach((td, idx) => {
            col["col" + idx] = td;
          });
          return col;
        });
      }
      this.dataClone = data.data;
      dataSource = db.getPageData({ data: this.dataClone, page, pageSize });
    }

    const columns = db.handleColumns({
      dataSrc: data,
      filteredInfo: {}
    });
    this.setState({
      columns,
      dataSource
    });
    this.dataSearchClone = [];
  };

  componentDidMount() {
    this.init();
  }

  componentWillReceiveProps(nextProps) {
    if (R.equals(nextProps.config, this.config)) {
      return;
    }
    this.config = nextProps.config;
    this.init();
  }

  // 页码更新
  refreshByPage = (page = 1) => {
    const { pageSize } = this.state;
    const dataSource = db.getPageData({ data: this.dataClone, page, pageSize });
    this.setState({
      dataSource,
      page
    });
  };

  // 分页数量调整
  onShowSizeChange = async (current, nextPageSize) => {
    let newPage = Math.max(
      Math.floor(this.state.pageSize * current / nextPageSize),
      1
    );
    await this.setState({
      pageSize: nextPageSize
    });
    this.refreshByPage(newPage);
  };

  customFilter = async filteredInfo => {
    const dataSrc = this.dataSrc;
    const { columns } = this.state;

    this.dataClone = db.handleFilter({
      data: dataSrc.data,
      filters: filteredInfo
    });

    let newColumn = db.updateColumns({ columns, filters: filteredInfo });
    await this.setState({
      columns: newColumn,
      filteredInfo,
      total: this.dataClone.length
    });

    this.refreshByPage();
  };

  customSort = async sortedInfo => {
    const { field, order } = sortedInfo;
    if (typeof field === "undefined") {
      return;
    }

    this.dataClone = db.handleSort({ dataClone: this.dataClone, field, order });
    await this.setState({
      sortedInfo
    });
    this.refreshByPage();
  };

  handleChange = (pagination, filters, sorter) => {
    this.customFilter(filters);
    this.customSort(sorter);
  };

  handleSearchChange = async e => {
    const keyword = e.target.value;
    let key = keyword.trim();
    const dataClone = this.dataClone;
    const dataSearchClone = this.dataSearchClone;

    if (key === "") {
      // 如果有数据，还原dataClone;
      // console.log(dataSearchClone);

      if (dataSearchClone.length) {
        this.dataClone = dataSearchClone;
      }
    } else {
      // 先将数据备份存储
      if (dataSearchClone.length === 0) {
        this.dataSearchClone = dataClone;
      } else {
        this.dataClone = dataSearchClone.filter(
          tr =>
            Object.values(tr)
              .slice(1)
              .filter(td => ("" + td).includes(key)).length
        );
      }
    }
    this.refreshByPage();
  };

  getExportConfig = () => {
    const { columns } = this.state;
    const { title } = this.dataSrc;
    const dateRange = this.config.params;

    const header = R.map(R.prop("title"))(columns);
    const filename = `${title}(${dateRange.tstart} 至 ${dateRange.tend})`;
    const keys = header.map((item, i) => "col" + i);
    const body = R.map(R.props(keys))(this.dataClone);
    return {
      filename,
      header,
      body
    };
  };

  downloadExcel = () => {
    const config = this.getExportConfig();
    config.filename = config.filename + ".xlsx";
    const xlsx = new Excel(config);
    xlsx.save();
  };

  downloadPdf = () => {
    const config = this.getExportConfig();
    config.download = "open";
    config.title = this.dataSrc.title;
    pdf(config);
  };

  Action = () => {
    const menu = (
      <Menu>
        <Menu.Item>
          <a rel="noopener noreferrer" onClick={this.downloadExcel}>
            <Icon type="file-excel" />
            excel
          </a>
        </Menu.Item>
        <Menu.Item>
          <a rel="noopener noreferrer" onClick={this.downloadPdf}>
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

  TableTitle = () => {
    const dateRange = this.config.params;
    const { title } = this.dataSrc;
    return (
      title && (
        <div className={styles.tips}>
          <div className={styles.title}>{title}</div>
          {dateRange.tstart && (
            <small>
              时间范围 : {dateRange.tstart} 至 {dateRange.tend}
            </small>
          )}
        </div>
      )
    );
  };

  getTBody = () => {
    const {
      loading,
      columns,
      dataSource,
      source,
      timing,
      total,
      page,
      pageSize
    } = this.state;
    return (
      <>
        <Table
          loading={loading}
          columns={columns}
          dataSource={dataSource}
          rowKey="key"
          pagination={false}
          size="medium"
          onChange={this.handleChange}
          footer={() => `${source} (共耗时${timing})`}
        />
        <Pagination
          className="ant-table-pagination"
          showTotal={(total, range) =>
            total ? `${range[0]}-${range[1]} 共 ${total} 条数据` : ""
          }
          showSizeChanger
          onShowSizeChange={this.onShowSizeChange}
          total={total}
          current={page}
          pageSize={pageSize}
          onChange={this.refreshByPage}
          pageSizeOptions={["5", "10", "15", "20", "30", "40", "50", "100"]}
        />
      </>
    );
  };

  render() {
    const tBody = this.getTBody();

    return (
      <Card
        title={
          <div className={styles.header}>
            {this.Action()}
            {this.TableTitle()}
            <div className={styles.search}>
              <Search
                placeholder="输入任意值过滤数据"
                onChange={this.handleSearchChange}
                style={{ width: 220, height: 35 }}
              />
            </div>
          </div>
        }
        style={{ width: "100%" }}
        bodyStyle={{ padding: "0px 0px 12px 0px" }}
        className={styles.exCard}
      >
        {tBody}
      </Card>
    );
  }
}

Tables.defaultProps = {
  config: {
    url: "",
    params: {
      ID: "258",
      cache: 10,
      tstart: "",
      tend: ""
    }
  }
};

export default Tables;
