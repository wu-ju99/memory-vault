function MediaYearSection({ year, items, renderMediaCard }) {
  const photos = items.filter((item) => item.type === 'image');
  const videos = items.filter((item) => item.type === 'video');

  return (
    <section id={`year-${year}`} className="memory-year-section">
      <div className="year-heading">
        <h2>{year}</h2>
        <span>{items.length} 条内容</span>
      </div>

      {photos.length > 0 && (
        <section className="media-type-section">
          <div className="media-type-heading">
            <div className="media-type-title">
              <span className="media-type-icon media-type-icon-photo" aria-hidden="true" />
              <strong>照片</strong>
            </div>
            <span>{photos.length}</span>
          </div>
          <div className="grid scrapbook-grid">
            {photos.map((item, index) => renderMediaCard(item, index))}
          </div>
        </section>
      )}

      {videos.length > 0 && (
        <section className="media-type-section">
          <div className="media-type-heading">
            <div className="media-type-title">
              <span className="media-type-icon media-type-icon-video" aria-hidden="true" />
              <strong>视频</strong>
            </div>
            <span>{videos.length}</span>
          </div>
          <div className="grid scrapbook-grid">
            {videos.map((item, index) => renderMediaCard(item, photos.length + index))}
          </div>
        </section>
      )}
    </section>
  );
}

export default MediaYearSection;
