import { useEffect, useRef, useState } from 'react';

function SearchBar({
  value = '',
  onSearch,
  placeholder = '搜索...',
  ariaLabel = '搜索',
}) {
  const [keyword, setKeyword] = useState(value);
  const onSearchRef = useRef(onSearch);
  const timerRef = useRef(null);

  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  useEffect(() => {
    setKeyword(value);
  }, [value]);

  useEffect(() => () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  function queueSearch(nextValue) {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      onSearchRef.current(nextValue);
    }, 300);
  }

  function handleChange(event) {
    const nextValue = event.target.value;
    setKeyword(nextValue);
    queueSearch(nextValue);
  }

  function fire() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    onSearchRef.current(keyword);
  }

  function handleClear() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setKeyword('');
    onSearchRef.current('');
  }

  return (
    <div className="search-bar">
      <input
        className="search-input"
        type="text"
        value={keyword}
        placeholder={placeholder}
        aria-label={ariaLabel}
        onChange={handleChange}
        onKeyDown={(event) => event.key === 'Enter' && fire()}
      />
      <button className="search-btn" onClick={fire} type="button">搜索</button>
      {keyword && <button className="search-clear" onClick={handleClear} type="button">清空</button>}
    </div>
  );
}

export default SearchBar;
