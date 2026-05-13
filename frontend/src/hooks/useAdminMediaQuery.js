import { useCallback, useEffect, useState } from 'react';
import { fetchAdminMedia } from '../api/admin';
import getErrorMessage from '../utils/apiError';

export default function useAdminMediaQuery(filters) {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadMedia = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const rows = await fetchAdminMedia({
        q: filters.q,
        type: filters.type,
        year: filters.year,
        user_id: filters.owner,
        album_id: filters.album,
      });
      setMedia(rows);
      return rows;
    } catch (loadError) {
      setMedia([]);
      setError(getErrorMessage(loadError, '加载媒体失败'));
      return [];
    } finally {
      setLoading(false);
    }
  }, [filters.album, filters.owner, filters.q, filters.type, filters.year]);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  return {
    media,
    loading,
    error,
    reload: loadMedia,
  };
}
