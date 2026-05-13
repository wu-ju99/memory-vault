import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchAlbum } from '../api/albums';
import { fetchMedia } from '../api/media';
import getErrorMessage from '../utils/apiError';
import { getMediaYearValue, sortYearValues } from '../utils/yearGroups';

function groupMediaByYear(mediaList) {
  const groups = {};
  mediaList.forEach((item) => {
    const year = getMediaYearValue(item);
    if (!groups[year]) groups[year] = [];
    groups[year].push(item);
  });

  return Object.entries(groups)
    .sort(([a], [b]) => sortYearValues(a, b))
    .map(([year, items]) => ({ year, items }));
}

export default function useAlbumMediaQuery(albumId, filters) {
  const [album, setAlbum] = useState(null);
  const [albumLoading, setAlbumLoading] = useState(true);
  const [mediaList, setMediaList] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAlbum = useCallback(async () => {
    setAlbumLoading(true);
    setError('');
    try {
      const nextAlbum = await fetchAlbum(albumId);
      setAlbum(nextAlbum);
      return nextAlbum;
    } catch (loadError) {
      if (loadError.response?.status === 404) {
        setAlbum(null);
        return null;
      }
      setError(getErrorMessage(loadError, '加载相册失败'));
      throw loadError;
    } finally {
      setAlbumLoading(false);
    }
  }, [albumId]);

  const loadMedia = useCallback(async () => {
    setMediaLoading(true);
    setError('');
    try {
      const rows = await fetchMedia({
        album_id: albumId,
        q: filters.q,
        type: filters.type,
        year: filters.year,
        user_id: filters.owner,
      });
      setMediaList(rows);
      return rows;
    } catch (loadError) {
      setMediaList([]);
      setError(getErrorMessage(loadError, '加载媒体失败'));
      return [];
    } finally {
      setMediaLoading(false);
    }
  }, [albumId, filters.owner, filters.q, filters.type, filters.year]);

  useEffect(() => {
    loadAlbum();
  }, [loadAlbum]);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  const yearGroups = useMemo(() => groupMediaByYear(mediaList), [mediaList]);

  return {
    album,
    mediaList,
    yearGroups,
    loading: albumLoading || mediaLoading,
    error,
    reloadAlbum: loadAlbum,
    reloadMedia: loadMedia,
  };
}
