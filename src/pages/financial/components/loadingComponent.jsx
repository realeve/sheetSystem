import React, { Component } from "react";
import skeleton from "./skeleton.less";

export default class loadingComponent extends Component {
  LiComponent = () => {
    let arr = [];
    for (let i = 0; i < this.props.queryList; i++) {
      arr.push(
        <li key={i}>
          <span />
          <div />
        </li>
      );
    }
    return arr;
  };
  SkeletonComponent = () => (
    <div className={skeleton.skeleton}>
      <div className={skeleton.head}>
        <div className={skeleton.title}>
          <div> </div>
        </div>
        <ul>
          <this.LiComponent />
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

  render() {
    return <this.SkeletonComponent />;
  }
}
