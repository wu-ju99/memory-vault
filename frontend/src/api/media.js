import api from './axios';

function cleanParams(filters = {}) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && value !== '')
  );
}

export async function fetchMedia(filters = {}) {
  const res = await api.get('/media', { params: cleanParams(filters) });
  return res.data.media;
}

export async function uploadMediaFiles(albumId, files, options = {}) {
  const formData = new FormData();
  Array.from(files).forEach((file) => formData.append('files', file));
  if (options.description?.trim()) {
    formData.append('description', options.description.trim());
  }
  if (options.eventTime) {
    formData.append('event_time', options.eventTime);
  }
  formData.append('album_id', albumId);

  const res = await api.post('/media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function updateMediaDescription(mediaId, description) {
  const res = await api.put(`/media/${mediaId}`, { description });
  return res.data;
}

export async function deleteMedia(mediaId) {
  await api.delete(`/media/${mediaId}`);
}
