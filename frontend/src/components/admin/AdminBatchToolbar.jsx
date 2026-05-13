function AdminBatchToolbar({
  label,
  selectedCount,
  totalCount,
  allSelected = false,
  disabled = false,
  onToggleAll,
  onClear,
  onDelete,
}) {
  return (
    <div className="admin-batch-toolbar">
      <div className="admin-batch-meta">
        <label className="admin-batch-toggle">
          <input
            type="checkbox"
            checked={allSelected}
            disabled={disabled || totalCount === 0}
            onChange={(event) => onToggleAll?.(event.target.checked)}
          />
          <span>全选当前{label}</span>
        </label>
        <span className="admin-batch-count">已选 {selectedCount} / {totalCount}</span>
      </div>

      <div className="admin-batch-actions">
        <button type="button" onClick={onClear} disabled={disabled || selectedCount === 0}>
          清空选择
        </button>
        <button
          type="button"
          className="danger"
          onClick={onDelete}
          disabled={disabled || selectedCount === 0}
        >
          批量删除
        </button>
      </div>
    </div>
  );
}

export default AdminBatchToolbar;
