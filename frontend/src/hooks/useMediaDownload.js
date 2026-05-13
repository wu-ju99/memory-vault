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
  const [batchDownloading, setBatchDownloading] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ completed: 0, total: 0 });
  const [error, setError] = useState('');

  async function performDownload(media) {
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
  }

  async function downloadMedia(media) {
    if (!media?.id) return false;

    setDownloadingId(media.id);
    setError('');

    try {
      await performDownload(media);
      return true;
    } catch (downloadError) {
      setError(getErrorMessage(downloadError, '下载失败'));
      return false;
    } finally {
      setDownloadingId(null);
    }
  }

  async function downloadMediaBatch(mediaList = []) {
    const items = mediaList.filter((item) => item?.id);
    if (items.length === 0) {
      setError('请至少选择一条内容');
      return { ok: false, count: 0 };
    }

    setError('');
    setBatchDownloading(true);
    setBatchProgress({ completed: 0, total: items.length });

    try {
      for (let index = 0; index < items.length; index += 1) {
        const item = items[index];
        setDownloadingId(item.id);
        await performDownload(item);
        setBatchProgress({ completed: index + 1, total: items.length });
        await new Promise((resolve) => window.setTimeout(resolve, 120));
      }

      return { ok: true, count: items.length };
    } catch (downloadError) {
      setError(getErrorMessage(downloadError, '批量下载失败'));
      return { ok: false, count: 0 };
    } finally {
      setDownloadingId(null);
      setBatchDownloading(false);
    }
  }

  function clearError() {
    setError('');
  }

  return {
    downloadingId,
    batchDownloading,
    batchProgress,
    error,
    downloadMedia,
    downloadMediaBatch,
    clearError,
  };
}
