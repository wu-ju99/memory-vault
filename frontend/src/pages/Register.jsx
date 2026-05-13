/**
 * 注册页：用户名/密码/确认密码表单
 * 调用 POST /api/auth/register，成功后跳转登录页并提示
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import AuthShell from '../components/auth/AuthShell';

const registerHighlights = [
  {
    title: '独立空间',
    description: '先建立自己的回忆库，再慢慢扩展内容结构。',
  },
  {
    title: '持续补完',
    description: '每次上传都能补充描述，让旧照片保留更多上下文。',
  },
  {
    title: '后续更省力',
    description: '从一开始整理清楚，后面的搜索和筛选都会轻松很多。',
  },
];

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
    <AuthShell
      mode="register"
      heroEyebrow="Create Your Vault"
      heroTitle="开始整理你的回忆档案"
      heroDescription="注册后即可创建相册、上传照片和视频，把零散素材慢慢整理成一套清晰的私人记忆库。"
      formEyebrow="Create Account"
      formTitle="创建你的账号"
      formDescription="完成注册后，就能开始建立自己的回忆空间。"
      alternatePrompt="已经有账号？"
      alternateTo="/login"
      alternateLabel="返回登录"
      highlights={registerHighlights}
    >
      <form className="auth-form" onSubmit={handleSubmit}>
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
            placeholder="至少 6 位密码"
            autoComplete="new-password"
            required
          />
          <p className="auth-field-tip">至少 6 位，建议使用字母和数字组合。</p>
        </div>

        <div className="auth-field">
          <label htmlFor="confirmPassword">确认密码</label>
          <input
            id="confirmPassword"
            className="auth-input"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="再次输入密码"
            autoComplete="new-password"
            required
          />
        </div>

        <button className="auth-submit" type="submit" disabled={loading}>
          {loading ? '注册中...' : '创建账号'}
        </button>
      </form>
    </AuthShell>
  );
}

export default Register;
