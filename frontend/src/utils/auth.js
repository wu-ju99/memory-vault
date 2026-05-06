/**
 * 登录态工具 — token 的存取和清除
 */

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

/** 获取存储的 token */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/** 获取存储的用户信息 */
export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** 保存登录信息 */
export function saveAuth(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/** 清除登录信息 */
export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/** 是否已登录 */
export function isAuthenticated() {
  return !!getToken();
}
