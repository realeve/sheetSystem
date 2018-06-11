import { Menu, Icon } from "antd";
import Link from "umi/link";

import { Layout } from "antd";
import styles from "./header.less";

const { Header } = Layout;

function HeaderMenu({ location }) {
  return (
    <Header className={styles.header}>
      <div className={styles.logo}>报表系统</div>
      <Menu
        selectedKeys={[location.pathname]}
        mode="horizontal"
        theme="dark"
        className={styles.menu}
      >
        <Menu.Item key="/table">
          <Link to="/table">
            <Icon type="table" />报表
          </Link>
        </Menu.Item>
        <Menu.Item key="/chart">
          <Link to="/chart">
            <Icon type="area-chart" />图表
          </Link>
        </Menu.Item>
      </Menu>
    </Header>
  );
}

export default HeaderMenu;
