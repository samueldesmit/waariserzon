import { useEffect, useRef } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';

// Modal pull-up sheet. Backdrop tap dismisses; Escape dismisses; focus is
// trapped inside while open. `detent` controls height: 'large' = ~92vh
// (search), 'medium' = ~62vh (details/settings).
export default function Sheet({
  open,
  onClose,
  title,
  detent = 'large',
  children,
  rightAction,
  leftAction,
  contentClassName = '',
}) {
  const { t } = useLanguage();
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="m-sheet-root"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="m-sheet-backdrop" />
      <div className={`m-sheet m-sheet--${detent}`} ref={ref}>
        <div className="m-sheet-grab" aria-hidden="true" />
        <header className="m-sheet-header">
          <div className="m-sheet-header-side">
            {leftAction ?? (
              <button
                type="button"
                className="m-sheet-close"
                onClick={onClose}
                aria-label={t('close')}
              >
                ×
              </button>
            )}
          </div>
          {title && <h2 className="m-sheet-title">{title}</h2>}
          <div className="m-sheet-header-side m-sheet-header-side--right">
            {rightAction}
          </div>
        </header>
        <div className={`m-sheet-content ${contentClassName}`}>{children}</div>
      </div>
    </div>
  );
}
