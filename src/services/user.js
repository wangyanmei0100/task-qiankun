import request from '@/utils/request';

export default async function getUserInfo() {
  return request('/authApi/manager/v1/currentEmp');
}
