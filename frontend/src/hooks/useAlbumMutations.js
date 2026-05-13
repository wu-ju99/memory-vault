import { useCallback, useState } from 'react';
import {
  createAlbum as createAlbumRequest,
  deleteAlbum as deleteAlbumRequest,
  renameAlbum as renameAlbumRequest,
  uploadAlbumCover,
} from '../api/albums';
import getErrorMessage from '../utils/apiError';

export default function useAlbumMutations(onAlbumsChanged) {
  const [coverUploadingId, setCoverUploadingId] = useState(null);
  const [managingAlbumId, setManagingAlbumId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const clearStatus = useCallback(() => {
    setMessage('');
    setError('');
  }, []);

  async function refreshAlbums() {
    await onAlbumsChanged?.();
  }

  async function createAlbum(title, albumYear) {
    const trimmed = title.trim();
    if (!trimmed) return null;

    clearStatus();
    try {
      const album = await createAlbumRequest(trimmed, albumYear);
      await refreshAlbums();
      setMessage('相册已创建');
      return album;
    } catch (mutationError) {
      setError(getErrorMessage(mutationError, '创建相册失败'));
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
      await uploadAlbumCover(album.id, file);
      await refreshAlbums();
      setMessage('封面已更新');
    } catch (mutationError) {
      setError(getErrorMessage(mutationError, '封面上传失败'));
    } finally {
      setCoverUploadingId(null);
    }
  }

  async function renameAlbum(album, title) {
    const trimmed = title.trim();
    if (!trimmed) {
      const nextError = '相册名称不能为空';
      setError(nextError);
      return { ok: false, error: nextError };
    }
    if (trimmed === album.title) return { ok: true };

    setManagingAlbumId(album.id);
    clearStatus();
    try {
      await renameAlbumRequest(album.id, trimmed);
      await refreshAlbums();
      setMessage('相册名称已更新');
      return { ok: true };
    } catch (mutationError) {
      const nextError = getErrorMessage(mutationError, '修改相册名称失败');
      setError(nextError);
      return { ok: false, error: nextError };
    } finally {
      setManagingAlbumId(null);
    }
  }

  async function removeAlbum(album) {
    setManagingAlbumId(album.id);
    clearStatus();
    try {
      await deleteAlbumRequest(album.id);
      await refreshAlbums();
      setMessage('相册已删除');
      return { ok: true };
    } catch (mutationError) {
      const nextError = getErrorMessage(mutationError, '删除相册失败');
      setError(nextError);
      return { ok: false, error: nextError };
    } finally {
      setManagingAlbumId(null);
    }
  }

  return {
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
