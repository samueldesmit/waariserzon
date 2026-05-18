import Sheet from './Sheet';
import { useLanguage } from '../../i18n/LanguageContext';

export default function MobileSettingsSheet({ open, onClose, lang, setLang }) {
  const { t } = useLanguage();

  const langs = [
    { code: 'nl', label: 'Nederlands' },
    { code: 'en', label: 'English' },
  ];

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={t('settings')}
      detent="medium"
      rightAction={
        <button type="button" className="m-sheet-action" onClick={onClose}>{t('done')}</button>
      }
    >
      <div className="m-settings-group">
        <h3>{t('languageLabel')}</h3>
        <div className="m-settings-card">
          {langs.map((l) => (
            <button
              key={l.code}
              type="button"
              className="m-settings-row"
              onClick={() => setLang(l.code)}
              aria-pressed={lang === l.code}
            >
              <span>{l.label}</span>
              <span className="m-check">{lang === l.code ? '✓' : ''}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="m-settings-group">
        <h3>{t('aboutLink')}</h3>
        <div className="m-settings-card">
          <a
            className="m-settings-row"
            href="https://open-meteo.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>Open-Meteo</span>
            <span aria-hidden="true">↗</span>
          </a>
          <a className="m-settings-row" href="/about">
            <span>{t('aboutLink')}</span>
            <span aria-hidden="true">↗</span>
          </a>
          <a className="m-settings-row" href="/contact">
            <span>{t('contactLink')}</span>
            <span aria-hidden="true">↗</span>
          </a>
          <a className="m-settings-row" href="/privacy">
            <span>{t('privacyLink')}</span>
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>

      <p className="m-settings-footer">{t('footerData')} Open-Meteo</p>
    </Sheet>
  );
}
