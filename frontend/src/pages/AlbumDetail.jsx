import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { getUser } from '../utils/auth';
import MediaCard from '../components/MediaCard';
import CommentList from '../components/CommentList';
import BASE_URL from '../config';

function AlbumDetail() {
  const { id } = useParams();

  const [album, setAlbum] = useState(null);
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [description, setDescription] = useState('');
  const [eventTime, setEventTime] = useState('');
  const fileInputRef = useRef(null);

  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeMediaId, setActiveMediaId] = useState(null);

  const currentUser = getUser();

  const fetchData = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.get('/albums'),
      api.get(`/media?album_id=${id}`),
    ])
      .then(([albumRes, mediaRes]) => {
        setAlbum(albumRes.data.albums.find((item) => item.id === parseInt(id, 10)) || null);
        setMediaList(mediaRes.data.media);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const yearGroups = useMemo(() => {
    const groups = {};
    mediaList.forEach((item) => {
      const time = item.event_time || item.created_at;
      const year = time ? new Date(time).getFullYear().toString() : '未知年份';
      if (!groups[year]) groups[year] = [];
      groups[year].push(item);
    });

    return Object.entries(groups)
      .sort(([a], [b]) => {
        if (a === '未知年份') return 1;
        if (b === '未知年份') return -1;
        return Number(b) - Number(a);
      })
      .map(([year, items]) => ({ year, items }));
  }, [mediaList]);

  const activeIndex = mediaList.findIndex((item) => item.id === activeMediaId);
  const activeMedia = activeIndex >= 0 ? mediaList[activeIndex] : null;

  function formatDate(iso) {
    return iso ? iso.slice(0, 10) : '';
  }

  async function handleUpload(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadError('');
    setUploadMessage('');
    setUploading(true);
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i += 1) formData.append('files', files[i]);
      if (description.trim()) formData.append('description', description.trim());
      if (eventTime) formData.append('event_time', eventTime);
      formData.append('album_id', id);
      const res = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadMessage(`上传完成：${res.data.count} 个文件`);
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

  async function handleDelete(item) {
    if (!window.confirm('确定删除这条回忆吗？')) return;
    try {
      await api.delete(`/media/${item.id}`);
      setMediaList((prev) => prev.filter((media) => media.id !== item.id));
      if (activeMediaId === item.id) setActiveMediaId(null);
    } catch {}
  }

  function startEdit(item) {
    setEditingId(item.id);
    setEditText(item.description || '');
  }

  function cancelEdit() {
    setEditingId(null);
    setEditText('');
  }

  async function saveEdit(mediaId) {
    setSaving(true);
    try {
      const res = await api.put(`/media/${mediaId}`, { description: editText });
      setMediaList((prev) => prev.map((media) =>
        media.id === mediaId ? { ...media, description: res.data.description } : media
      ));
      setEditingId(null);
    } catch {} finally {
      setSaving(false);
    }
  }

  function renderMediaCard(item, index) {
    const canDelete = item.user_id === currentUser?.id || currentUser?.role === 'admin';
    return (
      <MediaCard
        key={item.id}
        item={item}
        index={index}
        editingId={editingId}
        editText={editText}
        saving={saving}
        onStartEdit={startEdit}
        onEditTextChange={setEditText}
        onSaveEdit={saveEdit}
        onCancelEdit={cancelEdit}
        onDelete={canDelete ? handleDelete : null}
        onOpen={(media) => setActiveMediaId(media.id)}
      >
        <CommentList mediaId={item.id} currentUserId={currentUser?.id} currentUserRole={currentUser?.role} />
      </MediaCard>
    );
  }

  function goToMedia(offset) {
    if (activeIndex < 0 || mediaList.length === 0) return;
    const nextIndex = (activeIndex + offset + mediaList.length) % mediaList.length;
    setActiveMediaId(mediaList[nextIndex].id);
  }

  function closeMediaModal() {
    setActiveMediaId(null);
  }

  useEffect(() => {
    if (!activeMediaId) return;
    function handleKey(e) {
      if (e.key === 'Escape') closeMediaModal();
      else if (e.key === 'ArrowLeft') goToMedia(-1);
      else if (e.key === 'ArrowRight') goToMedia(1);
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  if (loading) {
    return <div className="page scrapbook-page"><main className="content memory-content"><p className="status-text">正在翻找相册...</p></main></div>;
  }

  if (!album) {
    return (
      <div className="page scrapbook-page">
        <main className="content memory-content">
          <p className="status-text">相册不存在</p>
          <Link to="/" className="text-btn">返回首页</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="page scrapbook-page">
      <header className="topbar memory-topbar">
        <Link to="/" className="text-btn">返回</Link>
        <div className="album-title-block">
          <p className="eyebrow">Album</p>
          <h1>{album.title}</h1>
        </div>
        <span className="album-date">{formatDate(album.created_at)}</span>
      </header>

      <main className="content memory-content album-detail-content">
        <aside className="year-bookmarks" aria-label="年份书签">
          {yearGroups.map(({ year }) => (
            <a key={year} href={`#year-${year}`} className="year-bookmark">{year}</a>
          ))}
        </aside>

        <section className="album-book-shell detail-book-shell">
          <div className="book-spread detail-spread">
            <div className="book-page book-page-left upload-page">
              <div className="book-page-header">
                <span>New Memory</span>
                <strong>+</strong>
              </div>

              <div className="upload-section upload-note">
                <textarea
                  className="upload-desc"
                  placeholder="写点这张照片背后的回忆..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
                <input
                  className="upload-event"
                  type="datetime-local"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,video/mp4,video/mov,video/webm"
                  onChange={handleUpload}
                  id="file-upload-detail"
                  className="file-input"
                />
                <label htmlFor="file-upload-detail" className={`upload-btn ${uploading ? 'disabled' : ''}`}>
                  {uploading ? '上传中...' : '贴一张新照片 / 视频'}
                </label>
                {uploadMessage && <p className="status-text success">{uploadMessage}</p>}
                {uploadError && <p className="status-text error">{uploadError}</p>}
              </div>
            </div>

            <div className="book-page book-page-right memories-page">
              {mediaList.length === 0 && (
                <p className="status-text empty-memory">暂无内容，上传第一张回忆吧。</p>
              )}

              {yearGroups.map(({ year, items }) => {
                const photos = items.filter((i) => i.type === 'image');
                const videos = items.filter((i) => i.type === 'video');
                return (
                  <section key={year} id={`year-${year}`} className="memory-year-section">
                    <div className="year-heading">
                      <h2>{year}</h2>
                      <span>{items.length} 张</span>
                    </div>
                    {photos.length > 0 && (
                      <>
                        <p className="media-type-label">📷 照片 ({photos.length})</p>
                        <div className="grid scrapbook-grid">
                          {photos.map((item, index) => renderMediaCard(item, index))}
                        </div>
                      </>
                    )}
                    {videos.length > 0 && (
                      <>
                        <p className="media-type-label">🎬 视频 ({videos.length})</p>
                        <div className="grid scrapbook-grid">
                          {videos.map((item, index) => renderMediaCard(item, index))}
                        </div>
                      </>
                    )}
                  </section>
                );
              })}
            </div>
          </div>
        </section>

        {activeMedia && (
          <div className="media-modal" role="dialog" aria-modal="true">
            <button className="media-modal-backdrop" onClick={closeMediaModal} aria-label="关闭" type="button" />
            <article className="memory-draw-card">
              <button className="modal-close" onClick={closeMediaModal} type="button" aria-label="关闭">&times;</button>
              <button className="modal-nav modal-prev" onClick={() => goToMedia(-1)} type="button">‹</button>
              <button className="modal-nav modal-next" onClick={() => goToMedia(1)} type="button">›</button>

              <div className="modal-media-frame">
                {activeMedia.type === 'video' ? (
                  <video src={BASE_URL + activeMedia.url} controls autoPlay className="modal-video" />
                ) : (
                  <img src={BASE_URL + activeMedia.url} alt="" className="modal-image" />
                )}
              </div>

              <div className="modal-memory-details">
                <p className="eyebrow">{activeMedia.type === 'video' ? 'Video Memory' : 'Photo Memory'}</p>
                {editingId === activeMedia.id ? (
                  <div className="edit-area modal-edit-area">
                    <textarea
                      className="edit-input"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={3}
                      autoFocus
                    />
                    <div className="edit-actions">
                      <button className="edit-btn save" disabled={saving} onClick={() => saveEdit(activeMedia.id)}>
                        {saving ? '...' : '保存'}
                      </button>
                      <button className="edit-btn cancel" onClick={cancelEdit}>取消</button>
                    </div>
                  </div>
                ) : (
                  <button className="modal-description" onClick={() => startEdit(activeMedia)} type="button">
                    {activeMedia.description || '添加这段回忆的描述...'}
                  </button>
                )}

                <div className="modal-meta">
                  <span>{activeMedia.event_time ? `拍摄 ${formatDate(activeMedia.event_time)}` : `上传 ${formatDate(activeMedia.created_at)}`}</span>
                  {activeMedia.username && <span>{activeMedia.username}</span>}
                </div>

                <div className="modal-comments">
                  <CommentList mediaId={activeMedia.id} currentUserId={currentUser?.id} currentUserRole={currentUser?.role} />
                </div>

                {(activeMedia.user_id === currentUser?.id || currentUser?.role === 'admin') && (
                  <button className="modal-delete" onClick={() => handleDelete(activeMedia)} type="button">
                    删除这条回忆
                  </button>
                )}
              </div>
            </article>
          </div>
        )}
      </main>
    </div>
  );
}

export default AlbumDetail;
