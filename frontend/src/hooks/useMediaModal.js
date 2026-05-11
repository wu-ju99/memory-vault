import { useEffect, useMemo, useState } from 'react';

export default function useMediaModal(mediaList) {
  const [activeMediaId, setActiveMediaId] = useState(null);

  const activeIndex = mediaList.findIndex((item) => item.id === activeMediaId);
  const activeMedia = activeIndex >= 0 ? mediaList[activeIndex] : null;

  function openMedia(media) {
    setActiveMediaId(media.id);
  }

  function closeMedia() {
    setActiveMediaId(null);
  }

  function goToMedia(offset) {
    if (activeIndex < 0 || mediaList.length === 0) return;
    const nextIndex = (activeIndex + offset + mediaList.length) % mediaList.length;
    setActiveMediaId(mediaList[nextIndex].id);
  }

  function clearIfActive(mediaId) {
    if (activeMediaId === mediaId) {
      setActiveMediaId(null);
    }
  }

  const controls = useMemo(() => ({
    close: closeMedia,
    previous: () => goToMedia(-1),
    next: () => goToMedia(1),
  }), [activeIndex, mediaList]);

  useEffect(() => {
    if (!activeMediaId) return undefined;

    function handleKey(e) {
      if (e.key === 'Escape') closeMedia();
      else if (e.key === 'ArrowLeft') goToMedia(-1);
      else if (e.key === 'ArrowRight') goToMedia(1);
    }

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  return {
    activeMedia,
    openMedia,
    closeMedia,
    previousMedia: controls.previous,
    nextMedia: controls.next,
    clearIfActive,
  };
}
