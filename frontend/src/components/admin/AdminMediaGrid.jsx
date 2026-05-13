import BASE_URL from '../../config';
import UserIdentity from '../UserIdentity';
import { getMediaTypeLabel } from '../../utils/uiLabels';

function AdminMediaGrid({ media, selectedIds = [], onToggleMedia, onDeleteMedia }) {
  const selectedSet = new Set(selectedIds);

  if (media.length === 0) {
    return <p className="status-text">没有符合条件的媒体。</p>;
  }

  return (
    <div className="admin-media-grid">
      {media.map((item) => (
        <article
          key={item.id}
          className={`admin-media-card ${selectedSet.has(item.id) ? 'selected' : ''}`}
        >
          <label className="admin-card-check">
            <input
              type="checkbox"
              checked={selectedSet.has(item.id)}
              onChange={(event) => onToggleMedia?.(item.id, event.target.checked)}
            />
            <span>选择</span>
          </label>
          <div className="admin-media-preview">
            {item.type === 'video' ? (
              <video src={BASE_URL + item.url} controls />
            ) : (
              <img src={BASE_URL + item.url} alt="" />
            )}
          </div>
          <div className="admin-media-meta">
            <UserIdentity
              user={item}
              avatarSize="sm"
              className="admin-content-owner"
            />
            <span>{item.album_title || '未归档相册'}</span>
            <span>{getMediaTypeLabel(item.type)} · {item.created_at?.slice(0, 10)}</span>
          </div>
          {item.description && <p>{item.description}</p>}
          <button className="admin-danger-btn" onClick={() => onDeleteMedia(item)} type="button">
            删除
          </button>
        </article>
      ))}
    </div>
  );
}

export default AdminMediaGrid;
