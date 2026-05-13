import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

function getParamName(prefix, key) {
  return `${prefix}${key}`;
}

export default function useUrlFilterState(defaults, options = {}) {
  const { prefix = '' } = options;
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => {
    const entries = Object.entries(defaults).map(([key, fallbackValue]) => {
      const paramName = getParamName(prefix, key);
      return [key, searchParams.get(paramName) ?? fallbackValue];
    });
    return Object.fromEntries(entries);
  }, [defaults, prefix, searchParams]);

  const setFilters = useCallback((updates) => {
    setSearchParams((previousParams) => {
      const nextParams = new URLSearchParams(previousParams);

      Object.entries(updates).forEach(([key, value]) => {
        const paramName = getParamName(prefix, key);
        if (value === undefined || value === null || value === '') {
          nextParams.delete(paramName);
          return;
        }
        nextParams.set(paramName, value);
      });

      return nextParams;
    }, { replace: true });
  }, [prefix, setSearchParams]);

  const setFilter = useCallback((key, value) => {
    setFilters({ [key]: value });
  }, [setFilters]);

  const resetFilters = useCallback(() => {
    setSearchParams((previousParams) => {
      const nextParams = new URLSearchParams(previousParams);
      Object.keys(defaults).forEach((key) => {
        nextParams.delete(getParamName(prefix, key));
      });
      return nextParams;
    }, { replace: true });
  }, [defaults, prefix, setSearchParams]);

  const hasActiveFilters = useMemo(
    () => Object.entries(filters).some(([key, value]) => value !== defaults[key]),
    [defaults, filters]
  );

  return {
    filters,
    setFilter,
    setFilters,
    resetFilters,
    hasActiveFilters,
  };
}
