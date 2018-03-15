import React, { Component } from "react";
import { Card } from "antd";
import * as db from "../services/table";
import styles from "./Chart.less";
import ReactEcharts from "./echarts-for-react";

// import theme from "../utils/theme";
// import echarts from "echarts";
// echarts.registerTheme("g2", theme);

const R = require("ramda");

class Charts extends Component {
  constructor(props) {
    super(props);
    this.config = props.config;
    this.dataSrc = [];

    this.state = {
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

  getOption() {
    return {
      tooltip: {},
      xAxis: {
        type: "category",
        data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      },
      yAxis: {
        type: "value"
      },
      series: [
        {
          data: [820, 932, 901, 934, 1290, 1330, 1320],
          type: "line"
        }
      ]
    };
  }

  render() {
    return (
      <Card
        style={{ width: "100%" }}
        bodyStyle={{ padding: "12px" }}
        className={styles.exCard}
      >
        <ReactEcharts
          ref={e => {
            this.echarts_react = e;
          }}
          option={this.getOption()}
          style={{ height: "800px" }}
          opts={{ renderer: "svg" }}
        />
      </Card>
    );
  }
}

Charts.defaultProps = {
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

export default Charts;
