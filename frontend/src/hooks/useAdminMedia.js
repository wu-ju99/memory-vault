import { useCallback, useEffect, useState } from 'react';
import { deleteAdminMedia, fetchAdminMedia } from '../api/admin';

function getErrorMessage(error, fallback) {
  return error.response?.data?.message || fallback;
}

export default function useAdminMedia() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadMedia = useCallback(() => {
    setLoading(true);
    fetchAdminMedia()
      .then(setMedia)
      .catch((err) => setError(getErrorMessage(err, '加载媒体失败')))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  async function removeMedia(mediaId) {
    setMessage('');
    setError('');
    try {
      await deleteAdminMedia(mediaId);
      setMedia((prev) => prev.filter((item) => item.id !== mediaId));
      setMessage('媒体已删除');
    } catch (err) {
      setError(getErrorMessage(err, '删除媒体失败'));
    }
  }

  return {
    media,
    loading,
    message,
    error,
    removeMedia,
    reloadMedia: loadMedia,
  };
}
