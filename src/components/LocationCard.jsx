import { useLanguage } from '../i18n/LanguageContext';

export default function LocationCard({ place, isUser }) {
  const { t } = useLanguage();

  if (!place.weather) return null;

  const isSunny = place.weather.condition === 'sunny' || place.weather.condition === 'partly-cloudy';
  const isNight = !place.weather.isDay;
  const sunChance = Math.max(0, Math.min(100, 100 - place.weather.cloudCover));

  return (
    <div className={`location-card ${isSunny ? 'sunny' : 'not-sunny'} ${isNight ? 'night' : ''} ${isUser ? 'is-user' : ''}`}>
      <div className="card-icon" aria-hidden="true">{place.weather.icon}</div>
      <h3 className="card-direction">
        {isUser ? (place.cityName || t('youAreHere')) : (place.cityName || `${place.lat.toFixed(2)}°, ${place.lon.toFixed(2)}°`)}
      </h3>
      {isUser && <p className="card-sublabel">{t('youAreHere')}</p>}
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
