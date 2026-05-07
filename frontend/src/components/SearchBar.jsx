/**
 * SearchBar — 搜索栏组件（预留）
 * 内部管理 keyword state，deounce 300ms，Enter / 搜索 / 清除
 * Props: onSearch(keyword), placeholder
 */

import { useState, useRef, useEffect } from 'react';

function SearchBar({ onSearch, placeholder = '搜索...' }) {
  const [keyword, setKeyword] = useState('');
  const onSearchRef = useRef(onSearch);
  const timerRef = useRef(null);

  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  function handleChange(e) {
    const value = e.target.value;
    setKeyword(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      onSearchRef.current(value);
    }, 300);
  }

  function fire() {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    onSearchRef.current(keyword);
  }

  function handleClear() {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
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
        onChange={handleChange}
        onKeyDown={(e) => e.key === 'Enter' && fire()}
      />
      <button className="search-btn" onClick={fire}>搜索</button>
      {keyword && <button className="search-clear" onClick={handleClear}>清除</button>}
    </div>
  );
}

export default SearchBar;
