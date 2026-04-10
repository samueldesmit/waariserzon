import { useState, useEffect } from 'react';
import { useGeolocation } from './hooks/useGeolocation';
import { useNearbyWeather } from './hooks/useNearbyWeather';
import SunMap from './components/SunMap';
import LocationCard from './components/LocationCard';
import { useLanguage } from './i18n/LanguageContext';
import './App.css';

const RADIUS_OPTIONS = [30, 60, 100, 200, 300, 500];

function formatTimeLabel(hours, t) {
  if (hours === 0) return t('now');
  const target = new Date(Date.now() + hours * 3600 * 1000);
  const day = target.toLocaleDateString(undefined, { weekday: 'short' });
  const time = target.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  if (hours <= 12) return `+${hours}h (${time})`;
  return `${day} ${time}`;
}

function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();
  return (
    <nav className="lang-switcher" aria-label="Language">
      <button
        className={`lang-btn ${lang === 'nl' ? 'active' : ''}`}
        onClick={() => setLang('nl')}
        aria-label="Nederlands"
      >
        NL
      </button>
      <button
        className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
        onClick={() => setLang('en')}
        aria-label="English"
      >
        EN
      </button>
    </nav>
  );
}

function App() {
  const { t, lang } = useLanguage();
  const [radiusKm, setRadiusKm] = useState(60);
  const [hoursAhead, setHoursAhead] = useState(0);
  const [pinnedLocation, setPinnedLocation] = useState(null);
  const { location, error: geoError, loading: geoLoading, requested, requestLocation } = useGeolocation();
  const { places, loading: weatherLoading, refreshing, error: weatherError } = useNearbyWeather(pinnedLocation ?? location, radiusKm, hoursAhead, lang);

  // Keep html lang attribute in sync with selected language
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);


  const active = requested || !!pinnedLocation;
  const loading = active && (geoLoading || weatherLoading);
  const error = geoError || weatherError;

  const userPlace = places.find((p) => p.short === 'Here');
  const isNight = userPlace && !userPlace.weather?.isDay;

  const timeLabel = formatTimeLabel(hoursAhead, t);
  const timeControl = (
    <div className="control-card vertical-control">
      <label htmlFor="time-slider" className="control-label">
        {t('when')} <strong>{timeLabel}</strong>
      </label>
      <div className="vertical-slider-row">
        <span className="slider-edge" aria-hidden="true">3d</span>
        <input
          id="time-slider"
          type="range"
          min={0}
          max={72}
          step={1}
          value={hoursAhead}
          onChange={(e) => setHoursAhead(Number(e.target.value))}
          className="app-slider vertical-slider time-slider"
          aria-valuetext={timeLabel}
        />
        <span className="slider-edge" aria-hidden="true">{t('now')}</span>
      </div>
      <div className="presets vertical-presets" role="group" aria-label={t('when')}>
        {[0, 3, 6, 12, 24, 48, 72].map((h) => (
          <button
            key={h}
            className={`preset ${h === hoursAhead ? 'active' : ''}`}
            onClick={() => setHoursAhead(h)}
            aria-pressed={h === hoursAhead}
          >
            {h === 0 ? t('now') : h < 24 ? `+${h}h` : `+${h / 24}d`}
          </button>
        ))}
      </div>
    </div>
  );

  const radiusLabel = `${radiusKm} km`;
  const radiusControl = (
    <div className="control-card vertical-control">
      <label htmlFor="radius-slider" className="control-label">
        {t('radius')} <strong>{radiusLabel}</strong>
      </label>
      <div className="vertical-slider-row">
        <span className="slider-edge" aria-hidden="true">500</span>
        <input
          id="radius-slider"
          type="range"
          min={10}
          max={500}
          step={10}
          value={radiusKm}
          onChange={(e) => setRadiusKm(Number(e.target.value))}
          className="app-slider vertical-slider radius-slider"
          aria-valuetext={radiusLabel}
        />
        <span className="slider-edge" aria-hidden="true">10</span>
      </div>
      <div className="presets vertical-presets" role="group" aria-label={t('radius')}>
        {RADIUS_OPTIONS.map((r) => (
          <button
            key={r}
            className={`preset ${r === radiusKm ? 'active' : ''}`}
            onClick={() => setRadiusKm(r)}
            aria-pressed={r === radiusKm}
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
        <LanguageSwitcher />
        {isNight ? (
          <div className="moon-logo" aria-hidden="true">
            <div className="moon-circle" />
            <div className="moon-stars" />
          </div>
        ) : (
          <div className="sun-logo" aria-hidden="true">
            <div className="sun-circle" />
            <div className="sun-rays" />
          </div>
        )}
        <h1>{isNight ? t('titleNight') : t('title')}</h1>
        <p className="tagline">{isNight ? t('taglineNight') : t('tagline')}</p>
      </header>

      <main className="app-main">
        {!active && (
          <div className="welcome-cta">
            <p className="welcome-text">{t('welcomeMessage')}</p>
            <button className="locate-btn" onClick={requestLocation}>
              <span aria-hidden="true">📍</span> {t('findSunshine')}
            </button>
          </div>
        )}

        {active && loading && (
          <div className="loading" aria-live="polite">
            <div className="loading-sun" aria-hidden="true" />
            <p>{t('loading')}</p>
          </div>
        )}

        {active && error && (
          <div className="error" role="alert">
            {error === 'PERMISSION_DENIED' ? (
              <>
                <p>{t('geoDenied')}</p>
                <p className="error-hint">{t('geoDeniedHint')}</p>
              </>
            ) : error === 'TIMEOUT' ? (
              <p>{t('geoTimeout')}</p>
            ) : error === 'UNAVAILABLE' ? (
              <p>{t('geoUnavailable')}</p>
            ) : (
              <>
                <p>{t('errorPrefix')} {error}</p>
                <p className="error-hint">{t('errorHint')}</p>
              </>
            )}
            <button className="locate-btn" onClick={requestLocation} style={{ marginTop: '1rem' }}>
              <span aria-hidden="true">📍</span> {t('tryAgain')}
            </button>
          </div>
        )}

        {active && !loading && !error && places.length > 0 && (
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
          {t('footerData')} <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">Open-Meteo</a> — {t('footerScanning', { radius: radiusKm, location: pinnedLocation ? (pinnedLocation.name || t('pinnedLocation')) : t('you') })}
        </p>
      </footer>
    </div>
  );
}

export default App;
