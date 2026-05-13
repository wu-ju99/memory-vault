import { useState } from 'react';
import api from '../api/axios';
import getErrorMessage from '../utils/apiError';

function resolveFilename(response, fallback) {
  const disposition = response.headers['content-disposition'] || '';
  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const plainMatch = disposition.match(/filename="?([^"]+)"?/i);
  if (plainMatch?.[1]) {
    return plainMatch[1];
  }

  return fallback;
}

function getFallbackName(media) {
  const suffix = media?.type === 'video' ? 'video' : 'photo';
  return `memory-vault-${suffix}-${media?.id || 'download'}`;
}

export default function useMediaDownload() {
  const [downloadingId, setDownloadingId] = useState(null);
  const [error, setError] = useState('');

  async function downloadMedia(media) {
    if (!media?.id) return false;

    setDownloadingId(media.id);
    setError('');

    try {
      const response = await api.get(`/media/${media.id}/download`, {
        responseType: 'blob',
      });

      const filename = resolveFilename(response, getFallbackName(media));
      const blobUrl = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      return true;
    } catch (downloadError) {
      setError(getErrorMessage(downloadError, '下载失败'));
      return false;
    } finally {
      setDownloadingId(null);
    }
  }

  function clearError() {
    setError('');
  }

  return {
    downloadingId,
    error,
    downloadMedia,
    clearError,
  };
}
