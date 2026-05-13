import { useMemo } from 'react';
import { getUserDisplayName, getUserGroupKey } from '../utils/userDisplay';

export default function useYearUserNav(yearGroups, activeYear, allYearsValue) {
  return useMemo(() => {
    const sourceGroups = activeYear === allYearsValue
      ? yearGroups
      : yearGroups.filter((group) => group.year === activeYear);

    const users = new Map();

    sourceGroups.forEach((yearGroup) => {
      yearGroup.items.forEach((item) => {
        const userKey = getUserGroupKey(item);
        if (!users.has(userKey)) {
          users.set(userKey, {
            userKey,
            displayName: getUserDisplayName(item),
            role: item.role,
            count: 0,
            year: yearGroup.year,
          });
        }
        users.get(userKey).count += 1;
      });
    });

    return Array.from(users.values()).sort((a, b) =>
      a.displayName.localeCompare(b.displayName, 'zh-Hans-CN')
    );
  }, [activeYear, allYearsValue, yearGroups]);
}
