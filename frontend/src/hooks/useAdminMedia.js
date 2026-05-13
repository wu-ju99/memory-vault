import useAdminMediaQuery from './useAdminMediaQuery';
import useAdminMediaMutations from './useAdminMediaMutations';

export default function useAdminMedia(filters = { q: '', type: '', year: '', owner: '', album: '' }) {
  const query = useAdminMediaQuery(filters);
  const mutations = useAdminMediaMutations(query.reload);

  return {
    media: query.media,
    loading: query.loading,
    message: mutations.message,
    error: mutations.error || query.error,
    removeMedia: mutations.removeMedia,
    reloadMedia: query.reload,
  };
}
