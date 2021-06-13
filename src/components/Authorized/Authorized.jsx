import React from 'react';
import { Alert } from 'dtd';
import check from './CheckPermissions';

const Authorized = ({
  children,
  authority,
  noMatch = <Alert message="No permission." type="error" showIcon />,
}) => {
  const childrenRender = typeof children === 'undefined' ? null : children;
  const dom = check(authority, childrenRender, noMatch);
  return <>{dom}</>;
};

export default Authorized;
