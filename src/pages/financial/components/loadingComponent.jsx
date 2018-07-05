import React, { Component } from "react";
import { Icon } from "antd";

export default class loadingComponent extends Component {
  render() {
    return (
      <tbody>
        <tr>
          <td
            colSpan={this.props.colSpan}
            style={{ textAlign: "center", fontSize: "14pt" }}
          >
            <Icon type="loading spin" /> 数据加载中...
          </td>
        </tr>
      </tbody>
    );
  }
}
