import { useLanguage } from '../i18n/LanguageContext';

export default function BestDestinationCard({ best, fromLocation, isNight }) {
  const { t } = useLanguage();

  if (!best || !best.weather) return null;

  const sunChance = best.weather.isDay
    ? Math.round(Math.max(0, Math.min(100, 100 - best.weather.cloudCover)))
    : 0;
  const cityName = best.cityName || `${best.lat.toFixed(2)}°, ${best.lon.toFixed(2)}°`;

  const directionsUrl = fromLocation
    ? `https://www.google.com/maps/dir/?api=1&origin=${fromLocation.lat},${fromLocation.lon}&destination=${best.lat},${best.lon}`
    : `https://www.google.com/maps/search/?api=1&query=${best.lat},${best.lon}`;

  const handleShare = async () => {
    const text = t('shareText', { city: cityName, pct: sunChance, distance: best.distance });
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
    <section className={`answer-card ${isNight ? 'is-night' : ''}`}>
      <p className="kicker">{best.distance === 0 ? t('youreInSunshineKicker') : t('bestDestKicker')}</p>
      <div className="answer-title">
        <h1>{cityName}</h1>
        {best.distance > 0 && <span>{best.distance} km</span>}
      </div>
      <p className="answer-copy">
        {best.distance === 0
          ? t('answerCopyHere', { pct: sunChance, description: best.weather.description })
          : t('answerCopyAway', { pct: sunChance, distance: best.distance, description: best.weather.description.toLowerCase() })}
      </p>

      <div className="weather-strip" aria-label={t('weatherSummary')}>
        <div>
          <span>{t('sunScore')}</span>
          <strong>{sunChance}</strong>
        </div>
        <div>
          <span>{t('temperature')}</span>
          <strong>{Math.round(best.weather.temperature)}°C</strong>
        </div>
        <div>
          <span>{t('sky')}</span>
          <strong>{best.weather.icon} {best.weather.description}</strong>
        </div>
      </div>

      <div className="route-actions">
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'none' }}
        >
          <button type="button">{best.distance === 0 ? t('openInMaps') : t('startRoute')}</button>
        </a>
        <button type="button" onClick={handleShare}>{t('shareAdvice')}</button>
      </div>
    </section>
  );
}
