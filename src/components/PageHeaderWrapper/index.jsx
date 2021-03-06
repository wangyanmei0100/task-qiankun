import React from 'react';
import { connect, Link, FormattedMessage } from 'umi';
import PageHeader from '@/components/PageHeader';
import MenuContext from '@/layouts/MenuContext';
import GridContent from './GridContent';
import styles from './index.less';

const PageHeaderWrapper = ({ children, contentWidth, wrapperClassName, top, ...restProps }) => (
  <div className={wrapperClassName}>
    {top}
    <MenuContext.Consumer>
      {(value) => (
        <PageHeader
          wide={contentWidth === 'Fixed'}
          home={<FormattedMessage id="menu.home" defaultMessage="Home" />}
          {...value}
          key="pageheader"
          {...restProps}
          linkElement={Link}
          itemRender={(item) => {
            if (item.locale) {
              return <FormattedMessage id={item.locale} defaultMessage={item.name} />;
            }
            return item.name;
          }}
        />
      )}
    </MenuContext.Consumer>
    {children ? (
      <div className={styles.content}>
        <GridContent>{children}</GridContent>
      </div>
    ) : null}
  </div>
);

export default connect(({ setting }) => ({
  contentWidth: setting.contentWidth,
}))(PageHeaderWrapper);
