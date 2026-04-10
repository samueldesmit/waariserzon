import LocationCard from './LocationCard';
import WeatherMap from './WeatherMap';
import NearestSunshine from './NearestSunshine';
import { useLanguage } from '../i18n/LanguageContext';

export default function SunMap({ places, refreshing, leftPanel, rightPanel, radiusKm, pinnedLocation, onPinLocation }) {
  const { t } = useLanguage();
  const nearby = places.filter((p) => p.short !== 'Here');
  const userPlace = places.find((p) => p.short === 'Here');
  const isNighttime = userPlace && !userPlace.weather?.isDay;

  const sunnyPlaces = nearby
    .filter((p) => p.weather?.condition === 'sunny' || p.weather?.condition === 'partly-cloudy')
    .sort((a, b) => a.distance - b.distance);

  const clearNightPlaces = nearby
    .filter((p) => p.weather?.condition === 'clear-night' || p.weather?.condition === 'partly-cloudy-night')
    .sort((a, b) => a.distance - b.distance);

  return (
    <div className={`sun-map ${isNighttime ? 'nighttime' : ''}`}>
      <section className="map-with-controls">
        <div className="map-side-panel map-left-panel">
          {leftPanel}
        </div>
        <div className="map-center">
          <WeatherMap places={places} radiusKm={radiusKm} pinnedLocation={pinnedLocation} onPinLocation={onPinLocation} />
          {refreshing && (
            <div className="map-refreshing-overlay">
              <div className="refreshing-spinner" />
              <span>{t('updating')}</span>
            </div>
          )}
        </div>
        <div className="map-side-panel map-right-panel">
          {rightPanel}
        </div>
      </section>

      <NearestSunshine places={places} />

      {sunnyPlaces.length > 0 && (
        <section className="section sunny-section">
          <h2>
            <span className="section-icon">☀️</span> {t('sunshineNearby')}
          </h2>
          <p className="section-subtitle">
            {sunnyPlaces.length === 1 ? t('headThisWay') : t('headToOne')}
          </p>
          <div className="card-grid">
            {sunnyPlaces.map((p) => (
              <LocationCard key={p.short} place={p} />
            ))}
          </div>
        </section>
      )}

      {isNighttime && clearNightPlaces.length > 0 && sunnyPlaces.length === 0 && (
        <section className="section night-section">
          <h2>
            <span className="section-icon">🌙</span> {t('clearSkiesTonight')}
          </h2>
          <p className="section-subtitle">
            {t('clearSpotsSubtitle')}
          </p>
          <div className="card-grid">
            {clearNightPlaces.map((p) => (
              <LocationCard key={p.short} place={p} />
            ))}
          </div>
        </section>
      )}

      {sunnyPlaces.length === 0 && (!isNighttime || clearNightPlaces.length === 0) && (
        <p className="no-data">
          {isNighttime ? t('noSunNight') : t('noSunDay')}
        </p>
      )}
    </div>
  );
}
