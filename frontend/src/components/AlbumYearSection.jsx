import AlbumCard from './AlbumCard';

function AlbumYearSection({
  year,
  albums,
  sectionId,
  startIndex = 0,
  currentUser,
  coverUploadingId,
  managingAlbumId,
  onCoverUpload,
  onRename,
  onDelete,
}) {
  return (
    <section id={sectionId} className="album-year-section" data-year={year}>
      <div className="album-year-heading">
        <h2>{year}</h2>
        <span>{albums.length} 本</span>
      </div>
      <div className="album-grid album-polaroid-grid album-year-grid">
        {albums.map((album, index) => {
          const isOwner = album.user_id === currentUser?.id;
          return (
            <AlbumCard
              key={album.id}
              album={album}
              index={startIndex + index}
              onCoverUpload={onCoverUpload}
              uploading={coverUploadingId === album.id}
              onRename={isOwner ? onRename : null}
              onDelete={isOwner ? onDelete : null}
              managing={managingAlbumId === album.id}
            />
          );
        })}
      </div>
    </section>
  );
}

export default AlbumYearSection;
