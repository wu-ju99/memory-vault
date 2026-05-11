import BASE_URL from '../config';
import CommentList from './CommentList';

function formatDate(iso) {
  return iso ? iso.slice(0, 10) : '';
}

function MediaModal({
  media,
  currentUser,
  editingId,
  editText,
  saving,
  onStartEdit,
  onEditTextChange,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onSetCover,
  onClose,
  onPrevious,
  onNext,
}) {
  if (!media) return null;

  return (
    <div className="media-modal" role="dialog" aria-modal="true">
      <button className="media-modal-backdrop" onClick={onClose} aria-label="关闭" type="button" />
      <article className="memory-draw-card">
        <button className="modal-close" onClick={onClose} type="button" aria-label="关闭">&times;</button>
        <button className="modal-nav modal-prev" onClick={onPrevious} type="button">‹</button>
        <button className="modal-nav modal-next" onClick={onNext} type="button">›</button>

        <div className="modal-media-frame">
          {media.type === 'video' ? (
            <video src={BASE_URL + media.url} controls autoPlay className="modal-video" />
          ) : (
            <img src={BASE_URL + media.url} alt="" className="modal-image" />
          )}
        </div>

        <div className="modal-memory-details">
          <p className="eyebrow">{media.type === 'video' ? 'Video Memory' : 'Photo Memory'}</p>
          {editingId === media.id ? (
            <div className="edit-area modal-edit-area">
              <textarea
                className="edit-input"
                value={editText}
                onChange={(e) => onEditTextChange(e.target.value)}
                rows={3}
                autoFocus
              />
              <div className="edit-actions">
                <button className="edit-btn save" disabled={saving} onClick={() => onSaveEdit(media.id)}>
                  {saving ? '...' : '保存'}
                </button>
                <button className="edit-btn cancel" onClick={onCancelEdit}>取消</button>
              </div>
            </div>
          ) : (
            <button className="modal-description" onClick={() => onStartEdit(media)} type="button">
              {media.description || '添加这段回忆的描述...'}
            </button>
          )}

          <div className="modal-meta">
            <span>{media.event_time ? `拍摄 ${formatDate(media.event_time)}` : `上传 ${formatDate(media.created_at)}`}</span>
            {media.username && <span>{media.username}</span>}
          </div>

          <div className="modal-comments">
            <CommentList mediaId={media.id} currentUserId={currentUser?.id} currentUserRole={currentUser?.role} />
          </div>

          {media.type === 'image' && (
            <button className="modal-set-cover" onClick={() => onSetCover(media)} type="button">
              设为相册封面
            </button>
          )}

          {(media.user_id === currentUser?.id || currentUser?.role === 'admin') && (
            <button className="modal-delete" onClick={() => onDelete(media)} type="button">
              删除这条回忆
            </button>
          )}
        </div>
      </article>
    </div>
  );
}

export default MediaModal;
