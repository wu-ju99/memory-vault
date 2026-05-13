import UserIdentity from './UserIdentity';

function MediaUserSection({ group, renderMediaCard }) {
  const photos = group.items.filter((item) => item.type === 'image');
  const videos = group.items.filter((item) => item.type === 'video');

  return (
    <section className="media-user-section">
      <div className="media-user-heading">
        <div>
          <p>Uploaded by</p>
          <h2><UserIdentity user={group} avatarSize="lg" /></h2>
        </div>
        <span>{photos.length} 张照片 / {videos.length} 个视频</span>
      </div>

      {photos.length > 0 && (
        <>
          <p className="media-type-label">照片 ({photos.length})</p>
          <div className="grid scrapbook-grid">
            {photos.map((item, index) => renderMediaCard(item, group.startIndex + index))}
          </div>
        </>
      )}

      {videos.length > 0 && (
        <>
          <p className="media-type-label">视频 ({videos.length})</p>
          <div className="grid scrapbook-grid">
            {videos.map((item, index) => renderMediaCard(item, group.startIndex + photos.length + index))}
          </div>
        </>
      )}
    </section>
  );
}

export default MediaUserSection;
