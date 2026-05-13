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
        <div className="filter-toolbar-meta">
          <div className="filter-toolbar-text">
            <p className="filter-toolbar-title">{title}</p>
            {typeof resultCount === 'number' && (
              <span className="filter-toolbar-count">共 {resultCount} 项</span>
            )}
          </div>
        </div>
        {showReset && (
          <button className="filter-reset-btn" onClick={onReset} type="button">
            清空筛选
          </button>
        )}
      </div>
      <div className="filter-toolbar-body">{children}</div>
    </section>
  );
}

export default FilterToolbar;
