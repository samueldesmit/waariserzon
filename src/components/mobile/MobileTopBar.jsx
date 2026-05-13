import { SearchIcon, LocateIcon, SlidersIcon } from './icons';
import { useLanguage } from '../../i18n/LanguageContext';

export default function MobileTopBar({ label, onSearch, onLocate, onSettings }) {
  const { t } = useLanguage();
  const isPlaceholder = !label;
  return (
    <div className="m-topbar" role="toolbar">
      <button
        type="button"
        className={`m-search-pill ${isPlaceholder ? 'm-search-pill--placeholder' : ''}`}
        onClick={onSearch}
        aria-label={t('searchLabel')}
      >
        <SearchIcon />
        <span>{label || t('searchPlaceholder')}</span>
      </button>
      <button
        type="button"
        className="m-icon-btn"
        onClick={onLocate}
        aria-label={t('useCurrentLocation')}
      >
        <LocateIcon />
      </button>
      <button
        type="button"
        className="m-icon-btn"
        onClick={onSettings}
        aria-label={t('settings')}
      >
        <SlidersIcon />
      </button>
    </div>
  );
}
