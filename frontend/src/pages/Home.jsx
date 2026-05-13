import { Link, useNavigate } from 'react-router-dom';
import { clearAuth, getUser } from '../utils/auth';
import CreateAlbumForm from '../components/CreateAlbumForm';
import AlbumYearNav from '../components/AlbumYearNav';
import AlbumYearSection from '../components/AlbumYearSection';
import AlbumUserNav from '../components/AlbumUserNav';
import SearchBar from '../components/SearchBar';
import FilterSelect from '../components/FilterSelect';
import FilterToolbar from '../components/FilterToolbar';
import useAlbumYears from '../hooks/useAlbumYears';
import useYearUserNav from '../hooks/useYearUserNav';
import useAlbumListQuery from '../hooks/useAlbumListQuery';
import useAlbumMutations from '../hooks/useAlbumMutations';
import useUrlFilterState from '../hooks/useUrlFilterState';
import { getAlbumYearValue, UNKNOWN_YEAR } from '../utils/yearGroups';
import { getUserDisplayName } from '../utils/userDisplay';

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
    { value: '', label: 'All owners' },
    ...Array.from(groups.values()).sort((a, b) => a.label.localeCompare(b.label, 'zh-Hans-CN')),
  ];
}

function buildYearOptions(albums) {
  const years = Array.from(new Set(albums.map(getAlbumYearValue)));

  return [
    { value: '', label: 'All years' },
    ...years.map((year) => ({
      value: year,
      label: year === UNKNOWN_YEAR ? 'Unknown year' : year,
    })),
  ];
}

function Home() {
  const navigate = useNavigate();
  const user = getUser();
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

  async function handleRenameAlbum(album) {
    const title = window.prompt('Enter a new album title', album.title);
    if (title === null) return;
    await albumMutations.renameAlbum(album, title);
  }

  async function handleDeleteAlbum(album) {
    if (!window.confirm(`Delete album "${album.title}"? Media files will stay in place.`)) return;
    await albumMutations.removeAlbum(album);
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
          {user?.role === 'admin' && <Link to="/admin" className="text-btn">Admin</Link>}
          {user && <Link to="/profile" className="user-tag">{user.username}</Link>}
          <button onClick={handleLogout} className="text-btn logout-btn" type="button">Logout</button>
        </div>
      </header>

      <main className="content memory-content">
        <section id="album-year-root" className="album-book-shell" aria-label="Album list">
          <div className="book-spread">
            <div className="book-page book-page-left">
              <div className="book-page-header">
                <span>Shared Albums</span>
                <strong>{albumQuery.albums.length}</strong>
              </div>

              <CreateAlbumForm onCreate={albumMutations.createAlbum} />

              <FilterToolbar
                title="Album search and filters"
                resultCount={albumQuery.albums.length}
                onReset={filterState.resetFilters}
                showReset={filterState.hasActiveFilters}
              >
                <SearchBar
                  value={filterState.filters.q}
                  onSearch={(value) => filterState.setFilter('q', value)}
                  placeholder="Search album title or owner..."
                />
                <FilterSelect
                  value={filterState.filters.year}
                  onChange={(value) => filterState.setFilter('year', value)}
                  options={yearOptions}
                  ariaLabel="Filter albums by year"
                />
                <FilterSelect
                  value={filterState.filters.owner}
                  onChange={(value) => filterState.setFilter('owner', value)}
                  options={ownerOptions}
                  ariaLabel="Filter albums by owner"
                />
              </FilterToolbar>

              {albumQuery.loading && <p className="status-text">Loading albums...</p>}
              {albumMutations.message && <p className="status-text success">{albumMutations.message}</p>}
              {(albumMutations.error || albumQuery.error) && (
                <p className="status-text error">{albumMutations.error || albumQuery.error}</p>
              )}
              {!albumQuery.loading && albumQuery.albums.length === 0 && (
                <p className="status-text">
                  {filterState.hasActiveFilters ? 'No albums match the current filters.' : 'No albums yet.'}
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
    </div>
  );
}

export default Home;
