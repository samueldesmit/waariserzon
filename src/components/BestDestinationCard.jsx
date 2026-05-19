import { useMemo } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { sunnyUntil } from '../lib/openMeteo';

export default function BestDestinationCard({ best, fromLocation, isNight, hoursAhead = 0 }) {
  const { t, lang } = useLanguage();
  const sunWindowLine = useMemo(() => {
    if (!best || !best.weather || !best.weather.isDay || !best.hourly) return null;
    const raw = best.hourly;
    const hours = raw.time.map((tStr, i) => ({
      time: new Date(tStr),
      cloudCover: raw.cloudCover[i],
      isDay: raw.isDay[i] === 1,
    }));
    // eslint-disable-next-line react-hooks/purity
    const momentMs = Date.now() + hoursAhead * 3600 * 1000;
    const sun = sunnyUntil(hours, momentMs);
    if (!sun) return null;
    const time = sun.until.toLocaleTimeString(lang === 'nl' ? 'nl-NL' : 'en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return t(sun.reason === 'sunset' ? 'sunnyUntilSunset' : 'sunnyUntilClouds', { time });
  }, [best, hoursAhead, lang, t]);

  if (!best || !best.weather) return null;

  const sunChance = best.weather.isDay
    ? Math.round(Math.max(0, Math.min(100, 100 - best.weather.cloudCover)))
    : 0;
  const isHere = best.distance === 0;
  // Only celebrate "you're in the sun" when the user's spot actually has decent
  // sun. Without this, an all-cloudy radius makes the user's own location win
  // by default and the badge wrongly congratulates them at 0% sun.
  const hereInSun = isHere && sunChance >= 50;
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
      <p className="kicker">{
        hereInSun
          ? t('youreInSunshineKicker')
          : isHere
            ? t('hereButCloudyKicker')
            : t('bestDestKicker')
      }</p>
      <div className="answer-title">
        <h1>{cityName}</h1>
        {best.distance > 0 && <span>{best.distance} km</span>}
      </div>
      <p className="answer-copy">
        {best.distance === 0
          ? t('answerCopyHere', { pct: sunChance, description: best.weather.description })
          : t('answerCopyAway', { pct: sunChance, distance: best.distance, description: best.weather.description.toLowerCase() })}
      </p>
      {sunWindowLine && <p className="answer-copy answer-sunwindow">{sunWindowLine}</p>}

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
