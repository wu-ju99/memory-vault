import { useState } from 'react';
import { setAlbumCover } from '../api/albums';
import {
  deleteMedia,
  updateMediaDescription,
  uploadMediaFiles,
} from '../api/media';
import getErrorMessage from '../utils/apiError';

export default function useAlbumMediaMutations(albumId, handlers = {}) {
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadError, setUploadError] = useState('');

  async function refreshMedia() {
    await handlers.onMediaChanged?.();
  }

  async function refreshAlbum() {
    await handlers.onAlbumChanged?.();
  }

  async function uploadFiles(files, options) {
    if (!files || files.length === 0) return null;

    setUploadError('');
    setUploadMessage('');
    setUploading(true);
    try {
      const result = await uploadMediaFiles(albumId, files, options);
      if (!result?.count) {
        setUploadError('没有可上传的文件，请检查文件格式或大小后重试');
        return null;
      }
      await refreshMedia();
      setUploadMessage(`上传完成，共 ${result.count} 个文件`);
      return result;
    } catch (mutationError) {
      setUploadError(getErrorMessage(mutationError, '上传失败'));
      return null;
    } finally {
      setUploading(false);
    }
  }

  async function removeMedia(item) {
    await deleteMedia(item.id);
    await Promise.all([refreshMedia(), refreshAlbum()]);
  }

  async function saveDescription(mediaId, description) {
    const updated = await updateMediaDescription(mediaId, description);
    await refreshMedia();
    return updated;
  }

  async function makeAlbumCover(item) {
    const coverUrl = await setAlbumCover(albumId, item.url);
    await refreshAlbum();
    return coverUrl;
  }

  return {
    uploading,
    uploadMessage,
    uploadError,
    uploadFiles,
    removeMedia,
    saveDescription,
    makeAlbumCover,
  };
}
