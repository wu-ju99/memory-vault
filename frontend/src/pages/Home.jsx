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
              {!loading && albums.length === 0 && (
                <p className="status-text">还没有相册，先创建一本吧。</p>
              )}
            </div>

            <div className="book-page book-page-right">
              {albums.length > 0 && (
                <div className="album-grid album-polaroid-grid">
                  {albums.map((album, index) => (
                    <AlbumCard key={album.id} album={album} index={index} />
                  ))}
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
