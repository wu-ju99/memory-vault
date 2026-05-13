export const UNKNOWN_YEAR = '未知年份';

export function getAlbumYearValue(album) {
  if (album?.album_year) return album.album_year.toString();
  if (!album?.created_at) return UNKNOWN_YEAR;
  const year = new Date(album.created_at).getFullYear();
  return Number.isNaN(year) ? UNKNOWN_YEAR : year.toString();
}

export function getMediaYearValue(item) {
  const sourceTime = item?.event_time || item?.created_at;
  if (!sourceTime) return UNKNOWN_YEAR;
  const year = new Date(sourceTime).getFullYear();
  return Number.isNaN(year) ? UNKNOWN_YEAR : year.toString();
}

export function sortYearValues(a, b) {
  if (a === UNKNOWN_YEAR) return 1;
  if (b === UNKNOWN_YEAR) return -1;
  return Number(b) - Number(a);
}
