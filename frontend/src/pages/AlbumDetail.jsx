/**
 * 相册详情页 — 展示该相册内的媒体 + 上传 + 评论
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { getUser } from '../utils/auth';
import BASE_URL from '../config';

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

  // 评论
  const [commentsMap, setCommentsMap] = useState({});
  const [commentText, setCommentText] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [submitting, setSubmitting] = useState({});
  const [replyTo, setReplyTo] = useState({});

  const currentUser = getUser();

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

  // 按日期分组（优先 event_time，fallback created_at）
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

  // === 删除媒体 ===
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
      setMediaList((prev) => prev.map((m) => (m.id === mediaId ? { ...m, description: res.data.description } : m)));
      setEditingId(null);
    } catch {} finally { setSaving(false); }
  }

  // === 评论 ===
  function toggleComments(mediaId) {
    setExpandedComments((prev) => {
      const next = { ...prev, [mediaId]: !prev[mediaId] };
      if (next[mediaId] && !commentsMap[mediaId]) {
        fetchComments(mediaId);
      }
      return next;
    });
  }

  async function fetchComments(mediaId) {
    try {
      const res = await api.get(`/comments/${mediaId}`);
      setCommentsMap((prev) => ({ ...prev, [mediaId]: res.data.comments }));
    } catch {}
  }

  async function submitComment(mediaId, parentId) {
    const key = parentId ? `reply_${parentId}` : mediaId;
    const text = (commentText[key] || '').trim();
    if (!text) return;

    setSubmitting((prev) => ({ ...prev, [key]: true }));
    try {
      await api.post('/comments', {
        media_id: mediaId,
        content: text,
        parent_id: parentId || undefined,
      });
      setCommentText((prev) => ({ ...prev, [key]: '' }));
      setReplyTo((prev) => ({ ...prev, [mediaId]: null }));
      fetchComments(mediaId);
    } catch {} finally {
      setSubmitting((prev) => ({ ...prev, [key]: false }));
    }
  }

  async function deleteComment(commentId, mediaId) {
    try {
      await api.delete(`/comments/${commentId}`);
      fetchComments(mediaId);
    } catch {}
  }

  if (loading) return <div className="page"><main className="content"><p className="status-text">加载中...</p></main></div>;
  if (!album) return <div className="page"><main className="content"><p className="status-text">相册不存在</p><Link to="/" className="text-btn">← 返回</Link></main></div>;

  const images = mediaList.filter((item) => item.type === 'image');
  const videos = mediaList.filter((item) => item.type === 'video');

  // 递归渲染评论（支持二级嵌套）
  function renderComment(comment, mediaId, depth) {
    const repKey = `reply_${comment.id}`;

    return (
      <div key={comment.id} className={`comment-item ${depth > 0 ? 'comment-nested' : ''}`}>
        <div className="comment-main">
          <span className="comment-user">{comment.username}</span>
          <span className="comment-content">{comment.content}</span>
          <span className="comment-date">{formatDate(comment.created_at)}</span>
          <button className="comment-reply-btn" onClick={() => setReplyTo((prev) => ({ ...prev, [mediaId]: prev?.[mediaId] === comment.id ? null : comment.id }))}>
            {replyTo[mediaId] === comment.id ? '取消' : '回复'}
          </button>
          {comment.user_id === currentUser?.id && (
            <button className="comment-del" onClick={() => deleteComment(comment.id, mediaId)}>×</button>
          )}
        </div>

        {replyTo[mediaId] === comment.id && (
          <div className="comment-input-row comment-reply-row">
            <input
              className="comment-input"
              placeholder={`回复 ${comment.username}...`}
              value={commentText[repKey] || ''}
              onChange={(e) => setCommentText((prev) => ({ ...prev, [repKey]: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && submitComment(mediaId, comment.id)}
            />
            <button className="comment-submit" disabled={submitting[repKey]} onClick={() => submitComment(mediaId, comment.id)}>发送</button>
          </div>
        )}

        {comment.replies?.length > 0 && (
          <div className="comment-replies">
            {comment.replies.map((r) => renderComment(r, mediaId, depth + 1))}
          </div>
        )}
      </div>
    );
  }

  function renderItem(item) {
    const fullUrl = mediaUrl(item.url);
    const isEditing = editingId === item.id;
    const comments = commentsMap[item.id] || [];
    const showComments = expandedComments[item.id];

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

        <p className="grid-date">
          {item.event_time ? `📷 ${formatDate(item.event_time)}` : `📅 ${formatDate(item.created_at)}`}
        </p>
        {item.username && <p className="media-user">{item.username}</p>}

        {/* 评论按钮 */}
        <button className="comment-toggle" onClick={() => toggleComments(item.id)}>
          💬 {comments.length || ''}
        </button>

        {/* 评论区 */}
        {showComments && (
          <div className="comments">
            {comments.length === 0 && <p className="comment-empty">暂无评论</p>}
            {comments.map((c) => renderComment(c, item.id, 0))}
            {!replyTo[item.id] && (
              <div className="comment-input-row">
                <input
                  className="comment-input"
                  placeholder="写评论..."
                  value={commentText[item.id] || ''}
                  onChange={(e) => setCommentText((prev) => ({ ...prev, [item.id]: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && submitComment(item.id)}
                />
                <button className="comment-submit" disabled={submitting[item.id]} onClick={() => submitComment(item.id)}>发送</button>
              </div>
            )}
          </div>
        )}

        {item.user_id === currentUser?.id && (
          <button className="del-btn" onClick={() => handleDelete(item)}>×</button>
        )}
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

        {/* 视图切换 */}
        {mediaList.length > 0 && (
          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >▦ 网格</button>
            <button
              className={`view-btn ${viewMode === 'timeline' ? 'active' : ''}`}
              onClick={() => setViewMode('timeline')}
            >⏱ 时间轴</button>
          </div>
        )}

        {/* 网格视图 */}
        {viewMode === 'grid' && (
          <>
            {images.length > 0 && (
              <>
                <h3 className="section-title">📷 图片</h3>
                <div className="grid">{images.map(renderItem)}</div>
              </>
            )}
            {videos.length > 0 && (
              <>
                <h3 className="section-title">🎬 视频</h3>
                <div className="grid">{videos.map(renderItem)}</div>
              </>
            )}
          </>
        )}

        {/* 时间轴视图 */}
        {viewMode === 'timeline' && (
          <div className="timeline">
            {groupByDate(mediaList).map(([date, items]) => (
              <div key={date} className="timeline-group">
                <h3 className="timeline-date">{date}</h3>
                {items.images.length > 0 && (
                  <>
                    <h4 className="section-subtitle">📷 图片</h4>
                    <div className="grid">{items.images.map(renderItem)}</div>
                  </>
                )}
                {items.videos.length > 0 && (
                  <>
                    <h4 className="section-subtitle">🎬 视频</h4>
                    <div className="grid">{items.videos.map(renderItem)}</div>
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
