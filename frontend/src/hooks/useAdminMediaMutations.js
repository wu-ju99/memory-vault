import { useState } from 'react';
import { deleteAdminMedia, deleteAdminMediaBatch } from '../api/admin';
import getErrorMessage from '../utils/apiError';

export default function useAdminMediaMutations(onMediaChanged) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function refreshMedia() {
    await onMediaChanged?.();
  }

  async function removeMedia(mediaId) {
    setMessage('');
    setError('');
    try {
      await deleteAdminMedia(mediaId);
      await refreshMedia();
      setMessage('媒体已删除');
      return { ok: true };
    } catch (mutationError) {
      const nextError = getErrorMessage(mutationError, '删除媒体失败');
      setError(nextError);
      return { ok: false, error: nextError };
    }
  }

  async function removeMediaBatch(ids) {
    setMessage('');
    setError('');
    try {
      const result = await deleteAdminMediaBatch(ids);
      await refreshMedia();
      setMessage(result.message || `已删除 ${ids.length} 条媒体`);
      return { ok: true, count: result.count || ids.length };
    } catch (mutationError) {
      const nextError = getErrorMessage(mutationError, '批量删除媒体失败');
      setError(nextError);
      return { ok: false, error: nextError };
    }
  }

  return {
    message,
    error,
    removeMedia,
    removeMediaBatch,
  };
}
