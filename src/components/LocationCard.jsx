import { useLanguage } from '../i18n/LanguageContext';

export default function LocationCard({ place, isUser }) {
  const { t } = useLanguage();

  if (!place.weather) return null;

  const isSunny = place.weather.condition === 'sunny' || place.weather.condition === 'partly-cloudy';
  const isNight = !place.weather.isDay;

  return (
    <div className={`location-card ${isSunny ? 'sunny' : 'not-sunny'} ${isNight ? 'night' : ''} ${isUser ? 'is-user' : ''}`}>
      {isUser && <div className="you-badge">{t('youAreHere')}</div>}
      <div className="card-icon">{place.weather.icon}</div>
      <h3 className="card-direction">{place.label}</h3>
      <p className="card-description">{place.weather.description}</p>
      <div className="card-stats">
        <span className="stat">{Math.round(place.weather.temperature)}°C</span>
        <span className="stat">{t('clouds', { pct: place.weather.cloudCover })}</span>
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
