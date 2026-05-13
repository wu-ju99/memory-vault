import { useNavigate, Link } from 'react-router-dom';
import { clearAuth, getUser } from '../utils/auth';
import CreateAlbumForm from '../components/CreateAlbumForm';
import AlbumYearNav from '../components/AlbumYearNav';
import AlbumYearSection from '../components/AlbumYearSection';
import AlbumUserNav from '../components/AlbumUserNav';
import useAlbums from '../hooks/useAlbums';
import useAlbumYears from '../hooks/useAlbumYears';
import useYearUserNav from '../hooks/useYearUserNav';

function Home() {
  const navigate = useNavigate();
  const user = getUser();
  const {
    albums,
    loading,
    coverUploadingId,
    managingAlbumId,
    message: albumMessage,
    error: albumError,
    createAlbum,
    uploadCover,
    renameAlbum,
    removeAlbum,
  } = useAlbums();
  const albumYears = useAlbumYears(albums);
  const yearUsers = useYearUserNav(albumYears.yearGroups, albumYears.activeYear, albumYears.allYearsValue);

  async function handleCoverUpload(album, file) {
    await uploadCover(album, file);
  }

  async function handleRenameAlbum(album) {
    const title = window.prompt('请输入新的相册名称', album.title);
    if (title === null) return;

    await renameAlbum(album, title);
  }

  async function handleDeleteAlbum(album) {
    if (!window.confirm(`确定删除相册「${album.title}」吗？相册内的照片和视频不会被删除。`)) return;

    await removeAlbum(album);
  }

  function handleLogout() {
    clearAuth();
    navigate('/login');
  }

  function handleSelectYearUser(user) {
    const targetYear = albumYears.activeYear === albumYears.allYearsValue ? user.year : albumYears.activeYear;
    const targetId = `${albumYears.getYearSectionId(targetYear)}-${user.userKey}`;
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
          {user?.role === 'admin' && <Link to="/admin" className="text-btn">管理面板</Link>}
          {user && <Link to="/profile" className="user-tag">{user.username}</Link>}
          <button onClick={handleLogout} className="text-btn logout-btn">退出</button>
        </div>
      </header>

      <main className="content memory-content">
        <section id="album-year-root" className="album-book-shell" aria-label="相册列表">
          <div className="book-spread">
            <div className="book-page book-page-left">
              <div className="book-page-header">
                <span>Shared Albums</span>
                <strong>{albums.length}</strong>
              </div>
              <CreateAlbumForm onCreate={createAlbum} />
              {loading && <p className="status-text">正在整理相册...</p>}
              {albumMessage && <p className="status-text success">{albumMessage}</p>}
              {albumError && <p className="status-text error">{albumError}</p>}
              {!loading && albums.length === 0 && (
                <p className="status-text">还没有相册，先创建一本吧。</p>
              )}
              <AlbumYearNav
                years={albumYears.years}
                totalCount={albums.length}
                activeYear={albumYears.activeYear}
                allYearsValue={albumYears.allYearsValue}
                onSelectYear={albumYears.scrollToYear}
              />
              <AlbumUserNav
                users={yearUsers}
                onSelectUser={handleSelectYearUser}
              />
            </div>

            <div className="book-page book-page-right">
              {albums.length > 0 && (
                <div className="album-year-sections">
                  {albumYears.yearGroups.map(({ year, items }) => (
                    <AlbumYearSection
                      key={year}
                      year={year}
                      albums={items}
                      sectionId={albumYears.getYearSectionId(year)}
                      currentUser={user}
                      coverUploadingId={coverUploadingId}
                      managingAlbumId={managingAlbumId}
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
