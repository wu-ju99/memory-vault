import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { getUser } from '../utils/auth';
import SearchBar from '../components/SearchBar';
import FilterSelect from '../components/FilterSelect';
import FilterToolbar from '../components/FilterToolbar';
import ConfirmDialog from '../components/dialogs/ConfirmDialog';
import useAdminUsersQuery from '../hooks/useAdminUsersQuery';
import useAdminUserMutations from '../hooks/useAdminUserMutations';
import useAdminMediaQuery from '../hooks/useAdminMediaQuery';
import useAdminMediaMutations from '../hooks/useAdminMediaMutations';
import useAdminAlbumsQuery from '../hooks/useAdminAlbumsQuery';
import useAdminAlbumMutations from '../hooks/useAdminAlbumMutations';
import useUrlFilterState from '../hooks/useUrlFilterState';
import AdminUserTable from '../components/admin/AdminUserTable';
import AdminMediaGrid from '../components/admin/AdminMediaGrid';
import AdminAlbumTable from '../components/admin/AdminAlbumTable';
import AdminBatchToolbar from '../components/admin/AdminBatchToolbar';
import { getAlbumYearValue, getMediaYearValue, UNKNOWN_YEAR } from '../utils/yearGroups';
import { getUserDisplayName } from '../utils/userDisplay';
import { getMediaTypeLabel, getRoleLabel, UNKNOWN_YEAR_LABEL } from '../utils/uiLabels';

const TABS = [
  { id: 'users', label: '成员' },
  { id: 'albums', label: '相册' },
  { id: 'media', label: '媒体' },
];

function buildUserRoleOptions(users) {
  const roles = Array.from(new Set(users.map((user) => user.role)));
  return [
    { value: '', label: '全部角色' },
    ...roles.map((role) => ({ value: role, label: getRoleLabel(role) })),
  ];
}

function buildAlbumOwnerOptions(albums) {
  const owners = new Map();
  albums.forEach((album) => {
    if (!owners.has(album.user_id)) {
      owners.set(album.user_id, {
        value: String(album.user_id),
        label: getUserDisplayName(album),
      });
    }
  });
  return [
    { value: '', label: '全部创建者' },
    ...Array.from(owners.values()).sort((a, b) => a.label.localeCompare(b.label, 'zh-Hans-CN')),
  ];
}

function buildAlbumYearOptions(albums) {
  const years = Array.from(new Set(albums.map(getAlbumYearValue)));
  return [
    { value: '', label: '全部年份' },
    ...years.map((year) => ({
      value: year,
      label: year === UNKNOWN_YEAR ? UNKNOWN_YEAR_LABEL : year,
    })),
  ];
}

function buildMediaOwnerOptions(media) {
  const owners = new Map();
  media.forEach((item) => {
    if (!owners.has(item.user_id)) {
      owners.set(item.user_id, {
        value: String(item.user_id),
        label: getUserDisplayName(item),
      });
    }
  });
  return [
    { value: '', label: '全部上传者' },
    ...Array.from(owners.values()).sort((a, b) => a.label.localeCompare(b.label, 'zh-Hans-CN')),
  ];
}

function buildMediaAlbumOptions(media) {
  const albums = new Map();
  media.forEach((item) => {
    if (item.album_id && !albums.has(item.album_id)) {
      albums.set(item.album_id, {
        value: String(item.album_id),
        label: item.album_title || `相册 ${item.album_id}`,
      });
    }
  });
  return [
    { value: '', label: '全部相册' },
    ...Array.from(albums.values()).sort((a, b) => a.label.localeCompare(b.label, 'zh-Hans-CN')),
  ];
}

function buildMediaYearOptions(media) {
  const years = Array.from(new Set(media.map(getMediaYearValue)));
  return [
    { value: '', label: '全部年份' },
    ...years.map((year) => ({
      value: year,
      label: year === UNKNOWN_YEAR ? UNKNOWN_YEAR_LABEL : year,
    })),
  ];
}

function buildMediaTypeOptions(media) {
  const types = Array.from(new Set(media.map((item) => item.type)));
  return [
    { value: '', label: '全部类型' },
    ...types.map((type) => ({
      value: type,
      label: getMediaTypeLabel(type),
    })),
  ];
}

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users');
  const [selectedAlbumIds, setSelectedAlbumIds] = useState([]);
  const [selectedMediaIds, setSelectedMediaIds] = useState([]);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    scope: '',
    targetId: null,
    targetIds: [],
    title: '',
    description: '',
    note: '',
    error: '',
  });
  const [dialogSubmitting, setDialogSubmitting] = useState(false);
  const currentUser = getUser();

  const userFilters = useUrlFilterState({ q: '', role: '' }, { prefix: 'admin_users_' });
  const usersQuery = useAdminUsersQuery(userFilters.filters);
  const usersMutations = useAdminUserMutations(usersQuery.reload);

  const albumFilters = useUrlFilterState({ q: '', year: '', owner: '' }, { prefix: 'admin_albums_' });
  const albumsQuery = useAdminAlbumsQuery(albumFilters.filters);
  const albumsMutations = useAdminAlbumMutations(albumsQuery.reload);

  const mediaFilters = useUrlFilterState(
    { q: '', type: '', year: '', owner: '', album: '' },
    { prefix: 'admin_media_' }
  );
  const mediaQuery = useAdminMediaQuery(mediaFilters.filters);
  const mediaMutations = useAdminMediaMutations(mediaQuery.reload);

  const userRoleOptions = useMemo(() => buildUserRoleOptions(usersQuery.users), [usersQuery.users]);
  const albumOwnerOptions = useMemo(() => buildAlbumOwnerOptions(albumsQuery.albums), [albumsQuery.albums]);
  const albumYearOptions = useMemo(() => buildAlbumYearOptions(albumsQuery.albums), [albumsQuery.albums]);
  const mediaOwnerOptions = useMemo(() => buildMediaOwnerOptions(mediaQuery.media), [mediaQuery.media]);
  const mediaAlbumOptions = useMemo(() => buildMediaAlbumOptions(mediaQuery.media), [mediaQuery.media]);
  const mediaYearOptions = useMemo(() => buildMediaYearOptions(mediaQuery.media), [mediaQuery.media]);
  const mediaTypeOptions = useMemo(() => buildMediaTypeOptions(mediaQuery.media), [mediaQuery.media]);
  const allAlbumsSelected = albumsQuery.albums.length > 0
    && albumsQuery.albums.every((album) => selectedAlbumIds.includes(album.id));
  const allMediaSelected = mediaQuery.media.length > 0
    && mediaQuery.media.every((item) => selectedMediaIds.includes(item.id));

  useEffect(() => {
    setSelectedAlbumIds((prev) => prev.filter((id) => albumsQuery.albums.some((album) => album.id === id)));
  }, [albumsQuery.albums]);

  useEffect(() => {
    setSelectedMediaIds((prev) => prev.filter((id) => mediaQuery.media.some((item) => item.id === id)));
  }, [mediaQuery.media]);

  function closeDeleteDialog() {
    if (dialogSubmitting) return;
    setDeleteDialog({
      open: false,
      scope: '',
      targetId: null,
      targetIds: [],
      title: '',
      description: '',
      note: '',
      error: '',
    });
  }

  function confirmDeleteUser(user) {
    setDeleteDialog({
      open: true,
      scope: 'user',
      targetId: user.id,
      targetIds: [],
      title: '删除这个成员？',
      description: `你将删除用户“${user.username}”。`,
      note: '该用户发布的内容统计会从后台成员列表中移除。',
      error: '',
    });
  }

  function confirmDeleteAlbum(album) {
    setDeleteDialog({
      open: true,
      scope: 'album',
      targetId: album.id,
      targetIds: [],
      title: '删除这个相册？',
      description: `你将删除相册“${album.title}”。`,
      note: '相册记录会被移除，已上传的媒体文件会保留。',
      error: '',
    });
  }

  function confirmDeleteMedia(media) {
    setDeleteDialog({
      open: true,
      scope: 'media',
      targetId: media.id,
      targetIds: [],
      title: '删除这条媒体？',
      description: `你将删除 ${media.username} 上传的这条媒体。`,
      note: '删除后无法恢复，相关展示内容会立即从后台列表中移除。',
      error: '',
    });
  }

  function confirmDeleteAlbumsBatch() {
    if (selectedAlbumIds.length === 0) return;
    setDeleteDialog({
      open: true,
      scope: 'album_batch',
      targetId: null,
      targetIds: selectedAlbumIds,
      title: '批量删除这些相册？',
      description: `你将删除 ${selectedAlbumIds.length} 个已选相册。`,
      note: '相册记录会被移除，已上传的媒体文件会保留。',
      error: '',
    });
  }

  function confirmDeleteMediaBatch() {
    if (selectedMediaIds.length === 0) return;
    setDeleteDialog({
      open: true,
      scope: 'media_batch',
      targetId: null,
      targetIds: selectedMediaIds,
      title: '批量删除这些媒体？',
      description: `你将删除 ${selectedMediaIds.length} 条已选媒体。`,
      note: '删除后无法恢复，相关展示内容会立即从后台列表中移除。',
      error: '',
    });
  }

  function toggleAlbumSelection(albumId, checked) {
    setSelectedAlbumIds((prev) => (
      checked ? Array.from(new Set([...prev, albumId])) : prev.filter((id) => id !== albumId)
    ));
  }

  function toggleMediaSelection(mediaId, checked) {
    setSelectedMediaIds((prev) => (
      checked ? Array.from(new Set([...prev, mediaId])) : prev.filter((id) => id !== mediaId)
    ));
  }

  function toggleAllAlbums(checked) {
    setSelectedAlbumIds(checked ? albumsQuery.albums.map((album) => album.id) : []);
  }

  function toggleAllMedia(checked) {
    setSelectedMediaIds(checked ? mediaQuery.media.map((item) => item.id) : []);
  }

  async function submitDeleteDialog() {
    if (!deleteDialog.targetId && (!deleteDialog.targetIds || deleteDialog.targetIds.length === 0)) return;

    setDialogSubmitting(true);
    let result = { ok: false, error: '删除失败' };

    if (deleteDialog.scope === 'user') {
      result = await usersMutations.removeUser(deleteDialog.targetId);
    } else if (deleteDialog.scope === 'album') {
      result = await albumsMutations.removeAlbum(deleteDialog.targetId);
    } else if (deleteDialog.scope === 'media') {
      result = await mediaMutations.removeMedia(deleteDialog.targetId);
    } else if (deleteDialog.scope === 'album_batch') {
      result = await albumsMutations.removeAlbums(deleteDialog.targetIds);
    } else if (deleteDialog.scope === 'media_batch') {
      result = await mediaMutations.removeMediaBatch(deleteDialog.targetIds);
    }

    setDialogSubmitting(false);

    if (result.ok) {
      if (deleteDialog.scope === 'album_batch') {
        setSelectedAlbumIds([]);
      }
      if (deleteDialog.scope === 'media_batch') {
        setSelectedMediaIds([]);
      }
      closeDeleteDialog();
      return;
    }

    setDeleteDialog((prev) => ({ ...prev, error: result.error || '删除失败' }));
  }

  const activeState = activeTab === 'users'
    ? { loading: usersQuery.loading, error: usersQuery.error || usersMutations.error, message: usersMutations.message }
    : activeTab === 'albums'
      ? { loading: albumsQuery.loading, error: albumsQuery.error || albumsMutations.error, message: albumsMutations.message }
      : { loading: mediaQuery.loading, error: mediaQuery.error || mediaMutations.error, message: mediaMutations.message };

  return (
    <div className="page admin-page">
      <header className="topbar memory-topbar">
        <Link to="/" className="text-btn">返回首页</Link>
        <div className="album-title-block">
          <p className="eyebrow">Admin Console</p>
          <h1>管理员面板</h1>
        </div>
        <span className="user-tag">{currentUser?.username}</span>
      </header>

      <main className="admin-shell">
        <aside className="admin-sidebar">
          <h2>后台管理</h2>
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
            <>
              <FilterToolbar
                title="成员搜索与筛选"
                resultCount={usersQuery.users.length}
                onReset={userFilters.resetFilters}
                showReset={userFilters.hasActiveFilters}
              >
                <SearchBar
                  value={userFilters.filters.q}
                  onSearch={(value) => userFilters.setFilter('q', value)}
                  placeholder="搜索用户名或昵称..."
                />
                <FilterSelect
                  value={userFilters.filters.role}
                  onChange={(value) => userFilters.setFilter('role', value)}
                  options={userRoleOptions}
                  ariaLabel="按角色筛选成员"
                />
              </FilterToolbar>

              <AdminUserTable
                users={usersQuery.users}
                currentUserId={currentUser?.id}
                onSaveUser={usersMutations.saveUser}
                onDeleteUser={confirmDeleteUser}
              />
            </>
          )}

          {activeTab === 'albums' && (
            <>
              <FilterToolbar
                title="相册搜索与筛选"
                resultCount={albumsQuery.albums.length}
                onReset={albumFilters.resetFilters}
                showReset={albumFilters.hasActiveFilters}
              >
                <SearchBar
                  value={albumFilters.filters.q}
                  onSearch={(value) => albumFilters.setFilter('q', value)}
                  placeholder="搜索相册名称或创建者..."
                />
                <FilterSelect
                  value={albumFilters.filters.year}
                  onChange={(value) => albumFilters.setFilter('year', value)}
                  options={albumYearOptions}
                  ariaLabel="按年份筛选相册"
                />
                <FilterSelect
                  value={albumFilters.filters.owner}
                  onChange={(value) => albumFilters.setFilter('owner', value)}
                  options={albumOwnerOptions}
                  ariaLabel="按创建者筛选相册"
                />
              </FilterToolbar>

              <AdminBatchToolbar
                label="相册"
                selectedCount={selectedAlbumIds.length}
                totalCount={albumsQuery.albums.length}
                allSelected={allAlbumsSelected}
                disabled={dialogSubmitting}
                onToggleAll={toggleAllAlbums}
                onClear={() => setSelectedAlbumIds([])}
                onDelete={confirmDeleteAlbumsBatch}
              />

              <AdminAlbumTable
                albums={albumsQuery.albums}
                selectedIds={selectedAlbumIds}
                onToggleAlbum={toggleAlbumSelection}
                onToggleAllAlbums={toggleAllAlbums}
                onDeleteAlbum={confirmDeleteAlbum}
                onUploadCover={albumsMutations.uploadCover}
              />
            </>
          )}

          {activeTab === 'media' && (
            <>
              <FilterToolbar
                title="媒体搜索与筛选"
                resultCount={mediaQuery.media.length}
                onReset={mediaFilters.resetFilters}
                showReset={mediaFilters.hasActiveFilters}
              >
                <SearchBar
                  value={mediaFilters.filters.q}
                  onSearch={(value) => mediaFilters.setFilter('q', value)}
                  placeholder="搜索描述、相册或上传者..."
                />
                <FilterSelect
                  value={mediaFilters.filters.type}
                  onChange={(value) => mediaFilters.setFilter('type', value)}
                  options={mediaTypeOptions}
                  ariaLabel="按类型筛选媒体"
                />
                <FilterSelect
                  value={mediaFilters.filters.year}
                  onChange={(value) => mediaFilters.setFilter('year', value)}
                  options={mediaYearOptions}
                  ariaLabel="按年份筛选媒体"
                />
                <FilterSelect
                  value={mediaFilters.filters.owner}
                  onChange={(value) => mediaFilters.setFilter('owner', value)}
                  options={mediaOwnerOptions}
                  ariaLabel="按上传者筛选媒体"
                />
                <FilterSelect
                  value={mediaFilters.filters.album}
                  onChange={(value) => mediaFilters.setFilter('album', value)}
                  options={mediaAlbumOptions}
                  ariaLabel="按相册筛选媒体"
                />
              </FilterToolbar>

              <AdminBatchToolbar
                label="媒体"
                selectedCount={selectedMediaIds.length}
                totalCount={mediaQuery.media.length}
                allSelected={allMediaSelected}
                disabled={dialogSubmitting}
                onToggleAll={toggleAllMedia}
                onClear={() => setSelectedMediaIds([])}
                onDelete={confirmDeleteMediaBatch}
              />

              <AdminMediaGrid
                media={mediaQuery.media}
                selectedIds={selectedMediaIds}
                onToggleMedia={toggleMediaSelection}
                onDeleteMedia={confirmDeleteMedia}
              />
            </>
          )}
        </section>
      </main>

      <ConfirmDialog
        open={deleteDialog.open}
        eyebrow="Admin Action"
        title={deleteDialog.title}
        description={deleteDialog.description}
        note={deleteDialog.note}
        error={deleteDialog.error}
        confirmLabel="确认删除"
        danger
        confirming={dialogSubmitting}
        onConfirm={submitDeleteDialog}
        onClose={closeDeleteDialog}
      />
    </div>
  );
}

export default AdminDashboard;
