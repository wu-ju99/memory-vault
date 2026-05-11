import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { clearAuth, getUser } from '../utils/auth';
import AlbumCard from '../components/AlbumCard';

function Home() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [coverUploadingId, setCoverUploadingId] = useState(null);
  const [managingAlbumId, setManagingAlbumId] = useState(null);
  const [albumMessage, setAlbumMessage] = useState('');
  const [albumError, setAlbumError] = useState('');

  const navigate = useNavigate();
  const user = getUser();

  const fetchAlbums = useCallback(() => {
    setLoading(true);
    api.get('/albums')
      .then((res) => setAlbums(res.data.albums))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAlbums(); }, [fetchAlbums]);

  function clearAlbumStatus() {
    setAlbumMessage('');
    setAlbumError('');
  }

  async function handleCreate() {
    const title = newTitle.trim();
    if (!title) return;
    clearAlbumStatus();
    try {
      const res = await api.post('/albums', { title });
      setAlbums((prev) => [res.data, ...prev]);
      setNewTitle('');
    } catch (err) {
      setAlbumError(err.response?.data?.message || '创建相册失败');
    }
  }

  async function handleCoverUpload(album, file) {
    if (!file.type.startsWith('image/')) {
      setAlbumError('封面只能上传图片');
      return;
    }

    setCoverUploadingId(album.id);
    clearAlbumStatus();
    try {
      const formData = new FormData();
      formData.append('cover', file);
      const res = await api.put(`/albums/${album.id}/cover`, formData);
      const version = Date.now();
      setAlbums((prev) => prev.map((item) =>
        item.id === album.id
          ? { ...item, cover_url: res.data.cover_url, cover_version: version }
          : item
      ));
      setAlbumMessage('封面已更新');
    } catch (err) {
      setAlbumError(err.response?.data?.message || '封面上传失败');
    } finally {
      setCoverUploadingId(null);
    }
  }

  async function handleRenameAlbum(album) {
    const title = window.prompt('请输入新的相册名称', album.title);
    if (title === null) return;

    const trimmed = title.trim();
    if (!trimmed) {
      setAlbumError('相册名称不能为空');
      return;
    }
    if (trimmed === album.title) return;

    setManagingAlbumId(album.id);
    clearAlbumStatus();
    try {
      const res = await api.put(`/albums/${album.id}`, { title: trimmed });
      setAlbums((prev) => prev.map((item) =>
        item.id === album.id ? { ...item, ...res.data.album } : item
      ));
      setAlbumMessage('相册名称已更新');
    } catch (err) {
      setAlbumError(err.response?.data?.message || '修改相册名称失败');
    } finally {
      setManagingAlbumId(null);
    }
  }

  async function handleDeleteAlbum(album) {
    if (!window.confirm(`确定删除相册「${album.title}」吗？相册内的照片和视频不会被删除。`)) return;

    setManagingAlbumId(album.id);
    clearAlbumStatus();
    try {
      await api.delete(`/albums/${album.id}`);
      setAlbums((prev) => prev.filter((item) => item.id !== album.id));
      setAlbumMessage('相册已删除');
    } catch (err) {
      setAlbumError(err.response?.data?.message || '删除相册失败');
    } finally {
      setManagingAlbumId(null);
    }
  }

  function handleLogout() {
    clearAuth();
    navigate('/login');
  }

  return (
    <div className="page scrapbook-page">
      <header className="topbar memory-topbar">
        <div>
          <p className="eyebrow">Private Memory Book</p>
          <h1>Memory Vault</h1>
        </div>
        <div className="topbar-right">
          {user && <Link to="/profile" className="user-tag">{user.username}</Link>}
          <button onClick={handleLogout} className="text-btn logout-btn">退出</button>
        </div>
      </header>

      <main className="content memory-content">
        <section className="album-book-shell" aria-label="相册列表">
          <div className="book-spread">
            <div className="book-page book-page-left">
              <div className="book-page-header">
                <span>Shared Albums</span>
                <strong>{albums.length}</strong>
              </div>
              <div className="create-album create-album-note">
                <input
                  className="album-input-lg"
                  placeholder="新建一本相册..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
                <button className="upload-btn" onClick={handleCreate}>创建</button>
              </div>
              {loading && <p className="status-text">正在整理相册...</p>}
              {albumMessage && <p className="status-text success">{albumMessage}</p>}
              {albumError && <p className="status-text error">{albumError}</p>}
              {!loading && albums.length === 0 && (
                <p className="status-text">还没有相册，先创建一本吧。</p>
              )}
            </div>

            <div className="book-page book-page-right">
              {albums.length > 0 && (
                <div className="album-grid album-polaroid-grid">
                  {albums.map((album, index) => {
                    const isOwner = album.user_id === user?.id;
                    return (
                      <AlbumCard
                        key={album.id}
                        album={album}
                        index={index}
                        onCoverUpload={handleCoverUpload}
                        uploading={coverUploadingId === album.id}
                        onRename={isOwner ? handleRenameAlbum : null}
                        onDelete={isOwner ? handleDeleteAlbum : null}
                        managing={managingAlbumId === album.id}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;
