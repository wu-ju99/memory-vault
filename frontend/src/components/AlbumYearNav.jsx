function AlbumYearNav({
  years,
  totalCount,
  activeYear,
  allYearsValue,
  onSelectYear,
}) {
  if (years.length === 0) return null;

  return (
    <nav className="album-year-nav" aria-label="相册年份">
      <p className="album-year-nav-title">年份</p>
      <div className="album-year-list">
        <button
          className={`album-year-btn ${activeYear === allYearsValue ? 'active' : ''}`}
          onClick={() => onSelectYear(allYearsValue)}
          type="button"
        >
          <span>全部</span>
          <strong>{totalCount}</strong>
        </button>
        {years.map(({ year, count }) => (
          <button
            key={year}
            className={`album-year-btn ${activeYear === year ? 'active' : ''}`}
            onClick={() => onSelectYear(year)}
            type="button"
          >
            <span>{year}</span>
            <strong>{count}</strong>
          </button>
        ))}
      </div>
    </nav>
  );
}

export default AlbumYearNav;
