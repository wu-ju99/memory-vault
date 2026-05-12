import { useEffect, useMemo, useState } from 'react';
import { getUserDisplayName, getUserGroupKey } from '../utils/userDisplay';

const ALL_USERS = 'all';

function getAlbumTime(album) {
  if (album.created_at) return new Date(album.created_at).getTime();
  if (album.album_year) return new Date(`${album.album_year}-01-01`).getTime();
  return 0;
}

function sortByLatestAlbum(a, b) {
  return getAlbumTime(b) - getAlbumTime(a);
}

function getUserSectionId(userKey) {
  return `album-user-${userKey}`;
}

export default function useAlbumUsers(albums, rootElementId = 'album-user-root') {
  const [activeUser, setActiveUser] = useState(ALL_USERS);

  const userGroups = useMemo(() => {
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

  const users = useMemo(
    () => userGroups.map(({ userKey, displayName, items, role }) => ({
      userKey,
      displayName,
      count: items.length,
      role,
    })),
    [userGroups]
  );

  function scrollToUser(userKey) {
    setActiveUser(userKey);

    const targetId = userKey === ALL_USERS ? rootElementId : getUserSectionId(userKey);
    const target = document.getElementById(targetId);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  useEffect(() => {
    if (userGroups.length === 0) {
      setActiveUser(ALL_USERS);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.dataset.userKey) {
          setActiveUser(visible.target.dataset.userKey);
        }
      },
      {
        rootMargin: '-22% 0px -58% 0px',
        threshold: [0.08, 0.2, 0.45],
      }
    );

    userGroups.forEach(({ userKey }) => {
      const section = document.getElementById(getUserSectionId(userKey));
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, [userGroups]);

  return {
    allUsersValue: ALL_USERS,
    activeUser,
    users,
    userGroups,
    getUserSectionId,
    scrollToUser,
  };
}
