import LocationCard from './LocationCard';
import WeatherMap from './WeatherMap';
import NearestSunshine from './NearestSunshine';

export default function SunMap({ places, refreshing, leftPanel, rightPanel, radiusKm, pinnedLocation, onPinLocation }) {
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
      {/* Map with controls on left and right — at the very top */}
      <section className="map-with-controls">
        <div className="map-side-panel map-left-panel">
          {leftPanel}
        </div>
        <div className="map-center">
          <WeatherMap places={places} radiusKm={radiusKm} pinnedLocation={pinnedLocation} onPinLocation={onPinLocation} />
          {refreshing && (
            <div className="map-refreshing-overlay">
              <div className="refreshing-spinner" />
              <span>Updating...</span>
            </div>
          )}
        </div>
        <div className="map-side-panel map-right-panel">
          {rightPanel}
        </div>
      </section>

      {/* Nearest sunshine banner */}
      <NearestSunshine places={places} />

      {/* Sunny places (daytime) */}
      {sunnyPlaces.length > 0 && (
        <section className="section sunny-section">
          <h2>
            <span className="section-icon">☀️</span> Sunshine Nearby
          </h2>
          <p className="section-subtitle">
            Head {sunnyPlaces.length === 1 ? 'this way' : 'to one of these directions'} for sun!
          </p>
          <div className="card-grid">
            {sunnyPlaces.map((p) => (
              <LocationCard key={p.short} place={p} />
            ))}
          </div>
        </section>
      )}

      {/* Clear night spots */}
      {isNighttime && clearNightPlaces.length > 0 && sunnyPlaces.length === 0 && (
        <section className="section night-section">
          <h2>
            <span className="section-icon">🌙</span> Clear Skies Tonight
          </h2>
          <p className="section-subtitle">
            These spots have clear night skies right now.
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
          {isNighttime
            ? 'The sun has set. Try looking ahead in time to find tomorrow\'s sunshine!'
            : 'No sunshine found nearby. Try increasing the radius or looking ahead in time!'}
        </p>
      )}
    </div>
  );
}
