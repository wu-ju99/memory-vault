import { useEffect, useState } from 'react';
import DialogShell from './DialogShell';

function InputDialog({
  open,
  title,
  eyebrow,
  description,
  value = '',
  placeholder = '',
  error,
  confirmLabel = '保存',
  cancelLabel = '取消',
  submitting = false,
  onSubmit,
  onClose,
}) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (open) {
      setDraft(value);
    }
  }, [open, value]);

  function handleSubmit() {
    onSubmit?.(draft);
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  }

  const footer = (
    <>
      <button className="app-dialog-btn subtle" onClick={onClose} type="button" disabled={submitting}>
        {cancelLabel}
      </button>
      <button className="app-dialog-btn primary" onClick={handleSubmit} type="button" disabled={submitting}>
        {submitting ? '保存中...' : confirmLabel}
      </button>
    </>
  );

  return (
    <DialogShell open={open} title={title} eyebrow={eyebrow} footer={footer} onClose={submitting ? undefined : onClose}>
      <p className="app-dialog-copy">{description}</p>
      <label className="app-dialog-field">
        <span>新名称</span>
        <input
          className="app-dialog-input"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus
        />
      </label>
      {error && <p className="app-dialog-error">{error}</p>}
    </DialogShell>
  );
}

export default InputDialog;
