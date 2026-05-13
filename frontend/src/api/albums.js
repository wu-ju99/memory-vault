import api from './axios';

function cleanParams(filters = {}) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && value !== '')
  );
}

export async function fetchAlbums(filters = {}) {
  const res = await api.get('/albums', { params: cleanParams(filters) });
  return res.data.albums;
}

export async function fetchAlbum(albumId) {
  const res = await api.get(`/albums/${albumId}`);
  return res.data.album;
}

export async function createAlbum(title, albumYear) {
  const res = await api.post('/albums', { title, album_year: albumYear });
  return res.data;
}

export async function renameAlbum(albumId, title) {
  const res = await api.put(`/albums/${albumId}`, { title });
  return res.data.album;
}

export async function deleteAlbum(albumId) {
  await api.delete(`/albums/${albumId}`);
}

export async function uploadAlbumCover(albumId, file) {
  const formData = new FormData();
  formData.append('cover', file);
  const res = await api.put(`/albums/${albumId}/cover`, formData);
  return res.data.cover_url;
}

export async function setAlbumCover(albumId, coverUrl) {
  const res = await api.put(`/albums/${albumId}/cover`, { cover_url: coverUrl });
  return res.data.cover_url;
}
