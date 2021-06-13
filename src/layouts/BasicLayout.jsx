import React from 'react';
import { Layout, LocaleProvider } from 'dtd';
import DocumentTitle from 'react-document-title';
import isEqual from 'lodash/isEqual';
import memoizeOne from 'memoize-one';
import { connect, formatMessage } from 'umi';
import { ContainerQuery } from 'react-container-query';
import classNames from 'classnames';
import pathToRegexp from 'path-to-regexp';
import zhCN from 'dtd/lib/locale-provider/zh_CN';
import Authorized from '@/utils/Authorized';
import GlobalHeader from '@/components/GlobalHeader';
import PageLoading from '@/components/PageLoading';
import SiderMenu from '@/components/SiderMenu';
import Context from './MenuContext';
import Exception404 from '../pages/404';
import './BasicLayout.less';

const { Content, Header } = Layout;
// Conversion router to menu.
function formatter(data, parentAuthority, parentName) {
  return data
    .map((item) => {
      if (!item.name || !item.path) {
        return null;
      }

      let locale = 'menu';
      if (parentName) {
        locale = `${parentName}.${item.name}`;
      } else {
        locale = `menu.${item.name}`;
      }

      const result = {
        ...item,
        name: formatMessage({ id: locale, defaultMessage: item.name }),
        locale,
        authority: item.authority || parentAuthority,
      };
      if (item.routes) {
        const children = formatter(item.routes, item.authority, locale);
        // Reduce memory usage
        result.children = children;
      }
      delete result.routes;
      return result;
    })
    .filter((item) => item);
}

const memoizeOneFormatter = memoizeOne(formatter, isEqual);

const query = {
  'screen-xs': {
    maxWidth: 575,
  },
  'screen-sm': {
    minWidth: 576,
    maxWidth: 767,
  },
  'screen-md': {
    minWidth: 768,
    maxWidth: 991,
  },
  'screen-lg': {
    minWidth: 992,
    maxWidth: 1199,
  },
  'screen-xl': {
    minWidth: 1200,
    maxWidth: 1599,
  },
  'screen-xxl': {
    minWidth: 1600,
  },
};

class BasicLayout extends React.PureComponent {
  constructor(props) {
    super(props);
    const {
      route: { routes },
    } = props;
    this.getPageTitle = memoizeOne(this.getPageTitle);
    this.getBreadcrumbNameMap = memoizeOne(this.getBreadcrumbNameMap, isEqual);
    // 这个加传参的原因是，如果不加传参，则等同于在构造函数中直接使用了this.props,在ie9下会报错。
    this.breadcrumbNameMap = this.getBreadcrumbNameMap(memoizeOneFormatter(routes));
    this.matchParamsPath = memoizeOne(this.matchParamsPath, isEqual);
    this.Interval = null;
    this.state = {
      isMobile: false,
      menuData: this.getMenuData(),
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/getUserInfo',
    });
  }

  componentDidUpdate(preProps) {
    // After changing to phone mode,
    // if collapsed is true, you need to click twice to display
    this.breadcrumbNameMap = this.getBreadcrumbNameMap();
    const { isMobile } = this.state;
    const { collapsed } = this.props;
    if (isMobile && !preProps.isMobile && !collapsed) {
      this.handleMenuCollapse(false);
    }
  }

  componentWillUnmount() {
    if (this.Interval) {
      clearInterval(this.Interval);
    }
  }

  getContext() {
    const { location } = this.props;
    return {
      location,
      breadcrumbNameMap: this.breadcrumbNameMap,
    };
  }

  getMenuData() {
    const {
      route: { routes },
    } = this.props;
    return memoizeOneFormatter(routes);
  }

  /**
   * 获取面包屑映射
   * @param {Object} menuData 菜单配置
   */
  getBreadcrumbNameMap(menuData) {
    const routerMap = {};
    const mergeMenuAndRouter = (data) => {
      data.forEach((menuItem) => {
        if (menuItem.children) {
          mergeMenuAndRouter(menuItem.children);
        }
        // Reduce memory usage
        routerMap[menuItem.path] = menuItem;
      });
    };
    mergeMenuAndRouter(menuData || this.getMenuData());
    return routerMap;
  }

  matchParamsPath = (pathname) => {
    const pathKey = Object.keys(this.breadcrumbNameMap).find((key) =>
      pathToRegexp(key).test(pathname || '')
    );
    return this.breadcrumbNameMap[pathKey];
  };

  getPageTitle = (pathname) => {
    const currRouterData = this.matchParamsPath(pathname);

    if (!currRouterData) {
      return 'DT-User';
    }
    const message = formatMessage({
      id: currRouterData.locale || currRouterData.name,
      defaultMessage: currRouterData.name,
    });
    return `${message} - DT-User`;
  };

  getLayoutStyle = () => {
    const { isMobile } = this.state;
    const { fixSiderbar, collapsed } = this.props;
    if (fixSiderbar && !isMobile) {
      return {
        paddingLeft: collapsed ? '80px' : '256px',
      };
    }
    return null;
  };

  handleMenuCollapse = (collapsed) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/changeLayoutCollapsed',
      payload: collapsed,
    });
  };

  handleMenuClick = ({ key }) => {
    const { dispatch, location: { pathname, search } = {} } = this.props;
    switch (key) {
      case 'question':
        window.open(`${window.location.origin}/help`);
        break;
      case 'userInfo':
        window.open(`${window.location.origin}/user/base/accountMng`);
        break;
      case 'logout':
        dispatch({
          type: 'global/logout',
          payload: pathname + search,
        });
        break;
      default:
        break;
    }
  };

  render() {
    const {
      children,
      location: { pathname } = {},
      collapsed,
      location,
      dispatch,
      userInfo,
      isFetchedUser,
    } = this.props;
    if (!isFetchedUser) {
      return <PageLoading />;
    }
    const { menuData, isMobile } = this.state;
    const routerConfig = this.matchParamsPath(pathname);
    const layout = (
      <Layout>
        <Header style={{ padding: 0, height: '50px' }}>
          <GlobalHeader
            collapsed={collapsed}
            onCollapse={this.handleMenuCollapse}
            logo="/images/about_logo.png"
            logoCollapsed="/images/default_logo.png"
            location={location}
          />
        </Header>
        <Layout
          style={{
            ...this.getLayoutStyle(),
            position: 'relative',
            height: 'calc(100vh - 50px)',
          }}
        >
          <SiderMenu
            // 不带Authorized参数的情况下如果没有权限,会强制跳到403界面
            // If you do not have the Authorized parameter
            // you will be forced to jump to the 403 interface without permission
            Authorized={Authorized}
            menuData={menuData}
            userInfo={userInfo}
            collapsed={collapsed}
            location={location}
            isMobile={isMobile}
            onCollapse={this.handleMenuCollapse}
            dispatch={dispatch}
          />

          <Content>
            <Authorized
              authority={routerConfig && routerConfig.authority}
              noMatch={<Exception404 />}
            >
              {children}
            </Authorized>
          </Content>
        </Layout>
      </Layout>
    );
    return (
      <React.Fragment>
        <LocaleProvider locale={zhCN}>
          <DocumentTitle title={this.getPageTitle(pathname)}>
            <ContainerQuery query={query}>
              {(params) => (
                <Context.Provider value={this.getContext()}>
                  <div className={classNames(params)}>{layout}</div>
                </Context.Provider>
              )}
            </ContainerQuery>
          </DocumentTitle>
        </LocaleProvider>
      </React.Fragment>
    );
  }
}

export default connect(({ global, setting, user }) => ({
  collapsed: global.collapsed,
  ...setting,
  ...user,
}))(BasicLayout);
