/**
 * 相册详情页 — 展示该相册内的媒体 + 上传
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import BASE_URL from '../config';

function AlbumDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [album, setAlbum] = useState(null);
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);

  // 上传
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [description, setDescription] = useState('');
  const fileInputRef = useRef(null);

  // 编辑描述
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get('/albums'),
      api.get(`/media?album_id=${id}`),
    ])
      .then(([albumRes, mediaRes]) => {
        const found = albumRes.data.albums.find((a) => a.id === parseInt(id));
        setAlbum(found || null);
        setMediaList(mediaRes.data.media);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function mediaUrl(path) { return BASE_URL + path; }
  function formatDate(iso) { return iso ? iso.slice(0, 10) : ''; }

  async function handleUpload(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError('');
    setUploadMessage('');
    setUploading(true);

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) formData.append('files', files[i]);
      if (description.trim()) formData.append('description', description.trim());
      formData.append('album_id', id);

      const res = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUploadMessage(`上传完成: ${res.data.count} 个文件`);
      setDescription('');
      fetchData();
    } catch (err) {
      setUploadError(err.response?.data?.message || '上传失败');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleDelete(item) {
    if (!window.confirm('确定删除吗？')) return;
    try {
      await api.delete(`/media/${item.id}`);
      setMediaList((prev) => prev.filter((m) => m.id !== item.id));
    } catch {}
  }

  function startEdit(item) { setEditingId(item.id); setEditText(item.description || ''); }
  function cancelEdit() { setEditingId(null); setEditText(''); }
  async function saveEdit(mediaId) {
    setSaving(true);
    try {
      const res = await api.put(`/media/${mediaId}`, { description: editText });
      setMediaList((prev) => prev.map((m) => (m.id === mediaId ? { ...m, description: res.data.description } : m)));
      setEditingId(null);
    } catch {} finally { setSaving(false); }
  }

  if (loading) return <div className="page"><main className="content"><p className="status-text">加载中...</p></main></div>;
  if (!album) return <div className="page"><main className="content"><p className="status-text">相册不存在</p><Link to="/" className="text-btn">← 返回</Link></main></div>;

  // 按类型分组
  const images = mediaList.filter((item) => item.type === 'image');
  const videos = mediaList.filter((item) => item.type === 'video');

  // 渲染单个媒体卡片
  function renderItem(item) {
    const fullUrl = mediaUrl(item.url);
    const isEditing = editingId === item.id;

    return (
      <div key={item.id} className={`grid-item ${item.type === 'video' ? 'grid-item-video' : ''}`}>
        {item.type === 'video' ? (
          <video src={fullUrl} controls className="grid-video" />
        ) : (
          <a href={fullUrl} target="_blank" rel="noopener noreferrer">
            <img src={fullUrl} alt="" />
          </a>
        )}

        {isEditing ? (
          <div className="edit-area">
            <textarea className="edit-input" value={editText} onChange={(e) => setEditText(e.target.value)} rows={2} autoFocus />
            <div className="edit-actions">
              <button className="edit-btn save" disabled={saving} onClick={() => saveEdit(item.id)}>{saving ? '...' : '保存'}</button>
              <button className="edit-btn cancel" onClick={cancelEdit}>取消</button>
            </div>
          </div>
        ) : (
          <div className="desc-row" onClick={() => startEdit(item)}>
            {item.description ? <p className="grid-desc">{item.description}</p> : <p className="grid-desc placeholder">添加描述...</p>}
          </div>
        )}

        <p className="grid-date">{formatDate(item.created_at)}</p>
        <button className="del-btn" onClick={() => handleDelete(item)}>×</button>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="topbar">
        <Link to="/" className="text-btn">← 返回</Link>
        <h1>{album.title}</h1>
        <span className="album-date">{formatDate(album.created_at)}</span>
      </header>

      <main className="content">
        {/* 上传 */}
        <div className="upload-section">
          <textarea
            className="upload-desc"
            placeholder="写点回忆..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
          <input ref={fileInputRef} type="file" multiple accept="image/jpeg,image/png,image/webp,video/mp4,video/mov,video/webm" onChange={handleUpload} id="file-upload-detail" className="file-input" />
          <label htmlFor="file-upload-detail" className={`upload-btn ${uploading ? 'disabled' : ''}`}>
            {uploading ? '上传中...' : '上传图片 / 视频'}
          </label>
          {uploadMessage && <p className="status-text success">{uploadMessage}</p>}
          {uploadError && <p className="status-text error">{uploadError}</p>}
        </div>

        {/* 空状态 */}
        {!loading && mediaList.length === 0 && (
          <p className="status-text">暂无内容，上传第一张吧</p>
        )}

        {/* 图片区 */}
        {images.length > 0 && (
          <>
            <h3 className="section-title">📷 图片</h3>
            <div className="grid">
              {images.map(renderItem)}
            </div>
          </>
        )}

        {/* 视频区 */}
        {videos.length > 0 && (
          <>
            <h3 className="section-title">🎬 视频</h3>
            <div className="grid">
              {videos.map(renderItem)}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default AlbumDetail;
