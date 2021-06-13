import React from 'react';
import { Link } from 'umi';
import Exception from '@/components/Exception';

const Exception404 = () => (
  <Exception type="404" desc="当前访问页面不存在" linkElement={Link} backText="返回" />
);

export default Exception404;
