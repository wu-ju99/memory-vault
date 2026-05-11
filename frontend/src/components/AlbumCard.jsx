import { Link } from 'react-router-dom';

function AlbumCard({ album, index = 0 }) {
  const rotations = [-2.5, 1.5, -1, 2, -1.8, 1];
  const rotate = rotations[index % rotations.length];

  function formatDate(iso) {
    return iso ? iso.slice(0, 10) : '';
  }

  return (
    <Link
      to={`/album/${album.id}`}
      className="album-card album-polaroid"
      style={{ '--photo-tilt': `${rotate}deg` }}
    >
      <div className="album-cover">
        <span className="album-icon" aria-hidden="true">PHOTO</span>
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
  );
}

export default AlbumCard;
