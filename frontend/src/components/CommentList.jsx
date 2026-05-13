/**
 * CommentList — 自包含评论组件（单条媒体）
 * Props: mediaId, currentUserId, currentUserRole
 */

import { useState } from 'react';
import api from '../api/axios';
import { getUserDisplayName } from '../utils/userDisplay';
import UserIdentity from './UserIdentity';

function CommentList({ mediaId, currentUserId, currentUserRole }) {
  const [comments, setComments] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [text, setText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const isAdmin = currentUserRole === 'admin';

  function formatDate(iso) {
    return iso ? iso.slice(0, 10) : '';
  }

  async function fetchComments() {
    try {
      const res = await api.get(`/comments/${mediaId}`);
      setComments(res.data.comments);
      setLoaded(true);
    } catch {}
  }

  function toggle() {
    setExpanded((prev) => {
      const next = !prev;
      if (next && !loaded) fetchComments();
      return next;
    });
  }

  async function submit(parentId) {
    const content = parentId ? replyText.trim() : text.trim();
    if (!content) return;
    setSubmitting(true);
    try {
      await api.post('/comments', {
        media_id: mediaId,
        content,
        parent_id: parentId || undefined,
      });
      if (parentId) setReplyText('');
      else setText('');
      setReplyTo(null);
      fetchComments();
    } catch {} finally {
      setSubmitting(false);
    }
  }

  async function deleteComment(commentId) {
    try {
      await api.delete(`/comments/${commentId}`);
      fetchComments();
    } catch {}
  }

  function canDelete(comment) {
    return comment.user_id === currentUserId || isAdmin;
  }

  function renderComment(comment, depth) {
    const isReplying = replyTo === comment.id;

    return (
      <div key={comment.id} className={`comment-item ${depth > 0 ? 'comment-nested' : ''}`}>
        <div className="comment-main">
          <UserIdentity user={comment} avatarSize="sm" className="comment-user" />
          <span className="comment-content">{comment.content}</span>
          <span className="comment-date">{formatDate(comment.created_at)}</span>
          <button
            className="comment-reply-btn"
            onClick={() => setReplyTo(isReplying ? null : comment.id)}
          >
            {isReplying ? '取消' : '回复'}
          </button>
          {canDelete(comment) && (
            <button className="comment-del" onClick={() => deleteComment(comment.id)}>×</button>
          )}
        </div>

        {isReplying && (
          <div className="comment-input-row comment-reply-row">
            <input
              className="comment-input"
              placeholder={`回复 ${getUserDisplayName(comment)}...`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit(comment.id)}
            />
            <button className="comment-submit" disabled={submitting} onClick={() => submit(comment.id)}>
              发送
            </button>
          </div>
        )}

        {comment.replies?.length > 0 && (
          <div className="comment-replies">
            {comment.replies.map((r) => renderComment(r, depth + 1))}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <button className="comment-toggle" onClick={toggle}>
        💬 {loaded ? comments.length : ''}
      </button>

      {expanded && (
        <div className="comments">
          {loaded && comments.length === 0 && <p className="comment-empty">暂无评论</p>}
          {comments.map((c) => renderComment(c, 0))}

          {!replyTo && (
            <div className="comment-input-row">
              <input
                className="comment-input"
                placeholder="写评论..."
                value={replyTo ? '' : text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit(null)}
              />
              <button className="comment-submit" disabled={submitting} onClick={() => submit(null)}>
                发送
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default CommentList;
