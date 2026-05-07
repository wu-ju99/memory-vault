/**
 * 个人信息页 — 头像、昵称、密码修改
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { getUser, saveAuth, clearAuth } from '../utils/auth';
import BASE_URL from '../config';
import AvatarUploader from '../components/AvatarUploader';
import NicknameEditor from '../components/NicknameEditor';

function Profile() {
  const user = getUser();
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

  function handleLogout() {
    clearAuth();
    navigate('/login');
  }

  const currentAvatarUrl = user?.avatar ? BASE_URL + user.avatar : null;

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
        <div className="profile-card">

          <AvatarUploader currentAvatarUrl={currentAvatarUrl} onAvatarSaved={refreshUser} />

          <div className="profile-section">
            <p className="profile-username">@{user?.username}</p>
            <NicknameEditor initialNickname={user?.nickname} onNicknameSaved={refreshUser} />
          </div>

          <div className="profile-section">
            <h3 className="profile-section-title">修改密码</h3>
            <form onSubmit={savePassword}>
              <label htmlFor="oldPassword">旧密码</label>
              <input id="oldPassword" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="输入当前密码" autoComplete="current-password" />

              <label htmlFor="newPassword">新密码</label>
              <input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="至少 6 位新密码" autoComplete="new-password" />

              <label htmlFor="confirmPassword">确认新密码</label>
              <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="再次输入新密码" autoComplete="new-password" />

              <button type="submit" disabled={savingPwd} className="save-btn-full">
                {savingPwd ? '修改中...' : '修改密码'}
              </button>
              {pwdMsg && <p className="status-text success">{pwdMsg}</p>}
              {pwdErr && <p className="status-text error">{pwdErr}</p>}
            </form>
          </div>

          <p className="hint">
            <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>返回首页</a>
          </p>
        </div>
      </main>
    </div>
  );
}

export default Profile;
