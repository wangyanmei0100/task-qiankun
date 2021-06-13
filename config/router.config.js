export default [
  {
    path: '/',
    component: '../layouts/BasicLayout',
    routes: [
      { path: '/', redirect: '/welcome' },
      {
        path: '/welcome',
        name: '欢迎',
        icon: 'sidebarIcon-homePage2',
        component: './Welcome',
      },
      {
        component: './404',
      },
    ],
  },
  {
    component: './404',
  },
];
