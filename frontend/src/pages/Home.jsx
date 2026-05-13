import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clearAuth, getUser } from '../utils/auth';
import CreateAlbumForm from '../components/CreateAlbumForm';
import AlbumYearNav from '../components/AlbumYearNav';
import AlbumYearSection from '../components/AlbumYearSection';
import AlbumUserNav from '../components/AlbumUserNav';
import SearchBar from '../components/SearchBar';
import FilterSelect from '../components/FilterSelect';
import FilterToolbar from '../components/FilterToolbar';
import ConfirmDialog from '../components/dialogs/ConfirmDialog';
import InputDialog from '../components/dialogs/InputDialog';
import useAlbumYears from '../hooks/useAlbumYears';
import useYearUserNav from '../hooks/useYearUserNav';
import useAlbumListQuery from '../hooks/useAlbumListQuery';
import useAlbumMutations from '../hooks/useAlbumMutations';
import useUrlFilterState from '../hooks/useUrlFilterState';
import { getAlbumYearValue, UNKNOWN_YEAR } from '../utils/yearGroups';
import { getUserDisplayName } from '../utils/userDisplay';
import { UNKNOWN_YEAR_LABEL } from '../utils/uiLabels';

function buildOwnerOptions(albums) {
  const groups = new Map();

  albums.forEach((album) => {
    if (!groups.has(album.user_id)) {
      groups.set(album.user_id, {
        value: String(album.user_id),
        label: getUserDisplayName(album),
      });
    }
  });

  return [
    { value: '', label: '全部创建者' },
    ...Array.from(groups.values()).sort((a, b) => a.label.localeCompare(b.label, 'zh-Hans-CN')),
  ];
}

function buildYearOptions(albums) {
  const years = Array.from(new Set(albums.map(getAlbumYearValue)));

  return [
    { value: '', label: '全部年份' },
    ...years.map((year) => ({
      value: year,
      label: year === UNKNOWN_YEAR ? UNKNOWN_YEAR_LABEL : year,
    })),
  ];
}

function Home() {
  const navigate = useNavigate();
  const user = getUser();
  const [renameDialog, setRenameDialog] = useState({ open: false, album: null, error: '' });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, album: null, error: '' });
  const [dialogSubmitting, setDialogSubmitting] = useState(false);
  const filterState = useUrlFilterState(
    { q: '', year: '', owner: '' },
    { prefix: 'albums_' }
  );
  const albumQuery = useAlbumListQuery(filterState.filters);
  const albumMutations = useAlbumMutations(albumQuery.reload);
  const albumYears = useAlbumYears(albumQuery.albums);
  const yearUsers = useYearUserNav(
    albumYears.yearGroups,
    albumYears.activeYear,
    albumYears.allYearsValue
  );
  const ownerOptions = buildOwnerOptions(albumQuery.albums);
  const yearOptions = buildYearOptions(albumQuery.albums);

  async function handleCoverUpload(album, file) {
    await albumMutations.uploadCover(album, file);
  }

  function closeRenameDialog() {
    if (dialogSubmitting) return;
    setRenameDialog({ open: false, album: null, error: '' });
  }

  function closeDeleteDialog() {
    if (dialogSubmitting) return;
    setDeleteDialog({ open: false, album: null, error: '' });
  }

  function handleRenameAlbum(album) {
    setRenameDialog({ open: true, album, error: '' });
  }

  async function submitRenameAlbum(title) {
    if (!renameDialog.album) return;

    setDialogSubmitting(true);
    const result = await albumMutations.renameAlbum(renameDialog.album, title);
    setDialogSubmitting(false);

    if (result.ok) {
      closeRenameDialog();
      return;
    }

    setRenameDialog((prev) => ({ ...prev, error: result.error || '修改相册名称失败' }));
  }

  function handleDeleteAlbum(album) {
    setDeleteDialog({ open: true, album, error: '' });
  }

  async function confirmDeleteAlbum() {
    if (!deleteDialog.album) return;

    setDialogSubmitting(true);
    const result = await albumMutations.removeAlbum(deleteDialog.album);
    setDialogSubmitting(false);

    if (result.ok) {
      closeDeleteDialog();
      return;
    }

    setDeleteDialog((prev) => ({ ...prev, error: result.error || '删除相册失败' }));
  }

  function handleLogout() {
    clearAuth();
    navigate('/login');
  }

  function handleSelectYearUser(selectedUser) {
    const targetYear = albumYears.activeYear === albumYears.allYearsValue
      ? selectedUser.year
      : albumYears.activeYear;
    const targetId = `${albumYears.getYearSectionId(targetYear)}-${selectedUser.userKey}`;
    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="page scrapbook-page">
      <header className="topbar memory-topbar">
        <div>
          <p className="eyebrow">Private Memory Book</p>
          <h1>Memory Vault</h1>
        </div>
        <div className="topbar-right">
          {user?.role === 'admin' && <Link to="/admin" className="text-btn">管理员面板</Link>}
          {user && <Link to="/profile" className="user-tag">{user.username}</Link>}
          <button onClick={handleLogout} className="text-btn logout-btn" type="button">退出登录</button>
        </div>
      </header>

      <main className="content memory-content">
        <section id="album-year-root" className="album-book-shell" aria-label="相册列表">
          <div className="book-spread">
            <div className="book-page book-page-left">
              <div className="book-page-header">
                <span>共享相册</span>
                <strong>{albumQuery.albums.length}</strong>
              </div>

              <CreateAlbumForm onCreate={albumMutations.createAlbum} />

              <FilterToolbar
                title="相册搜索与筛选"
                resultCount={albumQuery.albums.length}
                onReset={filterState.resetFilters}
                showReset={filterState.hasActiveFilters}
              >
                <SearchBar
                  value={filterState.filters.q}
                  onSearch={(value) => filterState.setFilter('q', value)}
                  placeholder="搜索相册名称或创建者..."
                />
                <FilterSelect
                  value={filterState.filters.year}
                  onChange={(value) => filterState.setFilter('year', value)}
                  options={yearOptions}
                  ariaLabel="按年份筛选相册"
                />
                <FilterSelect
                  value={filterState.filters.owner}
                  onChange={(value) => filterState.setFilter('owner', value)}
                  options={ownerOptions}
                  ariaLabel="按创建者筛选相册"
                />
              </FilterToolbar>

              {albumQuery.loading && <p className="status-text">相册加载中...</p>}
              {albumMutations.message && <p className="status-text success">{albumMutations.message}</p>}
              {(albumMutations.error || albumQuery.error) && (
                <p className="status-text error">{albumMutations.error || albumQuery.error}</p>
              )}
              {!albumQuery.loading && albumQuery.albums.length === 0 && (
                <p className="status-text">
                  {filterState.hasActiveFilters ? '没有符合当前筛选条件的相册。' : '还没有相册。'}
                </p>
              )}

              <AlbumYearNav
                years={albumYears.years}
                totalCount={albumQuery.albums.length}
                activeYear={albumYears.activeYear}
                allYearsValue={albumYears.allYearsValue}
                onSelectYear={albumYears.scrollToYear}
              />
              <AlbumUserNav users={yearUsers} onSelectUser={handleSelectYearUser} />
            </div>

            <div className="book-page book-page-right">
              {albumQuery.albums.length > 0 && (
                <div className="album-year-sections">
                  {albumYears.yearGroups.map(({ year, items }) => (
                    <AlbumYearSection
                      key={year}
                      year={year}
                      albums={items}
                      sectionId={albumYears.getYearSectionId(year)}
                      currentUser={user}
                      coverUploadingId={albumMutations.coverUploadingId}
                      managingAlbumId={albumMutations.managingAlbumId}
                      onCoverUpload={handleCoverUpload}
                      onRename={handleRenameAlbum}
                      onDelete={handleDeleteAlbum}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <InputDialog
        open={renameDialog.open}
        eyebrow="Album Rename"
        title="修改相册名称"
        description={renameDialog.album ? `为“${renameDialog.album.title}”设置一个更清晰的新名称。` : ''}
        value={renameDialog.album?.title || ''}
        placeholder="输入新的相册名称"
        error={renameDialog.error}
        confirmLabel="保存名称"
        submitting={dialogSubmitting}
        onSubmit={submitRenameAlbum}
        onClose={closeRenameDialog}
      />

      <ConfirmDialog
        open={deleteDialog.open}
        eyebrow="Remove Album"
        title="删除这个相册？"
        description={deleteDialog.album ? `你将删除相册“${deleteDialog.album.title}”。` : ''}
        note="相册会被移除，已上传的媒体文件会保留在系统中。"
        error={deleteDialog.error}
        confirmLabel="确认删除"
        danger
        confirming={dialogSubmitting}
        onConfirm={confirmDeleteAlbum}
        onClose={closeDeleteDialog}
      />
    </div>
  );
}

export default Home;
