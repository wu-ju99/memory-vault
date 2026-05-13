import { useEffect } from 'react';

function DialogShell({
  open,
  title,
  eyebrow,
  children,
  footer,
  variant = 'default',
  onClose,
}) {
  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose?.();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="app-dialog-layer" role="dialog" aria-modal="true" aria-label={title}>
      <button
        className="app-dialog-backdrop"
        onClick={onClose}
        type="button"
        aria-label="关闭弹窗"
      />
      <section className={`app-dialog-card ${variant === 'danger' ? 'danger' : ''}`}>
        <button className="app-dialog-close" onClick={onClose} type="button" aria-label="关闭">
          ×
        </button>
        <div className="app-dialog-head">
          {eyebrow && <p className="app-dialog-eyebrow">{eyebrow}</p>}
          <h2>{title}</h2>
        </div>
        <div className="app-dialog-body">{children}</div>
        {footer && <div className="app-dialog-footer">{footer}</div>}
      </section>
    </div>
  );
}

export default DialogShell;
