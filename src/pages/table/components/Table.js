import React from "react";
import { connect } from "dva";
import { Table, Pagination } from "antd";
import styles from "./Table.less";

function Tables({
  dispatch,
  dataSource,
  dataSrc,
  total,
  page,
  pageSize,
  loading,
  filteredInfo,
  columns
}) {
  // 页码更新
  const pageChangeHandler = page => {
    dispatch({
      type: "table/changePage",
      payload: page
    });
  };

  // 分页数
  const onShowSizeChange = async (current, nextPageSize) => {
    let newPage = Math.floor(pageSize * current / nextPageSize);
    await dispatch({
      type: "table/changePageSize",
      payload: nextPageSize
    });
    reloadData(newPage);
  };

  const reloadData = newPage => {
    dispatch({
      type: "table/changePage",
      payload: newPage
    });
  };

  const customFilter = async filters => {
    await dispatch({
      type: "table/customFilter",
      payload: filters
    });
    reloadData(page);
  };

  const customSort = async sorter => {
    await dispatch({
      type: "table/customSorter",
      payload: sorter
    });
    reloadData(page);
  };

  const handleChange = (pagination, filters, sorter) => {
    customFilter(filters);
    customSort(sorter);
  };

  return (
    <div className={styles.tableWrapper}>
      <Table
        loading={loading}
        columns={columns}
        dataSource={dataSource}
        rowKey="key"
        pagination={false}
        size="medium"
        onChange={handleChange}
        footer={() => `${dataSrc.source} (共耗时${dataSrc.timing})` || ""}
      />
      <Pagination
        className="ant-table-pagination"
        showTotal={(total, range) =>
          `${range[0]}-${range[1]} 共 ${total} 条数据`
        }
        showSizeChanger
        onShowSizeChange={onShowSizeChange}
        total={total}
        current={page}
        pageSize={pageSize}
        onChange={pageChangeHandler}
        pageSizeOptions={["5", "10", "15", "20", "30", "40", "50", "100"]}
      />
    </div>
  );
}

function mapStateToProps(state) {
  return {
    loading: state.loading.models.users,
    ...state.table
  };
}

export default connect(mapStateToProps)(Tables);
