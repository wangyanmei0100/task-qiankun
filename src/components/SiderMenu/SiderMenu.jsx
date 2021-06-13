import React, { PureComponent } from 'react';
import { Layout, Tag, Sidebar } from 'dtd';
import pathToRegexp from 'path-to-regexp';
import { intersection } from 'lodash';

import { Link } from 'umi';
import styles from './index.less';
import { getAuthority } from '../../utils/authority';

const { Sider } = Layout;
// const { SubMenu } = Menu;

// Allow menu.js config icon as string or ReactNode
//   icon: 'setting',
//   icon: 'http://demo.com/icon.png',
//   icon: <Icon type="setting" />,
const getIcon = ({ icon, type }) => {
  if (!icon) {
    return '';
  }
  if (type === 'symbol') {
    return (
      <svg className={styles.icon} aria-hidden="true">
        <use xlinkHref={`#${icon}`} />
      </svg>
    );
  }
  if (typeof icon === 'string' && icon.indexOf('http') === 0) {
    return <img src={icon} alt="icon" className={styles.icon} />;
  }
  if (typeof icon === 'string') {
    return <i className={`iconfont-sidebar ${icon} ${styles.icon}`} />;
  }
  return icon;
};

export default class SiderMenu extends PureComponent {
  constructor(props) {
    super(props);
    this.menus = props.menuData;
    const { location: { pathname } = {} } = props;
    this.state = {
      openKeys: this.getDefaultCollapsedSubMenus(props),
      selectedKey: this.getSelectedMenuKeys(pathname || '').splice(-1, 1)[0],
      firstClick: true, // 是否第一次点击3级菜单页面
    };
  }

  UNSAFE_componentWillMount() {
    this.setMenuCollapsed();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { location: { pathname } = {} } = this.props;
    const { location: { pathname: nextPathname } = {} } = nextProps;
    if (nextPathname !== pathname) {
      this.setState(
        {
          openKeys: this.getDefaultCollapsedSubMenus(nextProps),
          selectedKey: this.getSelectedMenuKeys(nextPathname || '').splice(-1, 1)[0],
        },
        this.setMenuCollapsed
      );
    }
  }
  /**
   * Convert pathname to openKeys
   * /list/search/articles = > ['list','/list/search'] => ['/list/search']
   * @param  props
   */

  getDefaultCollapsedSubMenus(props) {
    const { location: { pathname } = {} } = props || this.props;
    // eg. /list/search/articles = > ['','list','search','articles']
    let snippets = (pathname || '').split('/');
    // Delete the end
    // eg.  delete 'articles'
    snippets.pop();
    // Delete the head
    // eg. delete ''
    snippets.shift();
    // eg. After the operation is completed, the array should be ['list','search']
    // eg. Forward the array as ['list','list/search']
    snippets = snippets.map((item, index) => {
      // If the array length > 1
      if (index > 0) {
        // eg. search => ['list','search'].join('/')
        return snippets.slice(0, index + 1).join('/');
      }
      // index 0 to not do anything
      return item;
    });
    snippets = snippets.map((item) => {
      const keys = this.getSelectedMenuKeys(`/${item}`);
      return keys[keys.length - 1];
    });
    // eg. ['list','list/search']
    return snippets;
  }
  /**
   * Recursively flatten the data
   * [{path:string},{path:string}] => {path,path2}
   * @param  menus
   */

  getFlatMenuKeys(menus) {
    let keys = [];
    menus.forEach((item) => {
      if (item.children && !item.hideChildrenInMenu) {
        keys.push(item.path);
        keys = keys.concat(this.getFlatMenuKeys(item.children));
      } else {
        keys.push(item.path);
      }
    });
    return keys;
  }
  /**
   * Get selected child nodes
   * /user/chen => ['user','/user/:id']
   * /form/detail-edit => ['form', 'form/detail']
   */

  getSelectedMenuKeys = (path) => {
    const flatMenuKeys = this.getFlatMenuKeys(this.menus);
    return flatMenuKeys.filter((item) => pathToRegexp(`${item}(.*)`).test(path));
  };
  /**
   * whether the menu should collapsed or not depend on the url
   * @return true -> close the main menu and open the drawer
   *         false -> open the main menu and close the drawer
   * 若为第三级菜单，则收缩菜单，展开抽屉；否则 展开菜单，收缩抽屉
   * 在url路径变化时，openkeys仅为当前路径的相关值  => 通过以下2点来判断 展开3级菜单：
   * 1.当前路径 所属的菜单 有3级菜单 -> menu中有children && openkeys至少为2级
   * 2.url路径符合routerDate && url的路径以openkeys的前两级开头(openkeys至少为2级已保证了这点)
   * 因此，通过 openkeys 为2级 -> 有3级菜单 && url路径符合routerDate且至少有3级 && url的路径前两级与openkeys相同 来判断 展开3级菜单
   * eg:
   * menu: /a/b/c         path: /a/b/c   true
   * menu: /a/b  /a/b/c    path: /a/ba/d  true
   * menu: /a/b           path: /a/b/c   false
   * todo: 404 路径 菜单 页面
   */

  getMenuCollapsed = () => {
    const { menuData } = this.props;
    const { openKeys } = this.state;
    const openKey = [...openKeys].splice(-1, 1)[0];
    const { flatMenuKeys, location: { pathname } = {} } = this.props;
    const isValidPath = flatMenuKeys.find((key) => pathToRegexp(key).test(pathname || ''));
    const hasDrawerMenu =
      flatMenuKeys.find((key) => pathToRegexp(`${openKey}/(.*)`).test(key)) &&
      openKey.split('/').length >= 3;
    if (!!isValidPath && !!hasDrawerMenu) {
      const shouldCloseThirdMenu = this.shouldCloseThirdMenu(menuData, openKey);
      return !!isValidPath && !!hasDrawerMenu && !shouldCloseThirdMenu;
    }
    return !!isValidPath && !!hasDrawerMenu;
  };

  /**
   *如果判断当前openKey是否需要显示三级菜单，如不需要则不展开三级菜单
   */

  shouldCloseThirdMenu = (menuData, openKey) => {
    // const { location: { pathname } } = props || this.props;
    // eg. /list/search/articles = > ['','list','search','articles']
    let snippets = openKey.split('/');
    // Delete the head
    // eg. delete ''
    snippets.shift();
    // eg. After the operation is completed, the array should be ['list','search']
    // eg. Forward the array as ['list','list/search']
    snippets = snippets.map((item, index) => {
      // If the array length > 1
      if (index > 0) {
        // eg. search => ['list','search'].join('/')
        return `/${snippets.slice(0, index + 1).join('/')}`;
      }
      // index 0 to not do anything
      return `/${item}`;
    });
    const level1 = menuData.find((key) => key.path === snippets[0]);
    const level2 = level1.children.find((key) => key.path === snippets[1]);
    return level2.hideChildrenInMenu;
  };
  /**
   * 当路由改变时，根据路由来判断并设置 主菜单以及3级菜单的开合
   */

  setMenuCollapsed = () => {
    const collapsed = this.getMenuCollapsed();
    this.handleChangeSubSidebar(!collapsed);
    if (collapsed) {
      this.setState({
        firstClick: false,
      });
    }
    /*
     ** 第一次 点击3级菜单的页面时，主菜单收缩，后续不再主动显示这种效果
     */
    const { firstClick } = this.state;
    const { dispatch } = this.props;
    if (firstClick) {
      dispatch({
        type: 'global/changeLayoutCollapsed',
        payload: collapsed,
      });
    }
  };
  /**
   * 判断是否是http链接.返回 Link 或 a
   * Judge whether it is http link.return a or Link
   * @memberof SiderMenu
   */

  getMenuItemPath = (item, level) => {
    const itemPath = this.conversionPath(item.path);

    const icon = getIcon(item.icon); // 为了保证三级菜单最多可显示字符数与一二级一致，三级菜单固定不展示icon
    const { target, name, isBeta } = item;
    // Is it a http link
    if (/^https?:\/\//.test(itemPath)) {
      return (
        <a href={itemPath} target={target}>
          {level < 3 && icon}
          <span>
            {name}
            {isBeta ? <Tag color="#ff625c">Beta</Tag> : ''}
          </span>
        </a>
      );
    }
    const { location: { pathname } = {}, isMobile, onCollapse } = this.props;
    return (
      <Link
        to={itemPath}
        target={target}
        replace={itemPath === pathname}
        onClick={
          isMobile
            ? () => {
                onCollapse(true);
              }
            : undefined
        }
      >
        {level < 3 && icon}
        <span>
          {name}
          {isBeta ? <Tag color="#ff625c">Beta</Tag> : ''}
        </span>
      </Link>
    );
  };
  /**
   * get SubMenu or Item
   */

  getSubMenuOrItem = (item, level) => {
    if (item.children && !item.hideChildrenInMenu && item.children.some((child) => child.name)) {
      let itemPath;
      const userRole = getAuthority();
      if (userRole === 'user') {
        const select = item.children.find((v) => v.authority !== 'admin');
        // 没有满足 条件的菜单项 直接return
        if (!select) return;

        itemPath = this.conversionPath(select.path);
      } else {
        itemPath = this.conversionPath(item.children[0].path);
      }
      /* eslint-disable */
      const { location: { pathname } = {} } = this.props;
      return (
        <Sidebar.SubSidebar
          // @ts-ignore
          title={
            level < 2 ? ( // 二级菜单和三级菜单渲染方式不一致，三级菜单在渲染第二级的时候需要确保点击二级菜单时会跳转第一个三级路由
              <span>
                {getIcon(item.icon)}
                <span>{item.name}</span>
                {item.isBeta ? <Tag color="#ff625c">Beta</Tag> : ''}
              </span>
            ) : (
              <Link to={itemPath} replace={itemPath === pathname}>
                {getIcon(item.icon)}
                <span>{item.name}</span>
                {item.isBeta ? <Tag color="#ff625c">Beta</Tag> : ''}
              </Link>
            )
          }
          key={item.path}
        >
          {this.getNavMenuItems(item.children, level + 1)}
        </Sidebar.SubSidebar>
      );
    }
    if (level === 3) {
      console.log(item);
    }
    // @ts-ignore
    return <Sidebar.Item key={item.path}>{this.getMenuItemPath(item, level)}</Sidebar.Item>;
  };
  /**
   * 获得菜单子节点
   * @memberof SiderMenu
   * @param menusData 菜单数据
   * @param level 当前菜单层级，当前sidebar支持菜单层级不超过三级
   */

  getNavMenuItems = (menusData, level) => {
    if (!menusData) {
      return [];
    }
    return menusData
      .filter((item) => item.name && !item.hideInMenu)
      .filter(this.checkBomItem)
      .filter(this.checkProjectId)
      .map((item) => {
        const ItemDom = this.getSubMenuOrItem(item, level);
        return this.checkPermissionItem(item.authority, ItemDom);
      })
      .filter((item) => !!item);
  };
  // conversion Path
  // 转化路径

  conversionPath = (path) => {
    if (path && path.indexOf('http') === 0) {
      return path;
    }
    return `/${path || ''}`.replace(/\/+/g, '/');
  };

  /*
   ** 根据 projectId 和 role 显示左侧菜单
   ** hasProjectId projectId 不为 null 显示
   */

  checkProjectId = (item) => {
    const { userInfo } = this.props;
    if (!item.hasProjectId) {
      return true;
    }
    if (userInfo && userInfo.projectId) {
      return true;
    }
    return false;
  };

  /*
   ** 查看bom编码，返回 bom编码指定要显示的菜单
   ** 菜单项中的bom值 是否跟 当前用户的 pageIds有交集
   ** 有交集，则展示该菜单，否则 不显示
   */
  checkBomItem = (item) => {
    if (typeof item.bom === 'boolean' || typeof item === 'number') {
      console.warn(`${item.name}bom参数格式错误`);
      return false;
    }

    const { pageIds } = this.props;
    const bom = !item.bom ? null : typeof item.bom === 'string' ? item.bom.split(',') : item.bom;

    if (item.children && item.children.some((child) => child.name)) {
      item.children = item.children.filter(this.checkBomItem);
    }

    return !bom || !bom.length || intersection(bom, pageIds).length !== 0;
  };

  // permission to check
  checkPermissionItem = (authority, ItemDom) => {
    const { Authorized } = this.props;
    if (Authorized && Authorized.check) {
      const { check } = Authorized;
      return check(authority, ItemDom, null);
    }
  };

  handleSidebarItemClick = ({ key }) => {
    this.setState({
      selectedKey: key,
    });
  };

  handleSubSidebarClick = ({ selected }) => {
    this.setState({
      selectedKey: selected.key,
    });
  };
  /**
   * 点击 一级菜单 或 有3级菜单的2级菜单时，都会触发该方法
   * 点击一级菜单时，@openKeys 为所有展开项（包括非当前路径的祖先级菜单）
   * 点击 有3级菜单的2级菜单时，@openKeys仅为 当前路径的相关菜单展开项（当前路径的相关祖先级菜单）
   */

  handleOpenChange = (openKeys) => {
    this.setState({ openKeys });
  };

  /*
   ** 作为 右侧内容区域 宽度变化的依据
   ** closed:ture -> 关闭抽屉 closed:false -> 打开抽屉
   */
  handleChangeSubSidebar = (closed) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/changeLayoutDrawerCollapsed',
      payload: !closed,
    });
  };

  /*
   ** 主菜单开合状态改变时触发
   */
  toggle = (collapsed) => {
    const { onCollapse } = this.props;
    onCollapse(collapsed);
    this.triggerResizeEvent();
  };

  triggerResizeEvent = () => {
    // eslint-disable-line
    const event = document.createEvent('HTMLEvents');
    event.initEvent('resize', true, false);
    window.dispatchEvent(event);
  };

  render() {
    const { collapsed } = this.props;
    const { openKeys, selectedKey } = this.state;
    return (
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        collapsedWidth={52}
        className={styles.sider}
        width={180}
      >
        <Sidebar
          key="Menu"
          collapsed={collapsed}
          selectedKey={selectedKey}
          selectedDrawer={selectedKey}
          onOpenChange={this.handleOpenChange}
          onCollapseChange={this.toggle}
          onClick={this.handleSidebarItemClick}
          onSubSidebarClick={this.handleSubSidebarClick}
          style={{ width: '100%' }}
          openKeys={openKeys}
          onSubSidebarChange={this.handleChangeSubSidebar}
        >
          {this.getNavMenuItems(this.menus, 1)}
        </Sidebar>
      </Sider>
    );
  }
}
