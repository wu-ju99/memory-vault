import api from './axios';

function cleanParams(filters = {}) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && value !== '')
  );
}

export async function fetchAdminUsers(filters = {}) {
  const res = await api.get('/admin/users', { params: cleanParams(filters) });
  return res.data.users;
}

export async function updateAdminUser(userId, fields) {
  const res = await api.put(`/admin/users/${userId}`, fields);
  return res.data.user;
}

export async function deleteAdminUser(userId) {
  await api.delete(`/admin/users/${userId}`);
}

export async function fetchAdminMedia(filters = {}) {
  const res = await api.get('/admin/media', { params: cleanParams(filters) });
  return res.data.media;
}

export async function deleteAdminMedia(mediaId) {
  await api.delete(`/admin/media/${mediaId}`);
}

export async function deleteAdminMediaBatch(ids) {
  const res = await api.delete('/admin/media/batch', { data: { ids } });
  return res.data;
}

export async function fetchAdminAlbums(filters = {}) {
  const res = await api.get('/admin/albums', { params: cleanParams(filters) });
  return res.data.albums;
}

export async function deleteAdminAlbum(albumId) {
  await api.delete(`/admin/albums/${albumId}`);
}

export async function deleteAdminAlbumBatch(ids) {
  const res = await api.delete('/admin/albums/batch', { data: { ids } });
  return res.data;
}

export async function uploadAdminAlbumCover(albumId, file) {
  const formData = new FormData();
  formData.append('cover', file);
  const res = await api.put(`/admin/albums/${albumId}/cover`, formData);
  return res.data.cover_url;
}
