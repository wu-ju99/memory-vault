function FilterToolbar({
  title,
  children,
  onReset,
  showReset = false,
  resultCount,
}) {
  return (
    <section className="filter-toolbar" aria-label={title}>
      <div className="filter-toolbar-head">
        <div>
          <p className="filter-toolbar-title">{title}</p>
          {typeof resultCount === 'number' && (
            <span className="filter-toolbar-count">{resultCount} results</span>
          )}
        </div>
        {showReset && (
          <button className="filter-reset-btn" onClick={onReset} type="button">
            Clear filters
          </button>
        )}
      </div>
      <div className="filter-toolbar-body">{children}</div>
    </section>
  );
}

export default FilterToolbar;
