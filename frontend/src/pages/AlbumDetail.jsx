import { Link, useParams } from 'react-router-dom';
import { getUser } from '../utils/auth';
import MediaCard from '../components/MediaCard';
import CommentList from '../components/CommentList';
import MediaUploader from '../components/MediaUploader';
import MediaModal from '../components/MediaModal';
import MediaYearSection from '../components/MediaYearSection';
import SearchBar from '../components/SearchBar';
import FilterSelect from '../components/FilterSelect';
import FilterToolbar from '../components/FilterToolbar';
import useAlbumMediaQuery from '../hooks/useAlbumMediaQuery';
import useAlbumMediaMutations from '../hooks/useAlbumMediaMutations';
import useMediaEditor from '../hooks/useMediaEditor';
import useMediaModal from '../hooks/useMediaModal';
import useUrlFilterState from '../hooks/useUrlFilterState';
import { getMediaYearValue, UNKNOWN_YEAR } from '../utils/yearGroups';
import { getUserDisplayName } from '../utils/userDisplay';

function formatDate(iso) {
  return iso ? iso.slice(0, 10) : '';
}

function buildMediaTypeOptions(mediaList) {
  const hasImage = mediaList.some((item) => item.type === 'image');
  const hasVideo = mediaList.some((item) => item.type === 'video');
  const options = [{ value: '', label: 'All types' }];

  if (hasImage) options.push({ value: 'image', label: 'Images' });
  if (hasVideo) options.push({ value: 'video', label: 'Videos' });
  return options;
}

function buildMediaYearOptions(mediaList) {
  const years = Array.from(new Set(mediaList.map(getMediaYearValue)));
  return [
    { value: '', label: 'All years' },
    ...years.map((year) => ({
      value: year,
      label: year === UNKNOWN_YEAR ? 'Unknown year' : year,
    })),
  ];
}

function buildOwnerOptions(mediaList) {
  const groups = new Map();
  mediaList.forEach((item) => {
    if (!groups.has(item.user_id)) {
      groups.set(item.user_id, {
        value: String(item.user_id),
        label: getUserDisplayName(item),
      });
    }
  });

  return [
    { value: '', label: 'All uploaders' },
    ...Array.from(groups.values()).sort((a, b) => a.label.localeCompare(b.label, 'zh-Hans-CN')),
  ];
}

function AlbumDetail() {
  const { id } = useParams();
  const currentUser = getUser();
  const filterState = useUrlFilterState(
    { q: '', type: '', year: '', owner: '' },
    { prefix: `album_${id}_` }
  );
  const mediaQuery = useAlbumMediaQuery(id, filterState.filters);
  const mediaMutations = useAlbumMediaMutations(id, {
    onAlbumChanged: mediaQuery.reloadAlbum,
    onMediaChanged: mediaQuery.reloadMedia,
  });
  const mediaEditor = useMediaEditor(mediaMutations.saveDescription);
  const mediaModal = useMediaModal(mediaQuery.mediaList);
  const typeOptions = buildMediaTypeOptions(mediaQuery.mediaList);
  const yearOptions = buildMediaYearOptions(mediaQuery.mediaList);
  const ownerOptions = buildOwnerOptions(mediaQuery.mediaList);

  async function handleDelete(item) {
    if (!window.confirm('Delete this memory?')) return;
    try {
      await mediaMutations.removeMedia(item);
      mediaModal.clearIfActive(item.id);
    } catch {}
  }

  async function handleSetCover(item) {
    try {
      await mediaMutations.makeAlbumCover(item);
    } catch {}
  }

  function renderMediaCard(item, index) {
    const canDelete = item.user_id === currentUser?.id || currentUser?.role === 'admin';
    return (
      <MediaCard
        key={item.id}
        item={item}
        index={index}
        editingId={mediaEditor.editingId}
        editText={mediaEditor.editText}
        saving={mediaEditor.saving}
        onStartEdit={mediaEditor.startEdit}
        onEditTextChange={mediaEditor.setEditText}
        onSaveEdit={mediaEditor.saveEdit}
        onCancelEdit={mediaEditor.cancelEdit}
        onDelete={canDelete ? handleDelete : null}
        onOpen={mediaModal.openMedia}
      >
        <CommentList mediaId={item.id} currentUserId={currentUser?.id} currentUserRole={currentUser?.role} />
      </MediaCard>
    );
  }

  if (mediaQuery.loading && !mediaQuery.album) {
    return (
      <div className="page scrapbook-page">
        <main className="content memory-content">
          <p className="status-text">Loading album...</p>
        </main>
      </div>
    );
  }

  if (!mediaQuery.album) {
    return (
      <div className="page scrapbook-page">
        <main className="content memory-content">
          <p className="status-text">Album not found.</p>
          <Link to="/" className="text-btn">Back home</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="page scrapbook-page">
      <header className="topbar memory-topbar">
        <Link to="/" className="text-btn">Back</Link>
        <div className="album-title-block">
          <p className="eyebrow">Album</p>
          <h1>{mediaQuery.album.title}</h1>
        </div>
        <span className="album-date">{formatDate(mediaQuery.album.created_at)}</span>
      </header>

      <main className="content memory-content album-detail-content">
        <aside className="year-bookmarks" aria-label="Year bookmarks">
          {mediaQuery.yearGroups.map(({ year }) => (
            <a key={year} href={`#year-${year}`} className="year-bookmark">{year}</a>
          ))}
        </aside>

        <section className="album-book-shell detail-book-shell">
          <div className="book-spread detail-spread">
            <div className="book-page book-page-left upload-page">
              <div className="book-page-header">
                <span>New Memory</span>
                <strong>+</strong>
              </div>

              <MediaUploader
                uploading={mediaMutations.uploading}
                uploadMessage={mediaMutations.uploadMessage}
                uploadError={mediaMutations.uploadError}
                onUpload={mediaMutations.uploadFiles}
              />

              <FilterToolbar
                title="Media search and filters"
                resultCount={mediaQuery.mediaList.length}
                onReset={filterState.resetFilters}
                showReset={filterState.hasActiveFilters}
              >
                <SearchBar
                  value={filterState.filters.q}
                  onSearch={(value) => filterState.setFilter('q', value)}
                  placeholder="Search media description..."
                />
                <FilterSelect
                  value={filterState.filters.type}
                  onChange={(value) => filterState.setFilter('type', value)}
                  options={typeOptions}
                  ariaLabel="Filter media by type"
                />
                <FilterSelect
                  value={filterState.filters.year}
                  onChange={(value) => filterState.setFilter('year', value)}
                  options={yearOptions}
                  ariaLabel="Filter media by year"
                />
                <FilterSelect
                  value={filterState.filters.owner}
                  onChange={(value) => filterState.setFilter('owner', value)}
                  options={ownerOptions}
                  ariaLabel="Filter media by uploader"
                />
              </FilterToolbar>
            </div>

            <div className="book-page book-page-right memories-page">
              {mediaQuery.error && <p className="status-text error">{mediaQuery.error}</p>}

              {mediaQuery.mediaList.length === 0 && (
                <p className="status-text empty-memory">
                  {filterState.hasActiveFilters ? 'No media match the current filters.' : 'No media yet.'}
                </p>
              )}

              {mediaQuery.yearGroups.map(({ year, items }) => (
                <MediaYearSection
                  key={year}
                  year={year}
                  items={items}
                  renderMediaCard={renderMediaCard}
                />
              ))}
            </div>
          </div>
        </section>

        <MediaModal
          media={mediaModal.activeMedia}
          currentUser={currentUser}
          editingId={mediaEditor.editingId}
          editText={mediaEditor.editText}
          saving={mediaEditor.saving}
          onStartEdit={mediaEditor.startEdit}
          onEditTextChange={mediaEditor.setEditText}
          onSaveEdit={mediaEditor.saveEdit}
          onCancelEdit={mediaEditor.cancelEdit}
          onDelete={handleDelete}
          onSetCover={handleSetCover}
          onClose={mediaModal.closeMedia}
          onPrevious={mediaModal.previousMedia}
          onNext={mediaModal.nextMedia}
        />
      </main>
    </div>
  );
}

export default AlbumDetail;
