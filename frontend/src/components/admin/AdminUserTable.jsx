import { useState } from 'react';
import UserIdentity from '../UserIdentity';
import { getRoleLabel } from '../../utils/uiLabels';

function AdminUserTable({ users, currentUserId, onSaveUser, onDeleteUser }) {
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({});

  function startEdit(user) {
    setEditingId(user.id);
    setDraft({
      username: user.username,
      nickname: user.nickname || '',
      role: user.role,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft({});
  }

  async function saveEdit(userId) {
    try {
      await onSaveUser(userId, draft);
      cancelEdit();
    } catch {}
  }

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>成员</th>
            <th>角色</th>
            <th>相册</th>
            <th>媒体</th>
            <th>评论</th>
            <th>注册时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 && (
            <tr>
              <td colSpan="7" className="admin-empty-cell">没有符合条件的成员。</td>
            </tr>
          )}
          {users.map((user) => {
            const isEditing = editingId === user.id;
            const isCurrentUser = currentUserId === user.id;
            return (
              <tr key={user.id}>
                <td>
                  {isEditing ? (
                    <div className="admin-edit-stack">
                      <input
                        value={draft.username}
                        onChange={(e) => setDraft((prev) => ({ ...prev, username: e.target.value }))}
                      />
                      <input
                        value={draft.nickname}
                        onChange={(e) => setDraft((prev) => ({ ...prev, nickname: e.target.value }))}
                        placeholder="昵称"
                      />
                    </div>
                  ) : (
                    <UserIdentity
                      user={user}
                      avatarSize="md"
                      className="admin-member-identity"
                    />
                  )}
                </td>
                <td>
                  {isEditing ? (
                    <select
                      value={draft.role}
                      onChange={(e) => setDraft((prev) => ({ ...prev, role: e.target.value }))}
                    >
                      <option value="user">{getRoleLabel('user')}</option>
                      <option value="admin">{getRoleLabel('admin')}</option>
                    </select>
                  ) : (
                    <span className={`admin-role ${user.role}`}>{getRoleLabel(user.role)}</span>
                  )}
                </td>
                <td>{user.album_count}</td>
                <td>{user.media_count}</td>
                <td>{user.comment_count}</td>
                <td>{user.created_at?.slice(0, 10)}</td>
                <td>
                  {isEditing ? (
                    <div className="admin-actions">
                      <button onClick={() => saveEdit(user.id)} type="button">保存</button>
                      <button onClick={cancelEdit} type="button">取消</button>
                    </div>
                  ) : (
                    <div className="admin-actions">
                      <button onClick={() => startEdit(user)} type="button">编辑</button>
                      <button
                        className="danger"
                        disabled={isCurrentUser}
                        onClick={() => onDeleteUser(user)}
                        type="button"
                      >
                        删除
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default AdminUserTable;
