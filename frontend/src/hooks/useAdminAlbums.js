import useAdminAlbumsQuery from './useAdminAlbumsQuery';
import useAdminAlbumMutations from './useAdminAlbumMutations';

export default function useAdminAlbums(filters = { q: '', year: '', owner: '' }) {
  const query = useAdminAlbumsQuery(filters);
  const mutations = useAdminAlbumMutations(query.reload);

  return {
    albums: query.albums,
    loading: query.loading,
    message: mutations.message,
    error: mutations.error || query.error,
    removeAlbum: mutations.removeAlbum,
    uploadCover: mutations.uploadCover,
    reloadAlbums: query.reload,
  };
}
