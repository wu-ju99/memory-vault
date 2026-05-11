import { useRef } from 'react';
import { Link } from 'react-router-dom';
import BASE_URL from '../config';

function AlbumCard({ album, index = 0, onCoverUpload, uploading = false }) {
  const fileInputRef = useRef(null);
  const rotations = [-2.5, 1.5, -1, 2, -1.8, 1];
  const rotate = rotations[index % rotations.length];
  const coverSrc = album.cover_url
    ? `${BASE_URL}${album.cover_url}${album.cover_version ? `?v=${album.cover_version}` : ''}`
    : '';

  function formatDate(iso) {
    return iso ? iso.slice(0, 10) : '';
  }

  function handleCoverClick() {
    fileInputRef.current?.click();
  }

  function handleCoverChange(e) {
    const file = e.target.files?.[0];
    if (file) onCoverUpload?.(album, file);
    e.target.value = '';
  }

  return (
    <article
      className="album-card album-polaroid"
      style={{ '--photo-tilt': `${rotate}deg` }}
    >
      <Link to={`/album/${album.id}`} className="album-card-link">
        <div className="album-cover">
          {album.cover_url ? (
            <img src={coverSrc} alt={album.title} className="album-cover-img" />
          ) : (
            <span className="album-icon" aria-hidden="true">PHOTO</span>
          )}
        </div>
        <div className="album-info">
          <h3>{album.title}</h3>
          <p>{formatDate(album.created_at)}</p>
          {album.username && (
            <p className="album-owner">
              {album.username}
              {album.role === 'admin' && <span className="admin-badge">管理员</span>}
            </p>
          )}
        </div>
      </Link>

      {onCoverUpload && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="file-input"
            onChange={handleCoverChange}
          />
          <button
            className="album-cover-action"
            onClick={handleCoverClick}
            disabled={uploading}
            type="button"
          >
            {uploading ? '上传中...' : '换封面'}
          </button>
        </>
      )}
    </article>
  );
}

export default AlbumCard;
