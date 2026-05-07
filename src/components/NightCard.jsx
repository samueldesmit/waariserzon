import { useLanguage } from '../i18n/LanguageContext';

function MoonIcon() {
  return (
    <svg className="night-moon" viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="44" fill="#fff4cf" stroke="#1f2018" strokeWidth="3" />
      <path
        d="M62 18a38 38 0 1 0 32 56 30 30 0 0 1-32-56Z"
        fill="#1f2018"
        opacity="0.85"
      />
      <circle cx="38" cy="40" r="3.5" fill="#1f2018" opacity="0.18" />
      <circle cx="58" cy="64" r="2.8" fill="#1f2018" opacity="0.18" />
      <circle cx="32" cy="62" r="2" fill="#1f2018" opacity="0.18" />
    </svg>
  );
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function NightCard({ cityName, weather, sunriseTime, hoursToSunrise, onSkipToSunrise }) {
  const { t } = useLanguage();
  if (!weather) return null;

  const sunriseLabel = sunriseTime ? formatTime(sunriseTime) : null;
  const totalMinutes = hoursToSunrise != null ? Math.max(0, Math.round(hoursToSunrise * 60)) : null;
  const h = totalMinutes != null ? Math.floor(totalMinutes / 60) : null;
  const m = totalMinutes != null ? totalMinutes % 60 : null;

  const handleShare = async () => {
    const text = sunriseLabel
      ? t('nightShareText', { city: cityName, time: sunriseLabel })
      : t('nightCopyShort', { city: cityName });
    const shareData = {
      title: t('title'),
      text,
      url: typeof window !== 'undefined' ? window.location.href : '',
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${text} ${shareData.url}`);
      }
    } catch {
      /* user cancelled */
    }
  };

  return (
    <section className="answer-card is-night night-card">
      <p className="kicker">{t('nightKicker')}</p>
      <div className="answer-title">
        <h1>{cityName}</h1>
        <MoonIcon />
      </div>
      <p className="answer-copy">
        {sunriseLabel
          ? t('nightCopy', { city: cityName, time: sunriseLabel, h, m })
          : t('nightCopyShort', { city: cityName })}
      </p>

      <div className="weather-strip" aria-label={t('weatherSummary')}>
        <div>
          <span>{t('temperature')}</span>
          <strong>{Math.round(weather.temperature)}°C</strong>
        </div>
        <div>
          <span>{t('sky')}</span>
          <strong>{weather.icon} {weather.description}</strong>
        </div>
        {sunriseLabel && (
          <div>
            <span>{t('sunriseLabel')}</span>
            <strong>🌅 {sunriseLabel}</strong>
          </div>
        )}
      </div>

      <div className="route-actions">
        {sunriseTime && hoursToSunrise > 0 && onSkipToSunrise && (
          <button type="button" onClick={() => onSkipToSunrise(hoursToSunrise)}>
            {t('planForSunrise')}
          </button>
        )}
        <button type="button" onClick={handleShare}>{t('shareAdvice')}</button>
      </div>
    </section>
  );
}
