/**
 * AvatarUploader — 头像上传组件
 * Props: currentAvatarUrl, onAvatarSaved(user)
 */

import { useState, useRef } from 'react';
import api from '../api/axios';

function AvatarUploader({ currentAvatarUrl, onAvatarSaved }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const displayUrl = preview || currentAvatarUrl;

  function handleSelect(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) {
      setError('头像文件不能超过 2MB');
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError('');
    setMessage('');
  }

  async function handleUpload() {
    if (!file) return;
    setMessage('');
    setError('');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await api.put('/user/update-profile', formData);
      onAvatarSaved(res.data.user);
      setFile(null);
      setMessage('头像已更新');
    } catch (err) {
      setError(err.response?.data?.message || '上传失败');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="profile-avatar-section">
      <div className="profile-avatar" onClick={() => inputRef.current?.click()}>
        {displayUrl ? (
          <img src={displayUrl} alt="头像" />
        ) : (
          <span className="profile-avatar-placeholder">?</span>
        )}
        <div className="profile-avatar-overlay">更换</div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleSelect}
        style={{ display: 'none' }}
      />
      {file && (
        <button className="edit-btn save" style={{ marginTop: 8 }} disabled={uploading} onClick={handleUpload}>
          {uploading ? '上传中...' : '保存头像'}
        </button>
      )}
      {message && <p className="status-text success">{message}</p>}
      {error && <p className="status-text error">{error}</p>}
    </div>
  );
}

export default AvatarUploader;
