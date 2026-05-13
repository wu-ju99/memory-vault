import useAlbumListQuery from './useAlbumListQuery';
import useAlbumMutations from './useAlbumMutations';

export default function useAlbums(filters = { q: '', year: '', owner: '' }) {
  const query = useAlbumListQuery(filters);
  const mutations = useAlbumMutations(query.reload);

  return {
    albums: query.albums,
    loading: query.loading,
    coverUploadingId: mutations.coverUploadingId,
    managingAlbumId: mutations.managingAlbumId,
    message: mutations.message,
    error: mutations.error || query.error,
    createAlbum: mutations.createAlbum,
    uploadCover: mutations.uploadCover,
    renameAlbum: mutations.renameAlbum,
    removeAlbum: mutations.removeAlbum,
    reloadAlbums: query.reload,
  };
}
