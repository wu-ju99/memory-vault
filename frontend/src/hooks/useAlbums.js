import { useCallback, useEffect, useState } from 'react';
import {
  createAlbum as createAlbumRequest,
  deleteAlbum as deleteAlbumRequest,
  fetchAlbums,
  renameAlbum as renameAlbumRequest,
  uploadAlbumCover,
} from '../api/albums';

function getErrorMessage(error, fallback) {
  return error.response?.data?.message || fallback;
}

function withCoverVersion(album, coverUrl) {
  return { ...album, cover_url: coverUrl, cover_version: Date.now() };
}

function replaceAlbum(albums, albumId, updater) {
  return albums.map((album) => (album.id === albumId ? updater(album) : album));
}

export default function useAlbums() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coverUploadingId, setCoverUploadingId] = useState(null);
  const [managingAlbumId, setManagingAlbumId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const clearStatus = useCallback(() => {
    setMessage('');
    setError('');
  }, []);

  const loadAlbums = useCallback(() => {
    setLoading(true);
    fetchAlbums()
      .then(setAlbums)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadAlbums();
  }, [loadAlbums]);

  async function createAlbum(title) {
    const trimmed = title.trim();
    if (!trimmed) return null;

    clearStatus();
    try {
      const album = await createAlbumRequest(trimmed);
      setAlbums((prev) => [album, ...prev]);
      return album;
    } catch (err) {
      setError(getErrorMessage(err, '创建相册失败'));
      return null;
    }
  }

  async function uploadCover(album, file) {
    if (!file.type.startsWith('image/')) {
      setError('封面只能上传图片');
      return;
    }

    setCoverUploadingId(album.id);
    clearStatus();
    try {
      const coverUrl = await uploadAlbumCover(album.id, file);
      setAlbums((prev) => replaceAlbum(prev, album.id, (item) => withCoverVersion(item, coverUrl)));
      setMessage('封面已更新');
    } catch (err) {
      setError(getErrorMessage(err, '封面上传失败'));
    } finally {
      setCoverUploadingId(null);
    }
  }

  async function renameAlbum(album, title) {
    const trimmed = title.trim();
    if (!trimmed) {
      setError('相册名称不能为空');
      return;
    }
    if (trimmed === album.title) return;

    setManagingAlbumId(album.id);
    clearStatus();
    try {
      const updated = await renameAlbumRequest(album.id, trimmed);
      setAlbums((prev) => replaceAlbum(prev, album.id, (item) => ({ ...item, ...updated })));
      setMessage('相册名称已更新');
    } catch (err) {
      setError(getErrorMessage(err, '修改相册名称失败'));
    } finally {
      setManagingAlbumId(null);
    }
  }

  async function removeAlbum(album) {
    setManagingAlbumId(album.id);
    clearStatus();
    try {
      await deleteAlbumRequest(album.id);
      setAlbums((prev) => prev.filter((item) => item.id !== album.id));
      setMessage('相册已删除');
    } catch (err) {
      setError(getErrorMessage(err, '删除相册失败'));
    } finally {
      setManagingAlbumId(null);
    }
  }

  return {
    albums,
    loading,
    coverUploadingId,
    managingAlbumId,
    message,
    error,
    createAlbum,
    uploadCover,
    renameAlbum,
    removeAlbum,
  };
}
