/**
 * 首页 — 展示服务状态，需登录才能访问
 * GET /api/health → { status, timestamp, uptime }
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { clearAuth, getUser } from '../utils/auth';

function Home() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const user = getUser();

  useEffect(() => {
    api
      .get('/health')
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  function handleLogout() {
    clearAuth();
    navigate('/login');
  }

  return (
    <div className="page">
      <header className="topbar">
        <h1>Memory Vault</h1>
        <div className="topbar-right">
          {user && <span className="user-tag">{user.username}</span>}
          <button onClick={handleLogout} className="text-btn logout-btn">
            退出
          </button>
        </div>
      </header>

      <main className="content">
        <h2>Home Page</h2>

        {loading && <p className="status-text">加载中...</p>}
        {error && <p className="status-text error">请求失败: {error}</p>}
        {data && (
          <div className="health-card">
            <span className={`dot ${data.status === 'ok' ? 'dot-ok' : 'dot-err'}`} />
            <span>status: <strong>{data.status}</strong></span>
          </div>
        )}
      </main>
    </div>
  );
}

export default Home;
