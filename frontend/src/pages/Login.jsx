/**
 * 登录页 — 简单的用户名/密码表单
 * 极简风格，居中布局
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    // TODO: 接入后端登录接口
    console.log('登录:', { username, password });
    navigate('/');
  }

  return (
    <div className="page">
      <form className="card" onSubmit={handleSubmit}>
        <h1>Memory Vault</h1>
        <p className="subtitle">登录你的私人空间</p>

        <label htmlFor="username">用户名</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="请输入用户名"
          required
        />

        <label htmlFor="password">密码</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="请输入密码"
          required
        />

        <button type="submit">登 录</button>

        <p className="hint">
          还没有账号？<Link to="/login">注册</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
