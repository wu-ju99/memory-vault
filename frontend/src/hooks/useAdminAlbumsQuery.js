import { useCallback, useEffect, useState } from 'react';
import { fetchAdminAlbums } from '../api/admin';
import getErrorMessage from '../utils/apiError';

export default function useAdminAlbumsQuery(filters) {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAlbums = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const rows = await fetchAdminAlbums({
        q: filters.q,
        year: filters.year,
        user_id: filters.owner,
      });
      setAlbums(rows);
      return rows;
    } catch (loadError) {
      setAlbums([]);
      setError(getErrorMessage(loadError, '加载相册失败'));
      return [];
    } finally {
      setLoading(false);
    }
  }, [filters.owner, filters.q, filters.year]);

  useEffect(() => {
    loadAlbums();
  }, [loadAlbums]);

  return {
    albums,
    loading,
    error,
    reload: loadAlbums,
  };
}
