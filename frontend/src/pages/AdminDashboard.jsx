import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { getUser } from '../utils/auth';
import SearchBar from '../components/SearchBar';
import FilterSelect from '../components/FilterSelect';
import FilterToolbar from '../components/FilterToolbar';
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
import { getAlbumYearValue, getMediaYearValue, UNKNOWN_YEAR } from '../utils/yearGroups';
import { getUserDisplayName } from '../utils/userDisplay';

const TABS = [
  { id: 'users', label: 'Users' },
  { id: 'albums', label: 'Albums' },
  { id: 'media', label: 'Media' },
];

function buildUserRoleOptions(users) {
  const roles = Array.from(new Set(users.map((user) => user.role)));
  return [
    { value: '', label: 'All roles' },
    ...roles.map((role) => ({ value: role, label: role })),
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
    { value: '', label: 'All owners' },
    ...Array.from(owners.values()).sort((a, b) => a.label.localeCompare(b.label, 'zh-Hans-CN')),
  ];
}

function buildAlbumYearOptions(albums) {
  const years = Array.from(new Set(albums.map(getAlbumYearValue)));
  return [
    { value: '', label: 'All years' },
    ...years.map((year) => ({
      value: year,
      label: year === UNKNOWN_YEAR ? 'Unknown year' : year,
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
    { value: '', label: 'All uploaders' },
    ...Array.from(owners.values()).sort((a, b) => a.label.localeCompare(b.label, 'zh-Hans-CN')),
  ];
}

function buildMediaAlbumOptions(media) {
  const albums = new Map();
  media.forEach((item) => {
    if (item.album_id && !albums.has(item.album_id)) {
      albums.set(item.album_id, {
        value: String(item.album_id),
        label: item.album_title || `Album ${item.album_id}`,
      });
    }
  });
  return [
    { value: '', label: 'All albums' },
    ...Array.from(albums.values()).sort((a, b) => a.label.localeCompare(b.label, 'zh-Hans-CN')),
  ];
}

function buildMediaYearOptions(media) {
  const years = Array.from(new Set(media.map(getMediaYearValue)));
  return [
    { value: '', label: 'All years' },
    ...years.map((year) => ({
      value: year,
      label: year === UNKNOWN_YEAR ? 'Unknown year' : year,
    })),
  ];
}

function buildMediaTypeOptions(media) {
  const types = Array.from(new Set(media.map((item) => item.type)));
  return [
    { value: '', label: 'All types' },
    ...types.map((type) => ({
      value: type,
      label: type === 'image' ? 'Images' : type === 'video' ? 'Videos' : type,
    })),
  ];
}

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users');
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

  async function confirmDeleteUser(user) {
    if (!window.confirm(`Delete user "${user.username}"?`)) return;
    await usersMutations.removeUser(user.id);
  }

  async function confirmDeleteAlbum(album) {
    if (!window.confirm(`Delete album "${album.title}"? Media files will stay in place.`)) return;
    await albumsMutations.removeAlbum(album.id);
  }

  async function confirmDeleteMedia(media) {
    if (!window.confirm(`Delete media uploaded by ${media.username}?`)) return;
    await mediaMutations.removeMedia(media.id);
  }

  const activeState = activeTab === 'users'
    ? { loading: usersQuery.loading, error: usersQuery.error || usersMutations.error, message: usersMutations.message }
    : activeTab === 'albums'
      ? { loading: albumsQuery.loading, error: albumsQuery.error || albumsMutations.error, message: albumsMutations.message }
      : { loading: mediaQuery.loading, error: mediaQuery.error || mediaMutations.error, message: mediaMutations.message };

  return (
    <div className="page admin-page">
      <header className="topbar memory-topbar">
        <Link to="/" className="text-btn">Back home</Link>
        <div className="album-title-block">
          <p className="eyebrow">Admin</p>
          <h1>Admin Panel</h1>
        </div>
        <span className="user-tag">{currentUser?.username}</span>
      </header>

      <main className="admin-shell">
        <aside className="admin-sidebar">
          <h2>Manage</h2>
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
            {activeState.loading && <span>Loading...</span>}
          </div>

          {activeState.message && <p className="status-text success">{activeState.message}</p>}
          {activeState.error && <p className="status-text error">{activeState.error}</p>}

          {activeTab === 'users' && (
            <>
              <FilterToolbar
                title="User search and filters"
                resultCount={usersQuery.users.length}
                onReset={userFilters.resetFilters}
                showReset={userFilters.hasActiveFilters}
              >
                <SearchBar
                  value={userFilters.filters.q}
                  onSearch={(value) => userFilters.setFilter('q', value)}
                  placeholder="Search username or nickname..."
                />
                <FilterSelect
                  value={userFilters.filters.role}
                  onChange={(value) => userFilters.setFilter('role', value)}
                  options={userRoleOptions}
                  ariaLabel="Filter users by role"
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
                title="Album search and filters"
                resultCount={albumsQuery.albums.length}
                onReset={albumFilters.resetFilters}
                showReset={albumFilters.hasActiveFilters}
              >
                <SearchBar
                  value={albumFilters.filters.q}
                  onSearch={(value) => albumFilters.setFilter('q', value)}
                  placeholder="Search album title or owner..."
                />
                <FilterSelect
                  value={albumFilters.filters.year}
                  onChange={(value) => albumFilters.setFilter('year', value)}
                  options={albumYearOptions}
                  ariaLabel="Filter albums by year"
                />
                <FilterSelect
                  value={albumFilters.filters.owner}
                  onChange={(value) => albumFilters.setFilter('owner', value)}
                  options={albumOwnerOptions}
                  ariaLabel="Filter albums by owner"
                />
              </FilterToolbar>

              <AdminAlbumTable
                albums={albumsQuery.albums}
                onDeleteAlbum={confirmDeleteAlbum}
                onUploadCover={albumsMutations.uploadCover}
              />
            </>
          )}

          {activeTab === 'media' && (
            <>
              <FilterToolbar
                title="Media search and filters"
                resultCount={mediaQuery.media.length}
                onReset={mediaFilters.resetFilters}
                showReset={mediaFilters.hasActiveFilters}
              >
                <SearchBar
                  value={mediaFilters.filters.q}
                  onSearch={(value) => mediaFilters.setFilter('q', value)}
                  placeholder="Search description, album or uploader..."
                />
                <FilterSelect
                  value={mediaFilters.filters.type}
                  onChange={(value) => mediaFilters.setFilter('type', value)}
                  options={mediaTypeOptions}
                  ariaLabel="Filter media by type"
                />
                <FilterSelect
                  value={mediaFilters.filters.year}
                  onChange={(value) => mediaFilters.setFilter('year', value)}
                  options={mediaYearOptions}
                  ariaLabel="Filter media by year"
                />
                <FilterSelect
                  value={mediaFilters.filters.owner}
                  onChange={(value) => mediaFilters.setFilter('owner', value)}
                  options={mediaOwnerOptions}
                  ariaLabel="Filter media by uploader"
                />
                <FilterSelect
                  value={mediaFilters.filters.album}
                  onChange={(value) => mediaFilters.setFilter('album', value)}
                  options={mediaAlbumOptions}
                  ariaLabel="Filter media by album"
                />
              </FilterToolbar>

              <AdminMediaGrid media={mediaQuery.media} onDeleteMedia={confirmDeleteMedia} />
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
