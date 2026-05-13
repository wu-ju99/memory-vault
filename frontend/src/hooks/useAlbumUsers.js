import { useMemo } from 'react';
import { getUserDisplayName, getUserGroupKey } from '../utils/userDisplay';

function getAlbumTime(album) {
  if (album.created_at) return new Date(album.created_at).getTime();
  if (album.album_year) return new Date(`${album.album_year}-01-01`).getTime();
  return 0;
}

function sortByLatestAlbum(a, b) {
  return getAlbumTime(b) - getAlbumTime(a);
}

export default function useAlbumUsers(albums) {
  return useMemo(() => {
    const groups = new Map();

    albums.forEach((album) => {
      const userKey = getUserGroupKey(album);
      if (!groups.has(userKey)) {
        groups.set(userKey, {
          userKey,
          userId: album.user_id,
          username: album.username,
          nickname: album.nickname,
          role: album.role,
          displayName: getUserDisplayName(album),
          items: [],
        });
      }
      groups.get(userKey).items.push(album);
    });

    let startIndex = 0;

    return Array.from(groups.values())
      .map((group) => ({
        ...group,
        items: [...group.items].sort(sortByLatestAlbum),
      }))
      .sort((a, b) => {
        const latestA = getAlbumTime(a.items[0]);
        const latestB = getAlbumTime(b.items[0]);
        if (latestA !== latestB) return latestB - latestA;
        return a.displayName.localeCompare(b.displayName, 'zh-Hans-CN');
      })
      .map((group) => {
        const nextGroup = { ...group, startIndex };
        startIndex += group.items.length;
        return nextGroup;
      });
  }, [albums]);
}
