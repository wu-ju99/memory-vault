import { useMemo } from 'react';
import { getUserDisplayName, getUserGroupKey } from '../utils/userDisplay';

function getMediaTime(item) {
  const time = item.event_time || item.created_at;
  return time ? new Date(time).getTime() : 0;
}

function sortByLatestMedia(a, b) {
  return getMediaTime(b) - getMediaTime(a);
}

export default function useMediaUsers(mediaList) {
  return useMemo(() => {
    const groups = new Map();

    mediaList.forEach((item) => {
      const userKey = getUserGroupKey(item);
      if (!groups.has(userKey)) {
        groups.set(userKey, {
          userKey,
          userId: item.user_id,
          username: item.username,
          nickname: item.nickname,
          avatar: item.avatar,
          role: item.role,
          displayName: getUserDisplayName(item),
          items: [],
        });
      }
      groups.get(userKey).items.push(item);
    });

    let startIndex = 0;

    return Array.from(groups.values())
      .map((group) => ({
        ...group,
        items: [...group.items].sort(sortByLatestMedia),
      }))
      .sort((a, b) => {
        const latestA = getMediaTime(a.items[0]);
        const latestB = getMediaTime(b.items[0]);
        if (latestA !== latestB) return latestB - latestA;
        return a.displayName.localeCompare(b.displayName, 'zh-Hans-CN');
      })
      .map((group) => {
        const nextGroup = { ...group, startIndex };
        startIndex += group.items.length;
        return nextGroup;
      });
  }, [mediaList]);
}
