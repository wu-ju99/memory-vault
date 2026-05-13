function MediaBatchToolbar({
  selectedCount,
  totalCount,
  allSelected = false,
  disabled = false,
  batchDownloading = false,
  batchProgress = { completed: 0, total: 0 },
  onToggleAll,
  onClear,
  onDownload,
}) {
  const downloadLabel = batchDownloading
    ? `下载中 ${batchProgress.completed}/${batchProgress.total}`
    : '批量下载';

  return (
    <section className="media-batch-toolbar" aria-label="批量下载工具栏">
      <div className="media-batch-meta">
        <label className="media-batch-toggle">
          <input
            type="checkbox"
            checked={allSelected}
            disabled={disabled || totalCount === 0}
            onChange={(event) => onToggleAll?.(event.target.checked)}
          />
          <span>全选当前内容</span>
        </label>
        <span className="media-batch-count">已选 {selectedCount} / {totalCount}</span>
      </div>

      <div className="media-batch-actions">
        <button type="button" onClick={onClear} disabled={disabled || selectedCount === 0}>
          清空选择
        </button>
        <button type="button" onClick={onDownload} disabled={disabled || selectedCount === 0}>
          {downloadLabel}
        </button>
      </div>
    </section>
  );
}

export default MediaBatchToolbar;
