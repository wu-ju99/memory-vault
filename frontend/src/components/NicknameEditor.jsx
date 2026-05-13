/**
 * NicknameEditor — 昵称编辑组件
 * Props: initialNickname, onNicknameSaved(user)
 */

import { useState } from 'react';
import api from '../api/axios';

function NicknameEditor({ initialNickname, onNicknameSaved }) {
  const [nickname, setNickname] = useState(initialNickname || '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    setError('');
    if (!nickname.trim()) {
      setError('昵称不能为空');
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('nickname', nickname.trim());
      const res = await api.put('/user/update-profile', formData);
      onNicknameSaved(res.data.user);
      setMessage('昵称已更新');
    } catch (err) {
      setError(err.response?.data?.message || '更新失败');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="profile-nickname-form" onSubmit={handleSubmit}>
      <label className="profile-nickname-label">昵称</label>
      <div className="profile-nickname-row">
        <input
          className="profile-nickname-input"
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="设置昵称"
          autoComplete="nickname"
        />
        <button type="submit" className="profile-inline-btn" disabled={saving}>
          {saving ? '保存中...' : '保存昵称'}
        </button>
      </div>
      {message && <p className="profile-status success">{message}</p>}
      {error && <p className="profile-status error">{error}</p>}
    </form>
  );
}

export default NicknameEditor;
