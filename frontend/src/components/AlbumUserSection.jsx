import AlbumCard from './AlbumCard';

function AlbumUserSection({
  group,
  sectionId,
  currentUser,
  coverUploadingId,
  managingAlbumId,
  onCoverUpload,
  onRename,
  onDelete,
}) {
  return (
    <section id={sectionId} className="album-user-section" data-user-key={group.userKey}>
      <div className="album-user-heading">
        <div>
          <p>Uploaded by</p>
          <h2>
            {group.displayName}
            {group.role === 'admin' && <span className="admin-badge">管理员</span>}
          </h2>
        </div>
        <span>{group.items.length} 本相册</span>
      </div>

      <div className="album-grid album-polaroid-grid album-user-grid">
        {group.items.map((album, index) => {
          const isOwner = album.user_id === currentUser?.id;
          return (
            <AlbumCard
              key={album.id}
              album={album}
              index={group.startIndex + index}
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

export default AlbumUserSection;
