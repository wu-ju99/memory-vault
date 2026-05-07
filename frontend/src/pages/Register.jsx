/**
 * 注册页 — 用户名/密码/确认密码表单
 * 调用 POST /api/auth/register，成功后跳转登录页并提示
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password || !confirmPassword) {
      setError('请填写所有字段');
      return;
    }

    if (password.length < 6) {
      setError('密码长度不能少于 6 位');
      return;
    }

    if (password !== confirmPassword) {
      setError('两次密码输入不一致');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/register', {
        username: username.trim(),
        password,
        confirm_password: confirmPassword,
      });

      navigate('/login', { state: { message: '注册成功，请登录' } });
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
        <p className="subtitle">创建你的账号</p>

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
          placeholder="至少 6 位密码"
          autoComplete="new-password"
          required
        />

        <label htmlFor="confirmPassword">确认密码</label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="再次输入密码"
          autoComplete="new-password"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? '注册中...' : '注 册'}
        </button>

        <p className="hint">
          已有账号？<Link to="/login">去登录</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
