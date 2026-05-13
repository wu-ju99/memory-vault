/**
 * 个人信息页 — 头像、昵称、密码修改
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { getUser, saveAuth } from '../utils/auth';
import BASE_URL from '../config';
import AvatarUploader from '../components/AvatarUploader';
import NicknameEditor from '../components/NicknameEditor';
import '../styles/profile.css';

function Profile() {
  const [user, setUser] = useState(() => getUser());
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');
  const [pwdErr, setPwdErr] = useState('');
  const [savingPwd, setSavingPwd] = useState(false);

  function refreshUser(updated) {
    const token = localStorage.getItem('token');
    saveAuth(token, updated);
    setUser(updated);
  }

  async function savePassword(e) {
    e.preventDefault();
    setPwdMsg('');
    setPwdErr('');
    if (!oldPassword) { setPwdErr('请输入旧密码'); return; }
    if (!newPassword) { setPwdErr('请输入新密码'); return; }
    if (newPassword.length < 6) { setPwdErr('新密码长度不能少于 6 位'); return; }
    if (newPassword !== confirmPassword) { setPwdErr('两次新密码输入不一致'); return; }
    setSavingPwd(true);
    try {
      const formData = new FormData();
      formData.append('oldPassword', oldPassword);
      formData.append('newPassword', newPassword);
      formData.append('confirmPassword', confirmPassword);
      await api.put('/user/update-profile', formData);
      setPwdMsg('密码已更新');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwdErr(err.response?.data?.message || '更新失败');
    } finally {
      setSavingPwd(false);
    }
  }

  const currentAvatarUrl = user?.avatar ? BASE_URL + user.avatar : null;

  return (
    <div className="profile-page">
      <header className="profile-topbar">
        <div className="profile-topbar-title">
          <span>Profile Center</span>
          <strong>Memory Vault</strong>
        </div>
        <div className="profile-topbar-actions">
          <a href="/" className="profile-topbar-link" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
            返回首页
          </a>
        </div>
      </header>

      <main className="profile-shell">
        <section className="profile-hero">
          <span className="profile-hero-eyebrow">Account Settings</span>
          <h1>管理你的个人信息与账户安全</h1>
        </section>

        <div className="profile-grid">
          <aside className="profile-panel profile-summary">
            <div className="profile-identity-card">
              <div className="profile-identity-copy">
                <strong>{user?.nickname || '未设置昵称'}</strong>
                <span className="profile-user-handle">@{user?.username}</span>
                <p>你的头像、昵称和登录密码会在这里统一维护，后续只需要在一个地方完成资料更新。</p>
              </div>
            </div>

            <div className="profile-info-list">
              <div className="profile-info-row">
                <span>账号名称</span>
                <strong>@{user?.username}</strong>
              </div>
              <div className="profile-info-row">
                <span>当前昵称</span>
                <strong>{user?.nickname || '未设置'}</strong>
              </div>
              <div className="profile-info-row">
                <span>资料维护</span>
                <strong>头像 / 昵称 / 密码</strong>
              </div>
            </div>

            <div className="profile-notice">
              修改密码后，下次登录将使用新密码。头像支持 JPG、PNG、WEBP，文件大小不超过 2MB。
            </div>
          </aside>

          <section className="profile-panel profile-editor">
            <div className="profile-card-section">
              <div className="profile-section-head">
                <span>Profile</span>
                <h2>基本信息</h2>
                <p>先更新你的头像和昵称，让个人主页和互动信息更完整。</p>
              </div>

              <AvatarUploader currentAvatarUrl={currentAvatarUrl} onAvatarSaved={refreshUser} />
              <NicknameEditor initialNickname={user?.nickname} onNicknameSaved={refreshUser} />
            </div>

            <div className="profile-card-section">
              <div className="profile-section-head">
                <span>Security</span>
                <h2>修改密码</h2>
                <p>建议定期更新密码，避免在多个站点复用同一套口令。</p>
              </div>

              <form className="profile-password-form" onSubmit={savePassword}>
                <div className="profile-field">
                  <label htmlFor="oldPassword">旧密码</label>
                  <input
                    id="oldPassword"
                    className="profile-input"
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="输入当前密码"
                    autoComplete="current-password"
                  />
                </div>

                <div className="profile-field">
                  <label htmlFor="newPassword">新密码</label>
                  <input
                    id="newPassword"
                    className="profile-input"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="至少 6 位新密码"
                    autoComplete="new-password"
                  />
                  <p className="profile-password-tip">建议使用字母、数字和不同字符组合，避免使用过于简单的常见密码。</p>
                </div>

                <div className="profile-field">
                  <label htmlFor="confirmPassword">确认新密码</label>
                  <input
                    id="confirmPassword"
                    className="profile-input"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="再次输入新密码"
                    autoComplete="new-password"
                  />
                </div>

                <button type="submit" disabled={savingPwd} className="profile-save-btn">
                  {savingPwd ? '修改中...' : '更新密码'}
                </button>
                {pwdMsg && <p className="profile-status success">{pwdMsg}</p>}
                {pwdErr && <p className="profile-status error">{pwdErr}</p>}
              </form>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Profile;
