import { Menu, Icon } from "antd";
import Link from "umi/link";

import { Layout } from "antd";
import styles from "./header.less";

const { Header } = Layout;

function HeaderMenu({ location }) {
  return (
    <Header className={styles.header}>
      <div className={styles.logo}>大张抽检车号自动分配</div>
      <Menu
        selectedKeys={[location.pathname]}
        mode="horizontal"
        theme="dark"
        className={styles.menu}
      >
        <Menu.Item key="/">
          <Link to="/">
            <Icon type="home" />任务发布
          </Link>
        </Menu.Item>
        <Menu.Item key="/users">
          <Link to="/users">
            <Icon type="bars" />任务领取
          </Link>
        </Menu.Item>
        <Menu.Item key="/report">
          <Link to="/report">
            <Icon type="frown-circle" />数据报表
          </Link>
        </Menu.Item>
      </Menu>
    </Header>
  );
}

export default HeaderMenu;
