import { useLanguage } from '../i18n/LanguageContext';

export default function LocationCard({ place, isUser }) {
  const { t } = useLanguage();

  if (!place.weather) return null;

  const isSunny = place.weather.condition === 'sunny' || place.weather.condition === 'partly-cloudy';
  const isNight = !place.weather.isDay;
  const sunChance = Math.max(0, Math.min(100, 100 - place.weather.cloudCover));

  return (
    <div className={`location-card ${isSunny ? 'sunny' : 'not-sunny'} ${isNight ? 'night' : ''} ${isUser ? 'is-user' : ''}`}>
      {isUser && <div className="you-badge">{t('youAreHere')}</div>}
      <div className="card-icon" aria-hidden="true">{place.weather.icon}</div>
      <h3 className="card-direction">
        {place.cityName || place.label}
      </h3>
      {place.cityName && place.label !== place.cityName && (
        <p className="card-sublabel">{place.label}</p>
      )}
      <p className="card-description">{place.weather.description}</p>
      <div className="card-stats">
        <span className="stat">{Math.round(place.weather.temperature)}°C</span>
        <span className="stat stat-sun">{t('sunChance', { pct: sunChance })}</span>
      </div>
      <div className="card-meta">
        <span className="card-wind">{t('wind', { speed: place.weather.windSpeed })}</span>
        {!isUser && place.distance > 0 && (
          <span className="card-distance">~{place.distance} km</span>
        )}
      </div>
    </div>
  );
}
