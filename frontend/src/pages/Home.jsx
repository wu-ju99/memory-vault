/**
 * 首页 — 相册列表 + 新建相册
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { clearAuth, getUser } from '../utils/auth';
import AlbumCard from '../components/AlbumCard';

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

        {loading && <p className="status-text">加载中...</p>}

        {!loading && albums.length === 0 && (
          <p className="status-text">还没有相册，创建一个吧</p>
        )}

        {albums.length > 0 && (
          <div className="album-grid">
            {albums.map((a) => (
              <AlbumCard key={a.id} album={a} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Home;
