/**
 * 登录页：用户名/密码表单
 * 调用 POST /api/auth/login，成功后保存 token 并跳转首页
 */

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { saveAuth } from '../utils/auth';
import AuthShell from '../components/auth/AuthShell';

const loginHighlights = [
  {
    title: '时间归档',
    description: '按相册、年份和成员整理内容，不再四处散落。',
  },
  {
    title: '协作清晰',
    description: '和家人朋友一起维护回忆，也保留清楚归属。',
  },
  {
    title: '长期保存',
    description: '照片、视频和说明统一沉淀，方便随时补充和回看。',
  },
];

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
    <AuthShell
      mode="login"
      heroEyebrow="Memory Vault"
      heroTitle="把回忆收进私人记忆库"
      heroDescription="登录后继续查看你的相册、视频和故事，把重要内容留在一个清晰、可长期保存的空间里。"
      formEyebrow="Welcome Back"
      formTitle="登录你的私人空间"
      formDescription="输入账号信息，继续进入你的回忆档案。"
      alternatePrompt="还没有账号？"
      alternateTo="/register"
      alternateLabel="立即注册"
      highlights={loginHighlights}
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {successMessage && (
          <p className="auth-status is-success" aria-live="polite">
            {successMessage}
          </p>
        )}
        {error && (
          <p className="auth-status is-error" role="alert">
            {error}
          </p>
        )}

        <div className="auth-field">
          <label htmlFor="username">用户名</label>
          <input
            id="username"
            className="auth-input"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="请输入用户名"
            autoComplete="username"
            required
          />
        </div>

        <div className="auth-field">
          <label htmlFor="password">密码</label>
          <input
            id="password"
            className="auth-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入密码"
            autoComplete="current-password"
            required
          />
        </div>

        <button className="auth-submit" type="submit" disabled={loading}>
          {loading ? '登录中...' : '登录'}
        </button>
      </form>
    </AuthShell>
  );
}

export default Login;
