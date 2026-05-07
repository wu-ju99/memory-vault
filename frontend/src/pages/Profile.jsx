/**
 * 个人信息页 — 修改用户名和密码
 * 调用 PUT /api/auth/me
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { getUser, saveAuth, clearAuth } from '../utils/auth';

function Profile() {
  const user = getUser();
  const navigate = useNavigate();

  const [username, setUsername] = useState(user?.username || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username.trim()) {
      setError('用户名不能为空');
      return;
    }

    if (password) {
      if (password.length < 6) {
        setError('密码长度不能少于 6 位');
        return;
      }
      if (password !== confirmPassword) {
        setError('两次密码输入不一致');
        return;
      }
    }

    setLoading(true);

    try {
      const res = await api.put('/auth/me', {
        username: username.trim(),
        password: password || undefined,
        confirm_password: confirmPassword || undefined,
      });

      // 更新 localStorage 中的用户信息
      const token = localStorage.getItem('token');
      saveAuth(token, res.data.user);

      setSuccess('个人信息已更新');
      setPassword('');
      setConfirmPassword('');
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

  function handleLogout() {
    clearAuth();
    navigate('/login');
  }

  return (
    <div className="page">
      <header className="topbar">
        <h1>Memory Vault</h1>
        <div className="topbar-right">
          <a href="/" className="text-btn" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
            首页
          </a>
          <button onClick={handleLogout} className="text-btn logout-btn">退出</button>
        </div>
      </header>

      <main className="content">
        <form className="card" onSubmit={handleSubmit}>
          <h1>个人信息</h1>
          <p className="subtitle">修改你的用户名或密码</p>

          {error && <p className="status-text error">{error}</p>}
          {success && <p className="status-text success">{success}</p>}

          <label htmlFor="username">用户名</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="请输入新用户名"
            autoComplete="username"
            required
          />

          <label htmlFor="password">新密码（留空则不修改）</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="至少 6 位新密码"
            autoComplete="new-password"
          />

          <label htmlFor="confirmPassword">确认新密码</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="再次输入新密码"
            autoComplete="new-password"
          />

          <button type="submit" disabled={loading}>
            {loading ? '保存中...' : '保 存'}
          </button>

          <p className="hint">
            <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
              返回首页
            </a>
          </p>
        </form>
      </main>
    </div>
  );
}

export default Profile;
