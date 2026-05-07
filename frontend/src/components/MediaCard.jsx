/**
 * MediaCard — 单条媒体展示卡片
 * Props: item, editingId, editText, saving, onStartEdit, onEditTextChange, onSaveEdit, onCancelEdit, onDelete, children
 */

import BASE_URL from '../config';

function MediaCard({ item, editingId, editText, saving, onStartEdit, onEditTextChange, onSaveEdit, onCancelEdit, onDelete, children }) {
  const fullUrl = BASE_URL + item.url;
  const isEditing = editingId === item.id;

  function formatDate(iso) {
    return iso ? iso.slice(0, 10) : '';
  }

  return (
    <div className={`grid-item ${item.type === 'video' ? 'grid-item-video' : ''}`}>
      {item.type === 'video' ? (
        <video src={fullUrl} controls className="grid-video" />
      ) : (
        <a href={fullUrl} target="_blank" rel="noopener noreferrer">
          <img src={fullUrl} alt="" />
        </a>
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
        {item.event_time ? `📷 ${formatDate(item.event_time)}` : `📅 ${formatDate(item.created_at)}`}
      </p>
      {item.username && (
        <p className="media-user">
          {item.username}
          {item.role === 'admin' && <span className="admin-badge">管理员</span>}
        </p>
      )}

      {children}

      {onDelete && (
        <button className="del-btn" onClick={() => onDelete(item)}>×</button>
      )}
    </div>
  );
}

export default MediaCard;
