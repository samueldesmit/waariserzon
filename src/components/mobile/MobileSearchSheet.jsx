import { useEffect, useRef } from 'react';
import Sheet from './Sheet';
import { SearchIcon, PinIcon, LocateIcon } from './icons';
import { useLanguage } from '../../i18n/LanguageContext';

export default function MobileSearchSheet({
  open,
  onClose,
  query,
  onQueryChange,
  results,
  searching,
  onPick,
  onLocate,
  // True once the user has typed in this session. The parent owns this so
  // the field can open pre-filled with the active city without that stale
  // value immediately looking like a failed search.
  dirty,
}) {
  const { t } = useLanguage();
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      // Focus the field + select existing text on open so typing replaces.
      const id = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select?.();
      }, 60);
      return () => clearTimeout(id);
    }
  }, [open]);

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={t('searchLabel')}
      detent="large"
      rightAction={
        <button
          type="button"
          className="m-sheet-action m-sheet-action--icon"
          onClick={() => {
            onLocate();
            onClose();
          }}
          aria-label={t('useCurrentLocation')}
        >
          <LocateIcon />
        </button>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (results.length > 0) {
            onPick(results[0]);
          }
        }}
      >
        <label htmlFor="m-search-input" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
          {t('searchLabel')}
        </label>
        <div className="m-search-field">
          <SearchIcon />
          <input
            ref={inputRef}
            id="m-search-input"
            type="search"
            inputMode="search"
            autoComplete="off"
            placeholder={t('searchPlaceholder')}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
          />
          {query && (
            <button
              type="button"
              className="m-search-clear"
              onClick={() => onQueryChange('')}
              aria-label={t('clear')}
            >
              ×
            </button>
          )}
        </div>
      </form>

      {dirty && searching && results.length === 0 && (
        <p className="m-search-hint">{t('searchSearching')}</p>
      )}

      {dirty && !searching && query.trim().length >= 2 && results.length === 0 && (
        <p className="m-search-hint">{t('searchNoResults')}</p>
      )}

      {results.length > 0 && (
        <div className="m-search-results">
          {results.map((s) => (
            <button
              key={s.id}
              type="button"
              className="m-search-row"
              onClick={() => onPick(s)}
            >
              <PinIcon />
              <span>
                <strong>{s.cityName || s.name}</strong>
                {s.label && s.label !== (s.cityName || s.name) && (
                  <small>{s.label}</small>
                )}
              </span>
            </button>
          ))}
        </div>
      )}
    </Sheet>
  );
}
