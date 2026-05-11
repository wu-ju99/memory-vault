import api from './axios';

export async function fetchAdminUsers() {
  const res = await api.get('/admin/users');
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
  const res = await api.get('/admin/media', { params: filters });
  return res.data.media;
}

export async function deleteAdminMedia(mediaId) {
  await api.delete(`/admin/media/${mediaId}`);
}

export async function fetchAdminAlbums() {
  const res = await api.get('/admin/albums');
  return res.data.albums;
}

export async function deleteAdminAlbum(albumId) {
  await api.delete(`/admin/albums/${albumId}`);
}

export async function uploadAdminAlbumCover(albumId, file) {
  const formData = new FormData();
  formData.append('cover', file);
  const res = await api.put(`/admin/albums/${albumId}/cover`, formData);
  return res.data.cover_url;
}
