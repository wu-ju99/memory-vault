/**
 * AlbumCard — 相册列表卡片
 * Props: album { id, title, username, created_at }
 */

import { Link } from 'react-router-dom';

function AlbumCard({ album }) {
  function formatDate(iso) {
    return iso ? iso.slice(0, 10) : '';
  }

  return (
    <Link to={`/album/${album.id}`} className="album-card">
      <div className="album-cover">
        <span className="album-icon">📷</span>
      </div>
      <div className="album-info">
        <h3>{album.title}</h3>
        <p>{formatDate(album.created_at)}</p>
        {album.username && <p className="album-owner">{album.username}</p>}
      </div>
    </Link>
  );
}

export default AlbumCard;
