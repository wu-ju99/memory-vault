import { useParams, Link } from 'react-router-dom';
import { getUser } from '../utils/auth';
import MediaCard from '../components/MediaCard';
import CommentList from '../components/CommentList';
import MediaUploader from '../components/MediaUploader';
import MediaModal from '../components/MediaModal';
import useAlbumMedia from '../hooks/useAlbumMedia';
import useMediaEditor from '../hooks/useMediaEditor';
import useMediaModal from '../hooks/useMediaModal';

function formatDate(iso) {
  return iso ? iso.slice(0, 10) : '';
}

function AlbumDetail() {
  const { id } = useParams();
  const currentUser = getUser();
  const {
    album,
    mediaList,
    yearGroups,
    loading,
    uploading,
    uploadMessage,
    uploadError,
    uploadFiles,
    removeMedia,
    saveDescription,
    makeAlbumCover,
  } = useAlbumMedia(id);
  const mediaEditor = useMediaEditor(saveDescription);
  const mediaModal = useMediaModal(mediaList);

  async function handleDelete(item) {
    if (!window.confirm('确定删除这条回忆吗？')) return;
    try {
      await removeMedia(item);
      mediaModal.clearIfActive(item.id);
    } catch {}
  }

  async function handleSetCover(item) {
    try {
      await makeAlbumCover(item);
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

  if (loading) {
    return <div className="page scrapbook-page"><main className="content memory-content"><p className="status-text">正在翻找相册...</p></main></div>;
  }

  if (!album) {
    return (
      <div className="page scrapbook-page">
        <main className="content memory-content">
          <p className="status-text">相册不存在</p>
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
          <p className="eyebrow">Album</p>
          <h1>{album.title}</h1>
        </div>
        <span className="album-date">{formatDate(album.created_at)}</span>
      </header>

      <main className="content memory-content album-detail-content">
        <aside className="year-bookmarks" aria-label="年份书签">
          {yearGroups.map(({ year }) => (
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
                uploading={uploading}
                uploadMessage={uploadMessage}
                uploadError={uploadError}
                onUpload={uploadFiles}
              />
            </div>

            <div className="book-page book-page-right memories-page">
              {mediaList.length === 0 && (
                <p className="status-text empty-memory">暂无内容，上传第一张回忆吧。</p>
              )}

              {yearGroups.map(({ year, items }) => {
                const photos = items.filter((i) => i.type === 'image');
                const videos = items.filter((i) => i.type === 'video');
                return (
                  <section key={year} id={`year-${year}`} className="memory-year-section">
                    <div className="year-heading">
                      <h2>{year}</h2>
                      <span>{items.length} 张</span>
                    </div>
                    {photos.length > 0 && (
                      <>
                        <p className="media-type-label">照片 ({photos.length})</p>
                        <div className="grid scrapbook-grid">
                          {photos.map((item, index) => renderMediaCard(item, index))}
                        </div>
                      </>
                    )}
                    {videos.length > 0 && (
                      <>
                        <p className="media-type-label">视频 ({videos.length})</p>
                        <div className="grid scrapbook-grid">
                          {videos.map((item, index) => renderMediaCard(item, index))}
                        </div>
                      </>
                    )}
                  </section>
                );
              })}
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
