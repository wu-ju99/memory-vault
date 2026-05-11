import BASE_URL from '../config';

function MediaCard({
  item,
  index = 0,
  editingId,
  editText,
  saving,
  onStartEdit,
  onEditTextChange,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onOpen,
  children,
}) {
  const fullUrl = BASE_URL + item.url;
  const isEditing = editingId === item.id;
  const tilts = [-2.4, 1.7, -0.9, 2.5, -1.6, 0.8];
  const tilt = tilts[index % tilts.length];

  function formatDate(iso) {
    return iso ? iso.slice(0, 10) : '';
  }

  return (
    <div
      className={`grid-item scrapbook-photo ${item.type === 'video' ? 'grid-item-video' : ''}`}
      style={{ '--photo-tilt': `${tilt}deg` }}
    >
      {item.type === 'video' ? (
        <button className="media-preview-btn" onClick={() => onOpen?.(item)} type="button">
          <video src={fullUrl} muted className="grid-video" />
          <span className="video-play-mark">播放</span>
        </button>
      ) : (
        <button className="media-preview-btn" onClick={() => onOpen?.(item)} type="button">
          <img src={fullUrl} alt="" />
        </button>
      )}

      {isEditing ? (
        <div className="edit-area">
          <textarea
            className="edit-input"
            value={editText}
            onChange={(e) => onEditTextChange(e.target.value)}
            rows={2}
            autoFocus
          />
          <div className="edit-actions">
            <button className="edit-btn save" disabled={saving} onClick={() => onSaveEdit(item.id)}>
              {saving ? '...' : '保存'}
            </button>
            <button className="edit-btn cancel" onClick={onCancelEdit}>取消</button>
          </div>
        </div>
      ) : (
        <div className="desc-row" onClick={() => onStartEdit(item)}>
          {item.description ? (
            <p className="grid-desc">{item.description}</p>
          ) : (
            <p className="grid-desc placeholder">添加描述...</p>
          )}
        </div>
      )}

      <p className="grid-date">
        {item.event_time ? `拍摄 ${formatDate(item.event_time)}` : `上传 ${formatDate(item.created_at)}`}
      </p>
      {item.username && (
        <p className="media-user">
          {item.username}
          {item.role === 'admin' && <span className="admin-badge">管理员</span>}
        </p>
      )}

      {children}

      {onDelete && (
        <button className="del-btn" onClick={() => onDelete(item)}>x</button>
      )}
    </div>
  );
}

export default MediaCard;
