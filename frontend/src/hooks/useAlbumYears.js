import { useEffect, useMemo, useState } from 'react';

const ALL_YEARS = 'all';
const UNKNOWN_YEAR = '未知年份';

function getAlbumYear(album) {
  if (album.album_year) return album.album_year.toString();
  if (!album.created_at) return UNKNOWN_YEAR;
  const year = new Date(album.created_at).getFullYear();
  return Number.isNaN(year) ? UNKNOWN_YEAR : year.toString();
}

function sortYears(a, b) {
  if (a === UNKNOWN_YEAR) return 1;
  if (b === UNKNOWN_YEAR) return -1;
  return Number(b) - Number(a);
}

function getYearSectionId(year) {
  return `album-year-${year}`;
}

export default function useAlbumYears(albums, rootElementId = 'album-year-root') {
  const [activeYear, setActiveYear] = useState(ALL_YEARS);

  const yearGroups = useMemo(() => {
    const groups = new Map();

    albums.forEach((album) => {
      const year = getAlbumYear(album);
      if (!groups.has(year)) groups.set(year, []);
      groups.get(year).push(album);
    });

    let startIndex = 0;

    return Array.from(groups.entries())
      .sort(([yearA], [yearB]) => sortYears(yearA, yearB))
      .map(([year, items]) => {
        const group = { year, items, startIndex };
        startIndex += items.length;
        return group;
      });
  }, [albums]);

  const years = useMemo(
    () => yearGroups.map(({ year, items }) => ({ year, count: items.length })),
    [yearGroups]
  );

  function scrollToYear(year) {
    setActiveYear(year);

    const targetId = year === ALL_YEARS ? rootElementId : getYearSectionId(year);
    const target = document.getElementById(targetId);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  useEffect(() => {
    if (yearGroups.length === 0) {
      setActiveYear(ALL_YEARS);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.dataset.year) {
          setActiveYear(visible.target.dataset.year);
        }
      },
      {
        rootMargin: '-22% 0px -58% 0px',
        threshold: [0.08, 0.2, 0.45],
      }
    );

    yearGroups.forEach(({ year }) => {
      const section = document.getElementById(getYearSectionId(year));
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, [yearGroups]);

  return {
    allYearsValue: ALL_YEARS,
    activeYear,
    years,
    yearGroups,
    getYearSectionId,
    scrollToYear,
  };
}
