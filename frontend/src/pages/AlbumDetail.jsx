import { useState } from 'react';
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
import ConfirmDialog from '../components/dialogs/ConfirmDialog';
import useAlbumMediaQuery from '../hooks/useAlbumMediaQuery';
import useAlbumMediaMutations from '../hooks/useAlbumMediaMutations';
import useMediaDownload from '../hooks/useMediaDownload';
import useMediaEditor from '../hooks/useMediaEditor';
import useMediaModal from '../hooks/useMediaModal';
import useUrlFilterState from '../hooks/useUrlFilterState';
import { getMediaYearValue, UNKNOWN_YEAR } from '../utils/yearGroups';
import { getUserDisplayName } from '../utils/userDisplay';
import { getMediaTypeLabel, UNKNOWN_YEAR_LABEL } from '../utils/uiLabels';

function formatDate(iso) {
  return iso ? iso.slice(0, 10) : '';
}

function buildMediaTypeOptions(mediaList) {
  const hasImage = mediaList.some((item) => item.type === 'image');
  const hasVideo = mediaList.some((item) => item.type === 'video');
  const options = [{ value: '', label: '全部类型' }];

  if (hasImage) options.push({ value: 'image', label: getMediaTypeLabel('image') });
  if (hasVideo) options.push({ value: 'video', label: getMediaTypeLabel('video') });
  return options;
}

function buildMediaYearOptions(mediaList) {
  const years = Array.from(new Set(mediaList.map(getMediaYearValue)));
  return [
    { value: '', label: '全部年份' },
    ...years.map((year) => ({
      value: year,
      label: year === UNKNOWN_YEAR ? UNKNOWN_YEAR_LABEL : year,
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
    { value: '', label: '全部上传者' },
    ...Array.from(groups.values()).sort((a, b) => a.label.localeCompare(b.label, 'zh-Hans-CN')),
  ];
}

function AlbumDetail() {
  const { id } = useParams();
  const currentUser = getUser();
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null, error: '' });
  const [dialogSubmitting, setDialogSubmitting] = useState(false);
  const filterState = useUrlFilterState(
    { q: '', type: '', year: '', owner: '' },
    { prefix: `album_${id}_` }
  );
  const mediaQuery = useAlbumMediaQuery(id, filterState.filters);
  const mediaMutations = useAlbumMediaMutations(id, {
    onAlbumChanged: mediaQuery.reloadAlbum,
    onMediaChanged: mediaQuery.reloadMedia,
  });
  const mediaDownload = useMediaDownload();
  const mediaEditor = useMediaEditor(mediaMutations.saveDescription);
  const mediaModal = useMediaModal(mediaQuery.mediaList);
  const typeOptions = buildMediaTypeOptions(mediaQuery.mediaList);
  const yearOptions = buildMediaYearOptions(mediaQuery.mediaList);
  const ownerOptions = buildOwnerOptions(mediaQuery.mediaList);

  function closeDeleteDialog() {
    if (dialogSubmitting) return;
    setDeleteDialog({ open: false, item: null, error: '' });
  }

  function handleDelete(item) {
    setDeleteDialog({ open: true, item, error: '' });
  }

  async function confirmDeleteItem() {
    if (!deleteDialog.item) return;

    setDialogSubmitting(true);
    try {
      await mediaMutations.removeMedia(deleteDialog.item);
      mediaModal.clearIfActive(deleteDialog.item.id);
      setDeleteDialog({ open: false, item: null, error: '' });
    } catch (error) {
      setDeleteDialog((prev) => ({
        ...prev,
        error: error.response?.data?.message || '删除这条回忆失败',
      }));
    } finally {
      setDialogSubmitting(false);
    }
  }

  async function handleSetCover(item) {
    try {
      await mediaMutations.makeAlbumCover(item);
    } catch {}
  }

  async function handleDownload(item) {
    await mediaDownload.downloadMedia(item);
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
        onDownload={handleDownload}
        downloading={mediaDownload.downloadingId === item.id}
      >
        <CommentList mediaId={item.id} currentUserId={currentUser?.id} currentUserRole={currentUser?.role} />
      </MediaCard>
    );
  }

  if (mediaQuery.loading && !mediaQuery.album) {
    return (
      <div className="page scrapbook-page">
        <main className="content memory-content">
          <p className="status-text">相册加载中...</p>
        </main>
      </div>
    );
  }

  if (!mediaQuery.album) {
    return (
      <div className="page scrapbook-page">
        <main className="content memory-content">
          <p className="status-text">未找到该相册。</p>
          <Link to="/" className="text-btn">返回首页</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="page scrapbook-page">
      <header className="topbar memory-topbar">
        <Link to="/" className="text-btn">返回</Link>
        <div className="album-title-block">
          <p className="eyebrow">Memory Album</p>
          <h1>{mediaQuery.album.title}</h1>
        </div>
        <span className="album-date">{formatDate(mediaQuery.album.created_at)}</span>
      </header>

      <main className="content memory-content album-detail-content">
        <aside className="year-bookmarks" aria-label="年份索引">
          {mediaQuery.yearGroups.map(({ year }) => (
            <a key={year} href={`#year-${year}`} className="year-bookmark">{year}</a>
          ))}
        </aside>

        <section className="album-book-shell detail-book-shell">
          <div className="book-spread detail-spread">
            <div className="book-page book-page-left upload-page">
              <div className="book-page-header">
                <span>添加回忆</span>
              </div>

              <MediaUploader
                uploading={mediaMutations.uploading}
                uploadMessage={mediaMutations.uploadMessage}
                uploadError={mediaMutations.uploadError}
                onUpload={mediaMutations.uploadFiles}
              />

              <FilterToolbar
                title="内容搜索与筛选"
                resultCount={mediaQuery.mediaList.length}
                onReset={filterState.resetFilters}
                showReset={filterState.hasActiveFilters}
              >
                <SearchBar
                  value={filterState.filters.q}
                  onSearch={(value) => filterState.setFilter('q', value)}
                  placeholder="搜索描述内容..."
                />
                <FilterSelect
                  value={filterState.filters.type}
                  onChange={(value) => filterState.setFilter('type', value)}
                  options={typeOptions}
                  ariaLabel="按类型筛选内容"
                />
                <FilterSelect
                  value={filterState.filters.year}
                  onChange={(value) => filterState.setFilter('year', value)}
                  options={yearOptions}
                  ariaLabel="按年份筛选内容"
                />
                <FilterSelect
                  value={filterState.filters.owner}
                  onChange={(value) => filterState.setFilter('owner', value)}
                  options={ownerOptions}
                  ariaLabel="按上传者筛选内容"
                />
              </FilterToolbar>
            </div>

            <div className="book-page book-page-right memories-page">
              {mediaDownload.error && <p className="status-text error">{mediaDownload.error}</p>}
              {mediaQuery.error && <p className="status-text error">{mediaQuery.error}</p>}

              {mediaQuery.mediaList.length === 0 && (
                <p className="status-text empty-memory">
                  {filterState.hasActiveFilters ? '没有符合当前筛选条件的内容。' : '还没有上传内容。'}
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
          onDownload={handleDownload}
          downloading={mediaDownload.downloadingId === mediaModal.activeMedia?.id}
          onSetCover={handleSetCover}
          onClose={mediaModal.closeMedia}
          onPrevious={mediaModal.previousMedia}
          onNext={mediaModal.nextMedia}
        />

        <ConfirmDialog
          open={deleteDialog.open}
          eyebrow="Delete Memory"
          title="删除这条回忆？"
          description="删除后将无法恢复，相关评论也会一并移除。"
          note="如果这条内容正在作为相册封面，建议先重新设置封面。"
          error={deleteDialog.error}
          confirmLabel="确认删除"
          danger
          confirming={dialogSubmitting}
          onConfirm={confirmDeleteItem}
          onClose={closeDeleteDialog}
        />
      </main>
    </div>
  );
}

export default AlbumDetail;
