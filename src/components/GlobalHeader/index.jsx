import React, { PureComponent } from 'react';
import { Modal } from 'dtd';
import { connect } from 'umi';
import RCTopNav from '@dtfe/rc-topNav';

import styles from './index.less';

class GlobalHeader extends PureComponent {
  handleMenuClick = ({ key }) => {
    const { platformInfo = {}, logoCollapsed } = this.props;
    switch (key) {
      case 'about':
        Modal.info({
          title: '关于',
          okText: '确定',
          className: styles.versionModal,
          content: (
            <div className={styles.versionContent}>
              <div className={styles.versionLogo}>
                <img src={logoCollapsed} style={{ height: '60px' }} alt="" />
              </div>
              <div>
                <div className={styles.proName}>DTSphere Studio</div>
                <div className={styles.versionTitle}>
                  <span style={{ fontFamily: 'PingFangSC-Regular', marginRight: '8px' }}>版本</span>
                  <span style={{ fontFamily: 'ArialMT' }}>{platformInfo.version}</span>
                </div>
                {platformInfo?.isDisplayCopyright === 'true' && (
                  <div className={styles.copyright}>{platformInfo?.copyrightInfo}</div>
                )}
              </div>
            </div>
          ),
          onOk() {},
        });
        break;
      case 'logout': // 登出不能用fetch请求，会报跨域问题
        window.location.href = '/logout/cas';
        break;
      default:
        break;
    }
  };

  render() {
    const {
      logoCollapsed,
      logo: defaultLogo,
      collapsed,
      userInfo: { loginUser },
    } = this.props;
    const logo = {
      logoUrl: collapsed ? logoCollapsed : defaultLogo,
      homeUrl: '',
      collapsed,
    };
    const tenant = {
      depts: [
        {
          id: 1,
          name: '浙江省杭州市西湖区云栖小镇中大银座部门1号楼',
        },
        {
          id: 22,
          name: '浙江省杭州市西湖区云栖小镇中大银座部门22号楼',
        },
      ],
      currentDeptId: 1,
      tenantDropdownClick: (selected) => {
        console.log(selected);
      },
    };
    const nav = {
      navArray: [
        {
          id: '001',
          text: '数梦工场',
          href: `http://www.dtdream.com/`,
          openWithNewWindow: false,
          children: [
            {
              id: '00011',
              text: '产品',
              href: 'http://www.dtdream.com/privatecloud/index.jhtml',
              openWithNewWindow: true,
            },
            {
              id: '00012',
              text: '解决方案',
              href: 'http://www.dtdream.com/privatecloud/index.jhtml',
              openWithNewWindow: true,
            },
          ],
        },
        {
          id: '0002',
          text: '数据标准2',
          href: 'http://192.168.127.196:51001/ds/views/index.html#/?tenant=11',
          openWithNewWindow: true,
        },
        {
          id: '00013',
          text: '数据标准3',
          href: 'http://192.168.127.196:51001/ds/views/index.html#/?tenant=12',
          openWithNewWindow: true,
        },
      ],
    };
    const user = {
      currentUser: {
        userName: loginUser,
      },
      usrArray: [
        {
          id: 'about',
          text: '关于',
        },
        {
          id: 'logout',
          text: '退出登录',
        },
      ],
      userDropdownClick: (selected) => {
        this.handleMenuClick(selected);
      },
    };

    return (
      <div className={styles.header}>
        <RCTopNav logo={logo} tenant={tenant} nav={nav} user={user} />
      </div>
    );
  }
}

export default connect(({ user }) => ({
  ...user,
}))(GlobalHeader);
