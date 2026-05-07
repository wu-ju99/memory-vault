/**
 * 首页 — 相册列表 + 新建相册
 * 点击相册进入详情页
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { clearAuth, getUser } from '../utils/auth';

function Home() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');

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

  async function handleCreate() {
    const title = newTitle.trim();
    if (!title) return;
    try {
      const res = await api.post('/albums', { title });
      setAlbums((prev) => [res.data, ...prev]);
      setNewTitle('');
    } catch {}
  }

  function handleLogout() { clearAuth(); navigate('/login'); }
  function formatDate(iso) { return iso ? iso.slice(0, 10) : ''; }

  return (
    <div className="page">
      <header className="topbar">
        <h1>Memory Vault</h1>
        <div className="topbar-right">
          {user && <Link to="/profile" className="user-tag">{user.username}</Link>}
          <button onClick={handleLogout} className="text-btn logout-btn">退出</button>
        </div>
      </header>

      <main className="content">
        {/* 新建相册 */}
        <div className="create-album">
          <input
            className="album-input-lg"
            placeholder="新建相册..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <button className="upload-btn" onClick={handleCreate}>创建</button>
        </div>

        {/* 相册列表 */}
        {loading && <p className="status-text">加载中...</p>}

        {!loading && albums.length === 0 && (
          <p className="status-text">还没有相册，创建一个吧</p>
        )}

        {albums.length > 0 && (
          <div className="album-grid">
            {albums.map((a) => (
              <Link key={a.id} to={`/album/${a.id}`} className="album-card">
                <div className="album-cover">
                  <span className="album-icon">📷</span>
                </div>
                <div className="album-info">
                  <h3>{a.title}</h3>
                  <p>{formatDate(a.created_at)}</p>
                  {a.username && <p className="album-owner">{a.username}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Home;
