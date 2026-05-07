/**
 * 相册详情页 — 上传 + 媒体列表（MediaCard） + 评论（CommentList）
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { getUser } from '../utils/auth';
import MediaCard from '../components/MediaCard';
import CommentList from '../components/CommentList';

function AlbumDetail() {
  const { id } = useParams();

  const [album, setAlbum] = useState(null);
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);

  // 上传
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [description, setDescription] = useState('');
  const [eventTime, setEventTime] = useState('');
  const fileInputRef = useRef(null);

  // 编辑描述
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [saving, setSaving] = useState(false);

  // 视图模式
  const [viewMode, setViewMode] = useState('grid');

  const currentUser = getUser();

  const fetchData = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get('/albums'),
      api.get(`/media?album_id=${id}`),
    ])
      .then(([albumRes, mediaRes]) => {
        setAlbum(albumRes.data.albums.find((a) => a.id === parseInt(id)) || null);
        setMediaList(mediaRes.data.media);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function formatDate(iso) { return iso ? iso.slice(0, 10) : ''; }

  function groupByDate(list) {
    const groups = {};
    list.forEach((item) => {
      const time = item.event_time || item.created_at;
      const date = new Date(time).toISOString().split('T')[0];
      if (!groups[date]) groups[date] = { images: [], videos: [] };
      groups[date][item.type === 'video' ? 'videos' : 'images'].push(item);
    });
    return Object.entries(groups).sort(([a], [b]) => new Date(b) - new Date(a));
  }

  // === 上传 ===
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
      if (eventTime) formData.append('event_time', eventTime);
      formData.append('album_id', id);
      const res = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadMessage(`上传完成: ${res.data.count} 个文件`);
      setDescription('');
      setEventTime('');
      fetchData();
    } catch (err) {
      setUploadError(err.response?.data?.message || '上传失败');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  // === 删除 ===
  async function handleDelete(item) {
    if (!window.confirm('确定删除吗？')) return;
    try {
      await api.delete(`/media/${item.id}`);
      setMediaList((prev) => prev.filter((m) => m.id !== item.id));
    } catch {}
  }

  // === 编辑描述 ===
  function startEdit(item) { setEditingId(item.id); setEditText(item.description || ''); }
  function cancelEdit() { setEditingId(null); setEditText(''); }
  async function saveEdit(mediaId) {
    setSaving(true);
    try {
      const res = await api.put(`/media/${mediaId}`, { description: editText });
      setMediaList((prev) => prev.map((m) =>
        m.id === mediaId ? { ...m, description: res.data.description } : m
      ));
      setEditingId(null);
    } catch {} finally { setSaving(false); }
  }

  if (loading) {
    return <div className="page"><main className="content"><p className="status-text">加载中...</p></main></div>;
  }
  if (!album) {
    return <div className="page"><main className="content"><p className="status-text">相册不存在</p><Link to="/" className="text-btn">← 返回</Link></main></div>;
  }

  const images = mediaList.filter((item) => item.type === 'image');
  const videos = mediaList.filter((item) => item.type === 'video');

  function renderMediaCard(item) {
    const canDelete = item.user_id === currentUser?.id || currentUser?.role === 'admin';
    return (
      <MediaCard
        key={item.id}
        item={item}
        editingId={editingId}
        editText={editText}
        saving={saving}
        onStartEdit={startEdit}
        onEditTextChange={setEditText}
        onSaveEdit={saveEdit}
        onCancelEdit={cancelEdit}
        onDelete={canDelete ? handleDelete : null}
      >
        <CommentList mediaId={item.id} currentUserId={currentUser?.id} currentUserRole={currentUser?.role} />
      </MediaCard>
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
        <div className="upload-section">
          <textarea className="upload-desc" placeholder="写点回忆..." value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          <input className="upload-event" type="datetime-local" value={eventTime} onChange={(e) => setEventTime(e.target.value)} />
          <input ref={fileInputRef} type="file" multiple accept="image/jpeg,image/png,image/webp,video/mp4,video/mov,video/webm" onChange={handleUpload} id="file-upload-detail" className="file-input" />
          <label htmlFor="file-upload-detail" className={`upload-btn ${uploading ? 'disabled' : ''}`}>
            {uploading ? '上传中...' : '上传图片 / 视频'}
          </label>
          {uploadMessage && <p className="status-text success">{uploadMessage}</p>}
          {uploadError && <p className="status-text error">{uploadError}</p>}
        </div>

        {!loading && mediaList.length === 0 && (
          <p className="status-text">暂无内容，上传第一张吧</p>
        )}

        {mediaList.length > 0 && (
          <div className="view-toggle">
            <button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>▦ 网格</button>
            <button className={`view-btn ${viewMode === 'timeline' ? 'active' : ''}`} onClick={() => setViewMode('timeline')}>⏱ 时间轴</button>
          </div>
        )}

        {viewMode === 'grid' && (
          <>
            {images.length > 0 && (
              <>
                <h3 className="section-title">📷 图片</h3>
                <div className="grid">{images.map(renderMediaCard)}</div>
              </>
            )}
            {videos.length > 0 && (
              <>
                <h3 className="section-title">🎬 视频</h3>
                <div className="grid">{videos.map(renderMediaCard)}</div>
              </>
            )}
          </>
        )}

        {viewMode === 'timeline' && (
          <div className="timeline">
            {groupByDate(mediaList).map(([date, items]) => (
              <div key={date} className="timeline-group">
                <h3 className="timeline-date">{date}</h3>
                {items.images.length > 0 && (
                  <>
                    <h4 className="section-subtitle">📷 图片</h4>
                    <div className="grid">{items.images.map(renderMediaCard)}</div>
                  </>
                )}
                {items.videos.length > 0 && (
                  <>
                    <h4 className="section-subtitle">🎬 视频</h4>
                    <div className="grid">{items.videos.map(renderMediaCard)}</div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default AlbumDetail;
