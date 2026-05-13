import useAlbumMediaQuery from './useAlbumMediaQuery';
import useAlbumMediaMutations from './useAlbumMediaMutations';

export default function useAlbumMedia(albumId, filters = { q: '', type: '', year: '', owner: '' }) {
  const query = useAlbumMediaQuery(albumId, filters);
  const mutations = useAlbumMediaMutations(albumId, {
    onAlbumChanged: query.reloadAlbum,
    onMediaChanged: query.reloadMedia,
  });

  return {
    album: query.album,
    mediaList: query.mediaList,
    yearGroups: query.yearGroups,
    loading: query.loading,
    uploading: mutations.uploading,
    uploadMessage: mutations.uploadMessage,
    uploadError: mutations.uploadError,
    uploadFiles: mutations.uploadFiles,
    removeMedia: mutations.removeMedia,
    saveDescription: mutations.saveDescription,
    makeAlbumCover: mutations.makeAlbumCover,
    reloadAlbum: query.reloadAlbum,
    reloadMedia: query.reloadMedia,
    error: query.error,
  };
}
