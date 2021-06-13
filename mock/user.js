// 代码中会兼容本地 service mock 以及部署站点的静态数据
export default {
  // 支持值为 Object 和 Array
  'GET /authApi/manager/v1/currentEmp': (req, res) => {
    res.status(200).send({
      subCode: 0,
      msg: 'success',
      code: 20000,
      subMsg: null,
      data: {
        userStatus: 1,
        displayName: 'admin',
        account: 'admin',
        gender: null,
        category: null,
        name: '超级管理员',
        extInfos: null,
        keyword: null,
        orgId: '0',
        id: '-1',
        empNo: null,
        pwdUpdateTime: '2019-05-17 02:32:57',
        idCode: null,
        avatarUrl: null,
        createTime: '2019-05-09 06:45:40',
        mobile: null,
      },
    });
  },
  // 支持值为 Object 和 Array
  'GET /test': (req, res) => {
    setTimeout(() => {
      res.status(200).send({
        subCode: 0,
        msg: 'success',
        code: 20000,
        subMsg: null,
        data: {
          userStatus: 1,
          displayName: 'admin',
          account: 'admin',
          gender: null,
          category: null,
          name: '超级管理员',
          extInfos: null,
          keyword: null,
          orgId: '0',
          id: '-1',
          empNo: null,
          pwdUpdateTime: '2019-05-17 02:32:57',
          idCode: null,
          avatarUrl: null,
          createTime: '2019-05-09 06:45:40',
          mobile: null,
        },
      });
    }, 10000);
  },
};
