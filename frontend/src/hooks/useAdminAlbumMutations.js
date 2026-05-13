import { useState } from 'react';
import {
  deleteAdminAlbum,
  deleteAdminAlbumBatch,
  uploadAdminAlbumCover,
} from '../api/admin';
import getErrorMessage from '../utils/apiError';

export default function useAdminAlbumMutations(onAlbumsChanged) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function refreshAlbums() {
    await onAlbumsChanged?.();
  }

  async function removeAlbum(albumId) {
    setMessage('');
    setError('');
    try {
      await deleteAdminAlbum(albumId);
      await refreshAlbums();
      setMessage('相册已删除');
      return { ok: true };
    } catch (mutationError) {
      const nextError = getErrorMessage(mutationError, '删除相册失败');
      setError(nextError);
      return { ok: false, error: nextError };
    }
  }

  async function removeAlbums(ids) {
    setMessage('');
    setError('');
    try {
      const result = await deleteAdminAlbumBatch(ids);
      await refreshAlbums();
      setMessage(result.message || `已删除 ${ids.length} 个相册`);
      return { ok: true, count: result.count || ids.length };
    } catch (mutationError) {
      const nextError = getErrorMessage(mutationError, '批量删除相册失败');
      setError(nextError);
      return { ok: false, error: nextError };
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
      await uploadAdminAlbumCover(albumId, file);
      await refreshAlbums();
      setMessage('封面已更新');
      return true;
    } catch (mutationError) {
      setError(getErrorMessage(mutationError, '封面更新失败'));
      return false;
    }
  }

  return {
    message,
    error,
    removeAlbum,
    removeAlbums,
    uploadCover,
  };
}
