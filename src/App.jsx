import { useState, useEffect } from 'react';
import { useGeolocation } from './hooks/useGeolocation';
import { useNearbyWeather } from './hooks/useNearbyWeather';
import SunMap from './components/SunMap';
import LocationCard from './components/LocationCard';
import './App.css';

const RADIUS_OPTIONS = [30, 60, 100, 200, 300, 500];

function formatTimeLabel(hours) {
  if (hours === 0) return 'Now';
  const target = new Date(Date.now() + hours * 3600 * 1000);
  const day = target.toLocaleDateString(undefined, { weekday: 'short' });
  const time = target.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  if (hours <= 12) return `+${hours}h (${time})`;
  return `${day} ${time}`;
}

function App() {
  const [radiusKm, setRadiusKm] = useState(60);
  const [hoursAhead, setHoursAhead] = useState(0);
  const [pinnedLocation, setPinnedLocation] = useState(null);
  const { location, error: geoError, loading: geoLoading } = useGeolocation();
  const { places, loading: weatherLoading, refreshing, error: weatherError } = useNearbyWeather(pinnedLocation ?? location, radiusKm, hoursAhead);

  // Reverse geocode pinned location to get a city name
  useEffect(() => {
    if (!pinnedLocation || pinnedLocation.name) return;
    let cancelled = false;
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pinnedLocation.lat}&lon=${pinnedLocation.lon}&format=json&zoom=10`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const addr = data.address || {};
        const name = addr.city || addr.town || addr.village || addr.municipality || addr.county || data.name || null;
        if (name) {
          setPinnedLocation((prev) => prev && prev.lat === pinnedLocation.lat && prev.lon === pinnedLocation.lon ? { ...prev, name } : prev);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [pinnedLocation]);

  const loading = geoLoading || weatherLoading;
  const error = geoError || weatherError;

  const userPlace = places.find((p) => p.short === 'Here');
  const isNight = userPlace && !userPlace.weather?.isDay;

  const timeControl = (
    <div className="control-card vertical-control">
      <label className="control-label">
        When: <strong>{formatTimeLabel(hoursAhead)}</strong>
      </label>
      <div className="vertical-slider-row">
        <span className="slider-edge">3d</span>
        <input
          id="time-slider"
          type="range"
          min={0}
          max={72}
          step={1}
          value={hoursAhead}
          onChange={(e) => setHoursAhead(Number(e.target.value))}
          className="app-slider vertical-slider time-slider"
        />
        <span className="slider-edge">Now</span>
      </div>
      <div className="presets vertical-presets">
        {[0, 3, 6, 12, 24, 48, 72].map((h) => (
          <button
            key={h}
            className={`preset ${h === hoursAhead ? 'active' : ''}`}
            onClick={() => setHoursAhead(h)}
          >
            {h === 0 ? 'Now' : h < 24 ? `+${h}h` : `+${h / 24}d`}
          </button>
        ))}
      </div>
    </div>
  );

  const radiusControl = (
    <div className="control-card vertical-control">
      <label className="control-label">
        Radius: <strong>{radiusKm} km</strong>
      </label>
      <div className="vertical-slider-row">
        <span className="slider-edge">500</span>
        <input
          id="radius-slider"
          type="range"
          min={10}
          max={500}
          step={10}
          value={radiusKm}
          onChange={(e) => setRadiusKm(Number(e.target.value))}
          className="app-slider vertical-slider radius-slider"
        />
        <span className="slider-edge">10</span>
      </div>
      <div className="presets vertical-presets">
        {RADIUS_OPTIONS.map((r) => (
          <button
            key={r}
            className={`preset ${r === radiusKm ? 'active' : ''}`}
            onClick={() => setRadiusKm(r)}
          >
            {r}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="app">
      <header className="app-header">
        {isNight ? (
          <div className="moon-logo">
            <div className="moon-circle" />
            <div className="moon-stars" />
          </div>
        ) : (
          <div className="sun-logo">
            <div className="sun-circle" />
            <div className="sun-rays" />
          </div>
        )}
        <h1>{isNight ? 'Follow the Moon' : 'Follow the Sun'}</h1>
        <p className="tagline">{isNight ? 'The sun will return — find when & where' : 'Find the sunshine near you'}</p>
      </header>

      <main className="app-main">
        {loading && (
          <div className="loading">
            <div className="loading-sun" />
            <p>Finding the sunshine...</p>
          </div>
        )}

        {error && (
          <div className="error">
            <p>Oops! {error}</p>
            <p className="error-hint">
              Make sure location access is enabled in your browser.
            </p>
          </div>
        )}

        {!loading && !error && places.length > 0 && (
          <>
            <SunMap
              places={places}
              refreshing={refreshing}
              leftPanel={timeControl}
              rightPanel={radiusControl}
              radiusKm={radiusKm}
              pinnedLocation={pinnedLocation}
              onPinLocation={setPinnedLocation}
            />

            {/* Your location card */}
            {userPlace && (
              <div className="user-location-bar">
                <LocationCard place={userPlace} isUser />
              </div>
            )}
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>
          Weather data from <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a> — scanning up to ~{radiusKm} km around {pinnedLocation ? (pinnedLocation.name || 'pinned location') : 'you'}
        </p>
      </footer>
    </div>
  );
}

export default App;
