import DialogShell from './DialogShell';

function ConfirmDialog({
  open,
  title,
  eyebrow,
  description,
  note,
  error,
  confirmLabel = '确认',
  cancelLabel = '取消',
  confirming = false,
  danger = false,
  onConfirm,
  onClose,
}) {
  const footer = (
    <>
      <button className="app-dialog-btn subtle" onClick={onClose} type="button" disabled={confirming}>
        {cancelLabel}
      </button>
      <button
        className={`app-dialog-btn ${danger ? 'danger' : 'primary'}`}
        onClick={onConfirm}
        type="button"
        disabled={confirming}
      >
        {confirming ? '处理中...' : confirmLabel}
      </button>
    </>
  );

  return (
    <DialogShell
      open={open}
      title={title}
      eyebrow={eyebrow}
      footer={footer}
      variant={danger ? 'danger' : 'default'}
      onClose={confirming ? undefined : onClose}
    >
      <p className="app-dialog-copy">{description}</p>
      {note && <p className="app-dialog-note">{note}</p>}
      {error && <p className="app-dialog-error">{error}</p>}
    </DialogShell>
  );
}

export default ConfirmDialog;
