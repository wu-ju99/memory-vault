import { Link } from 'react-router-dom';
import { useState } from 'react';
import { getUser } from '../utils/auth';
import useAdminUsers from '../hooks/useAdminUsers';
import useAdminMedia from '../hooks/useAdminMedia';
import useAdminAlbums from '../hooks/useAdminAlbums';
import AdminUserTable from '../components/admin/AdminUserTable';
import AdminMediaGrid from '../components/admin/AdminMediaGrid';
import AdminAlbumTable from '../components/admin/AdminAlbumTable';

const TABS = [
  { id: 'users', label: '成员' },
  { id: 'albums', label: '相册' },
  { id: 'media', label: '媒体' },
];

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users');
  const currentUser = getUser();
  const usersState = useAdminUsers();
  const albumsState = useAdminAlbums();
  const mediaState = useAdminMedia();

  function confirmDeleteUser(user) {
    if (!window.confirm(`确定删除成员「${user.username}」吗？该成员的内容会按数据库外键规则一并处理。`)) return;
    usersState.removeUser(user.id);
  }

  function confirmDeleteAlbum(album) {
    if (!window.confirm(`确定删除相册「${album.title}」吗？相册内媒体不会被删除。`)) return;
    albumsState.removeAlbum(album.id);
  }

  function confirmDeleteMedia(media) {
    if (!window.confirm(`确定删除 ${media.username} 上传的这条媒体吗？`)) return;
    mediaState.removeMedia(media.id);
  }

  const activeState = activeTab === 'users'
    ? usersState
    : activeTab === 'albums'
      ? albumsState
      : mediaState;

  return (
    <div className="page admin-page">
      <header className="topbar memory-topbar">
        <Link to="/" className="text-btn">返回首页</Link>
        <div className="album-title-block">
          <p className="eyebrow">Admin</p>
          <h1>管理面板</h1>
        </div>
        <span className="user-tag">{currentUser?.username}</span>
      </header>

      <main className="admin-shell">
        <aside className="admin-sidebar">
          <h2>管理</h2>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={activeTab === tab.id ? 'active' : ''}
              onClick={() => setActiveTab(tab.id)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </aside>

        <section className="admin-panel">
          <div className="admin-panel-header">
            <h2>{TABS.find((tab) => tab.id === activeTab)?.label}</h2>
            {activeState.loading && <span>加载中...</span>}
          </div>

          {activeState.message && <p className="status-text success">{activeState.message}</p>}
          {activeState.error && <p className="status-text error">{activeState.error}</p>}

          {activeTab === 'users' && (
            <AdminUserTable
              users={usersState.users}
              currentUserId={currentUser?.id}
              onSaveUser={usersState.saveUser}
              onDeleteUser={confirmDeleteUser}
            />
          )}

          {activeTab === 'albums' && (
            <AdminAlbumTable
              albums={albumsState.albums}
              onDeleteAlbum={confirmDeleteAlbum}
              onUploadCover={albumsState.uploadCover}
            />
          )}

          {activeTab === 'media' && (
            <AdminMediaGrid
              media={mediaState.media}
              onDeleteMedia={confirmDeleteMedia}
            />
          )}
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
