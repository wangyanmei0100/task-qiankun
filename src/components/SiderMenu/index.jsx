import 'rc-drawer-menu/assets/index.css';
import React from 'react';
import DrawerMenu from 'rc-drawer-menu';
import SiderMenu from './SiderMenu';

/**
 * Recursively flatten the data
 * [{path:string},{path:string}] => {path,path2}
 * @param  menus
 */
const getFlatMenuKeys = (menuData) => {
  let keys = [];
  menuData.forEach((item) => {
    if (item.children) {
      keys = keys.concat(getFlatMenuKeys(item.children));
    }
    keys.push(item.path);
  });
  return keys;
};
const SiderMenuWrapper = (props) => {
  const { isMobile, collapsed, onCollapse, menuData } = props;
  return isMobile ? (
    <DrawerMenu
      parent={null}
      level={null}
      iconChild={null}
      open={!collapsed}
      onMaskClick={() => {
        onCollapse(true);
      }}
      width="200px"
    >
      <SiderMenu
        {...props}
        collapsed={isMobile ? false : collapsed}
        flatMenuKeys={getFlatMenuKeys(menuData)}
      />
    </DrawerMenu>
  ) : (
    <SiderMenu {...props} flatMenuKeys={getFlatMenuKeys(menuData)} />
  );
};

export default SiderMenuWrapper;
