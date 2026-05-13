import { useRef } from 'react';
import { Link } from 'react-router-dom';
import BASE_URL from '../config';
import UserIdentity from './UserIdentity';

function AlbumCard({
  album,
  index = 0,
  onCoverUpload,
  uploading = false,
  onRename,
  onDelete,
  managing = false,
}) {
  const fileInputRef = useRef(null);
  const rotations = [-2.5, 1.5, -1, 2, -1.8, 1];
  const rotate = rotations[index % rotations.length];
  const coverSrc = album.cover_url
    ? `${BASE_URL}${album.cover_url}${album.cover_version ? `?v=${album.cover_version}` : ''}`
    : '';

  function formatDate(iso) {
    return iso ? iso.slice(0, 10) : '';
  }

  function getDisplayYear() {
    if (album.album_year) return album.album_year;
    return formatDate(album.created_at);
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
            <span className="album-icon" aria-hidden="true">相册</span>
          )}
        </div>
        <div className="album-info">
          <h3>{album.title}</h3>
          <p>{getDisplayYear()}</p>
          {album.username && (
            <UserIdentity user={album} avatarSize="sm" className="album-owner" />
          )}
        </div>
      </Link>

      <div className="album-card-actions">
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
              disabled={uploading || managing}
              type="button"
            >
              {uploading ? '上传中...' : '换封面'}
            </button>
          </>
        )}

        {(onRename || onDelete) && (
          <div className="album-owner-actions">
            {onRename && (
              <button
                className="album-small-action"
                onClick={() => onRename(album)}
                disabled={managing}
                type="button"
              >
                改名
              </button>
            )}
            {onDelete && (
              <button
                className="album-small-action danger"
                onClick={() => onDelete(album)}
                disabled={managing}
                type="button"
              >
                删除
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export default AlbumCard;
