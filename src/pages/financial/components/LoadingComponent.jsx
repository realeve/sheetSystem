import React, { Component } from "react";
import skeleton from "./skeleton.less";

export default class LoadingComponent extends Component {
  render() {
    const LiComponent = () => {
      let arr = [],
        len = parseInt(this.props.queryList, 10);
      for (let i = 0; i < len; i++) {
        arr.push(
          <li key={i}>
            <span />
            <div />
          </li>
        );
      }
      return <>{arr}</>;
    };

    return (
      <div className={skeleton.skeleton}>
        <div className={skeleton.head}>
          <div className={skeleton.title}>
            <div />
          </div>
          <ul>
            <LiComponent />
          </ul>
        </div>
        <div className={skeleton.table}>
          <p />
          <p />
          <p />
          <p />
          <p />
          <p />
          <p />
          <p />
          <p />
          <p />
        </div>
        <div className={skeleton.button} />
      </div>
    );
  }
}
