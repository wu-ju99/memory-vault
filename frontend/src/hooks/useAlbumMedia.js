import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchAlbums, setAlbumCover } from '../api/albums';
import {
  deleteMedia,
  fetchMedia,
  updateMediaDescription,
  uploadMediaFiles,
} from '../api/media';

function getErrorMessage(error, fallback) {
  return error.response?.data?.message || fallback;
}

function groupMediaByYear(mediaList) {
  const groups = {};
  mediaList.forEach((item) => {
    const time = item.event_time || item.created_at;
    const year = time ? new Date(time).getFullYear().toString() : '未知年份';
    if (!groups[year]) groups[year] = [];
    groups[year].push(item);
  });

  return Object.entries(groups)
    .sort(([a], [b]) => {
      if (a === '未知年份') return 1;
      if (b === '未知年份') return -1;
      return Number(b) - Number(a);
    })
    .map(([year, items]) => ({ year, items }));
}

export default function useAlbumMedia(albumId) {
  const [album, setAlbum] = useState(null);
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadError, setUploadError] = useState('');

  const loadAlbumMedia = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetchAlbums(),
      fetchMedia(albumId),
    ])
      .then(([albums, media]) => {
        setAlbum(albums.find((item) => item.id === parseInt(albumId, 10)) || null);
        setMediaList(media);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [albumId]);

  useEffect(() => {
    loadAlbumMedia();
  }, [loadAlbumMedia]);

  const yearGroups = useMemo(() => groupMediaByYear(mediaList), [mediaList]);

  async function uploadFiles(files, options) {
    if (!files || files.length === 0) return null;

    setUploadError('');
    setUploadMessage('');
    setUploading(true);
    try {
      const result = await uploadMediaFiles(albumId, files, options);
      setUploadMessage(`上传完成：${result.count} 个文件`);
      loadAlbumMedia();
      return result;
    } catch (err) {
      setUploadError(getErrorMessage(err, '上传失败'));
      return null;
    } finally {
      setUploading(false);
    }
  }

  async function removeMedia(item) {
    await deleteMedia(item.id);
    setMediaList((prev) => prev.filter((media) => media.id !== item.id));
  }

  async function saveDescription(mediaId, description) {
    const updated = await updateMediaDescription(mediaId, description);
    setMediaList((prev) => prev.map((media) =>
      media.id === mediaId ? { ...media, description: updated.description } : media
    ));
    return updated;
  }

  async function makeAlbumCover(item) {
    const coverUrl = await setAlbumCover(albumId, item.url);
    setAlbum((prev) => (prev ? { ...prev, cover_url: coverUrl } : prev));
  }

  return {
    album,
    mediaList,
    yearGroups,
    loading,
    uploading,
    uploadMessage,
    uploadError,
    uploadFiles,
    removeMedia,
    saveDescription,
    makeAlbumCover,
  };
}
