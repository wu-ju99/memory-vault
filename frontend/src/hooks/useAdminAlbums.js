import { useCallback, useEffect, useState } from 'react';
import {
  deleteAdminAlbum,
  fetchAdminAlbums,
  uploadAdminAlbumCover,
} from '../api/admin';

function getErrorMessage(error, fallback) {
  return error.response?.data?.message || fallback;
}

function withCoverVersion(album, coverUrl) {
  return { ...album, cover_url: coverUrl, cover_version: Date.now() };
}

export default function useAdminAlbums() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadAlbums = useCallback(() => {
    setLoading(true);
    fetchAdminAlbums()
      .then(setAlbums)
      .catch((err) => setError(getErrorMessage(err, '加载相册失败')))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadAlbums();
  }, [loadAlbums]);

  async function removeAlbum(albumId) {
    setMessage('');
    setError('');
    try {
      await deleteAdminAlbum(albumId);
      setAlbums((prev) => prev.filter((album) => album.id !== albumId));
      setMessage('相册已删除');
    } catch (err) {
      setError(getErrorMessage(err, '删除相册失败'));
    }
  }

  async function uploadCover(albumId, file) {
    if (!file.type.startsWith('image/')) {
      setError('封面只能上传图片');
      return;
    }

    setMessage('');
    setError('');
    try {
      const coverUrl = await uploadAdminAlbumCover(albumId, file);
      setAlbums((prev) => prev.map((album) =>
        album.id === albumId ? withCoverVersion(album, coverUrl) : album
      ));
      setMessage('封面已更新');
    } catch (err) {
      setError(getErrorMessage(err, '封面更新失败'));
    }
  }

  return {
    albums,
    loading,
    message,
    error,
    removeAlbum,
    uploadCover,
    reloadAlbums: loadAlbums,
  };
}
