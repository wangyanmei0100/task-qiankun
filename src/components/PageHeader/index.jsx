import React, { PureComponent } from 'react';
import { Tabs } from 'dtd';
import classNames from 'classnames';
import styles from './index.less';
import BreadcrumbView from './breadcrumb';

const { TabPane } = Tabs;

export default class PageHeader extends PureComponent {
  onChange = (key) => {
    const { onTabChange } = this.props;
    if (onTabChange) {
      onTabChange(key);
    }
  };

  render() {
    const {
      title,
      logo,
      action,
      content,
      extraContent,
      tabList,
      className,
      tabActiveKey,
      tabDefaultActiveKey,
      tabBarExtraContent,
      wide = false,
      hiddenBreadcrumb = false,
    } = this.props;

    const clsString = classNames(styles.pageHeader, className);
    const activeKeyProps = {};
    if (tabDefaultActiveKey !== undefined) {
      activeKeyProps.defaultActiveKey = tabDefaultActiveKey;
    }
    if (tabActiveKey !== undefined) {
      activeKeyProps.activeKey = tabActiveKey;
    }
    return (
      <div className={clsString}>
        <div className={wide ? styles.wide : ''}>
          {hiddenBreadcrumb ? null : <BreadcrumbView {...this.props} />}
          <div className={styles.detail}>
            {logo && <div className={styles.logo}>{logo}</div>}
            <div className={styles.main}>
              <div className={styles.row}>
                {title && <h1 className={styles.title}>{title}</h1>}
                {action && <div className={styles.action}>{action}</div>}
              </div>
              <div className={styles.row}>
                {content && <div className={styles.content}>{content}</div>}
                {extraContent && <div className={styles.extraContent}>{extraContent}</div>}
              </div>
            </div>
          </div>
          {tabList && tabList.length ? (
            <Tabs
              className={styles.tabs}
              {...activeKeyProps}
              onChange={this.onChange}
              tabBarExtraContent={tabBarExtraContent}
            >
              {tabList.map((item) => (
                <TabPane tab={item.tab} key={item.key} />
              ))}
            </Tabs>
          ) : null}
        </div>
      </div>
    );
  }
}
