/**
 * 首页 — 调用后端健康检查 API 展示服务状态
 * GET /api/health → { status, timestamp, uptime }
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Home() {
  const [data, setData] = useState(null);   // API 返回数据
  const [loading, setLoading] = useState(true); // 加载中
  const [error, setError] = useState(null);  // 错误信息

  useEffect(() => {
    axios
      .get('/api/health')
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="page">
      <header className="topbar">
        <h1>Memory Vault</h1>
        <Link to="/login" className="text-btn">退出</Link>
      </header>

      <main className="content">
        <h2>Home Page</h2>

        {/* 加载中 */}
        {loading && <p className="status-text">加载中...</p>}

        {/* 请求失败 */}
        {error && <p className="status-text error">请求失败: {error}</p>}

        {/* 请求成功 */}
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
