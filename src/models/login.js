import { parse, stringify } from 'qs';
import { history } from 'umi';

export function getPageQuery() {
  return parse(window.location.href.split('?')[1]);
}

const Model = {
  namespace: 'login',
  state: {
    status: undefined,
  },
  effects: {
    *logout(_, { put }) {
      const { redirect } = getPageQuery(); // redirect
      if (window.location.pathname !== '/user/login' && !redirect) {
        yield put(
          history.replace({
            pathname: '/user/login',
            search: stringify({
              redirect: window.location.href,
            }),
          })
        );
      }
    },
  },
  reducers: {
    changeLoginStatus(state, { payload }) {
      return { ...state, status: payload.status };
    },
  },
};
export default Model;
