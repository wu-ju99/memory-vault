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
    <div className="profile-avatar-uploader">
      <div className="profile-avatar-stage">
        <div className="profile-avatar" onClick={() => inputRef.current?.click()}>
          {displayUrl ? (
            <img src={displayUrl} alt="头像" />
          ) : (
            <span className="profile-avatar-placeholder">MV</span>
          )}
          <div className="profile-avatar-overlay">更换头像</div>
        </div>

        <div className="profile-avatar-meta">
          <strong>头像设置</strong>
          <p>点击头像即可选择新图片。支持 JPG、PNG、WEBP，上传前会先显示本地预览。</p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleSelect}
        style={{ display: 'none' }}
      />
      {file && (
        <div className="profile-avatar-actions">
          <button className="profile-inline-btn" disabled={uploading} onClick={handleUpload}>
            {uploading ? '上传中...' : '保存头像'}
          </button>
        </div>
      )}
      {message && <p className="profile-status success">{message}</p>}
      {error && <p className="profile-status error">{error}</p>}
    </div>
  );
}

export default AvatarUploader;
