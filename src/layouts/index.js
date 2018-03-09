import React, { Component } from 'react'

import 'ant-design-pro/dist/ant-design-pro.css'; // 统一引入样式

import styles from './index.less';
import Header from './Header';
import withRouter from 'umi/withRouter';

import { Layout, Breadcrumb } from 'antd';
const { Content, Footer } = Layout;

class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      curPageName: ''
    }
  }

  // 组件加载前更新菜单ID
  componentWillMount() {
    const { pathname } = this.props.location;
    let curPageName;
    switch (pathname) {
      case '/receive':
      case '/users':
        curPageName = "任务领取"
        break;
      case '/report':
        curPageName = "数据报表"
        break;
      case '/':
      default:
        curPageName = "任务发布"
        break;
    }
    this.setState({
      curPageName
    })
  }

  render() {
    const { location, children } = this.props;

    return (
      <Layout className={styles.main}>
        <Header location={location} />
        <Content className={styles.container}>
          <Breadcrumb className={styles.breadCrumb}>
            <Breadcrumb.Item>主页</Breadcrumb.Item>
            <Breadcrumb.Item>{this.state.curPageName}</Breadcrumb.Item>
          </Breadcrumb>
          <div className={styles.content}>
            {children}
          </div>
        </Content>
        <Footer className={styles.footer}>
          cbpc ©2018 All rights reserved.
        </Footer>
      </Layout>
    )
  }
}

export default withRouter(Index);
