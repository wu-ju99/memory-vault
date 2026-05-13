import { useRef } from 'react';
import BASE_URL from '../../config';
import UserIdentity from '../UserIdentity';

function CoverUploadButton({ album, onUploadCover }) {
  const inputRef = useRef(null);

  function handleChange(e) {
    const file = e.target.files?.[0];
    if (file) onUploadCover(album.id, file);
    e.target.value = '';
  }

  return (
    <>
      <input
        ref={inputRef}
        className="file-input"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
      />
      <button onClick={() => inputRef.current?.click()} type="button">换封面</button>
    </>
  );
}

function AdminAlbumTable({
  albums,
  selectedIds = [],
  onToggleAlbum,
  onToggleAllAlbums,
  onDeleteAlbum,
  onUploadCover,
}) {
  const selectedSet = new Set(selectedIds);
  const allSelected = albums.length > 0 && albums.every((album) => selectedSet.has(album.id));

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(event) => onToggleAllAlbums?.(event.target.checked)}
                aria-label="全选相册"
              />
            </th>
            <th>相册</th>
            <th>年份</th>
            <th>创建者</th>
            <th>封面</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {albums.length === 0 && (
            <tr>
              <td colSpan="7" className="admin-empty-cell">没有符合条件的相册。</td>
            </tr>
          )}
          {albums.map((album) => {
            const coverSrc = album.cover_url
              ? `${BASE_URL}${album.cover_url}${album.cover_version ? `?v=${album.cover_version}` : ''}`
              : '';
            return (
              <tr key={album.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedSet.has(album.id)}
                    onChange={(event) => onToggleAlbum?.(album.id, event.target.checked)}
                    aria-label={`选择相册 ${album.title}`}
                  />
                </td>
                <td><strong>{album.title}</strong></td>
                <td>{album.album_year || '-'}</td>
                <td>
                  <UserIdentity
                    user={album}
                    avatarSize="sm"
                    className="admin-content-owner"
                  />
                </td>
                <td>
                  {coverSrc ? (
                    <img src={coverSrc} alt="" className="admin-cover-thumb" />
                  ) : (
                    <span>无封面</span>
                  )}
                </td>
                <td>{album.created_at?.slice(0, 10)}</td>
                <td>
                  <div className="admin-actions">
                    <CoverUploadButton album={album} onUploadCover={onUploadCover} />
                    <button className="danger" onClick={() => onDeleteAlbum(album)} type="button">
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default AdminAlbumTable;
