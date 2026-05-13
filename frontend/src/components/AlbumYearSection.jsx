import AlbumUserSection from './AlbumUserSection';
import useAlbumUsers from '../hooks/useAlbumUsers';

function AlbumYearSection({
  year,
  albums,
  sectionId,
  currentUser,
  coverUploadingId,
  managingAlbumId,
  onCoverUpload,
  onRename,
  onDelete,
}) {
  const userGroups = useAlbumUsers(albums);

  return (
    <section id={sectionId} className="album-year-section" data-year={year}>
      <div className="album-year-heading">
        <h2>{year}</h2>
        <span>{albums.length} 本</span>
      </div>

      <div className="album-year-user-sections">
        {userGroups.map((group) => (
          <AlbumUserSection
            key={group.userKey}
            group={group}
            sectionId={`${sectionId}-${group.userKey}`}
            currentUser={currentUser}
            coverUploadingId={coverUploadingId}
            managingAlbumId={managingAlbumId}
            onCoverUpload={onCoverUpload}
            onRename={onRename}
            onDelete={onDelete}
          />
        ))}
      </div>
    </section>
  );
}

export default AlbumYearSection;
