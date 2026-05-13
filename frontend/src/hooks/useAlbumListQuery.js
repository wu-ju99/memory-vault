import { useCallback, useEffect, useState } from 'react';
import { fetchAlbums } from '../api/albums';
import getErrorMessage from '../utils/apiError';

export default function useAlbumListQuery(filters) {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAlbums = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const rows = await fetchAlbums({
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
