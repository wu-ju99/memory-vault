/**
 * 封装的 axios 实例
 * 自动在请求头添加 Authorization: Bearer token
 */

import axios from 'axios';
import { getToken, clearAuth } from '../utils/auth';

const api = axios.create({
  baseURL: '/api',
});

// 请求拦截器：自动附加 token
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器：401 时自动清除登录态
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      clearAuth();
      // 不在登录页的话跳转
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
