/**
 * 登录页：用户名/密码表单
 * 调用 POST /api/auth/login，成功后保存 token 并跳转首页
 */

import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../api/axios';
import { saveAuth } from '../utils/auth';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const successMessage = location.state?.message || '';

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('请输入用户名和密码');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/login', {
        username: username.trim(),
        password,
      });

      saveAuth(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message);
      } else {
        setError('网络错误，请确认后端已启动');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <form className="card" onSubmit={handleSubmit}>
        <h1>Memory Vault</h1>
        <p className="subtitle">登录你的私人空间</p>

        {successMessage && <p className="status-text success">{successMessage}</p>}
        {error && <p className="status-text error">{error}</p>}

        <label htmlFor="username">用户名</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="请输入用户名"
          autoComplete="username"
          required
        />

        <label htmlFor="password">密码</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="请输入密码"
          autoComplete="current-password"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? '登录中...' : '登录'}
        </button>

        <p className="hint">
          没有账号？<Link to="/register">去注册</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
