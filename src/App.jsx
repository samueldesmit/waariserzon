import { useState, useEffect, useMemo } from 'react';
import { useGeolocation } from './hooks/useGeolocation';
import { useNearbyWeather } from './hooks/useNearbyWeather';
import { useSunshineHourly } from './hooks/useSunshineHourly';
import WeatherMap from './components/WeatherMap';
import BestDestinationCard from './components/BestDestinationCard';
import SunRanking from './components/SunRanking';
import ForecastTimeline from './components/ForecastTimeline';
import { useLanguage } from './i18n/LanguageContext';
import './App.css';

const TIME_OPTIONS = [
  { value: 0, key: 'now' },
  { value: 3, label: '+3h' },
  { value: 6, label: '+6h' },
  { value: 12, label: '+12h' },
  { value: 24, label: '+1d' },
  { value: 48, label: '+2d' },
  { value: 72, label: '+3d' },
];

const RADIUS_OPTIONS = [30, 60, 100, 200, 500];

function BrandLogo() {
  return (
    <svg className="brand-logo" viewBox="0 0 72 72" aria-hidden="true">
      <circle className="logo-orbit" cx="36" cy="36" r="30" />
      <path className="logo-compass" d="M36 10 49 36 36 62 23 36Z" />
      <circle className="logo-core" cx="36" cy="36" r="10" />
      <path className="logo-cut" d="M36 20v32M20 36h32" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function CrosshairIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3v4m0 10v4M3 12h4m10 0h4" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}

function App() {
  const { t, lang, setLang, strings } = useLanguage();
  const [radiusKm, setRadiusKm] = useState(60);
  const [hoursAhead, setHoursAhead] = useState(0);
  const [pinnedLocation, setPinnedLocation] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const { location, error: geoError, loading: geoLoading, requested, requestLocation } = useGeolocation();
  const activeLocation = pinnedLocation ?? location;
  const { places, loading: weatherLoading, refreshing, error: weatherError } = useNearbyWeather(
    activeLocation,
    radiusKm,
    hoursAhead,
    lang,
  );
  const { hours: sunshineHours } = useSunshineHourly(activeLocation, hoursAhead);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const userPlace = places.find((p) => p.short === 'Here');
  const isNight = userPlace && !userPlace.weather?.isDay;
  const fromName = pinnedLocation?.name || pinnedLocation?.cityName || userPlace?.cityName || '';

  // Sync search field with active city when it changes (unless user is typing)
  useEffect(() => {
    if (fromName) setSearchValue(fromName);
  }, [fromName]);

  const active = requested || !!pinnedLocation;
  const loading = active && (geoLoading || weatherLoading);
  const error = geoError || weatherError;

  // Compute best destination + sorted sunny ranking
  const { bestPlace, sunnyRanking } = useMemo(() => {
    if (!places.length) return { bestPlace: null, sunnyRanking: [] };
    const enriched = places
      .filter((p) => p.weather)
      .map((p) => ({
        ...p,
        sunChance: Math.max(0, 100 - p.weather.cloudCover),
      }));
    const sorted = [...enriched].sort((a, b) => b.sunChance - a.sunChance);
    const best = sorted[0];
    // Ranking excludes the user origin only when there is a clearly better nearby option
    const rankingPool = sorted.filter((p) => p.short !== 'Here');
    return { bestPlace: best, sunnyRanking: rankingPool.slice(0, 3) };
  }, [places]);

  const timeLabel = useMemo(() => {
    if (hoursAhead === 0) return t('now');
    if (hoursAhead < 24) return `+${hoursAhead}h`;
    return `+${hoursAhead / 24}d`;
  }, [hoursAhead, t]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    requestLocation();
  };

  const handleRankingSelect = (place) => {
    setPinnedLocation({
      lat: place.lat,
      lon: place.lon,
      name: place.cityName,
      cityName: place.cityName,
    });
  };

  return (
    <main className="page">
      <header className="masthead" aria-label={t('title')}>
        <a className="brand" href="#" aria-label={t('title')} onClick={(e) => e.preventDefault()}>
          <BrandLogo />
          <span>
            <strong>{t('title')}</strong>
            <small>{t('tagline')}</small>
          </span>
        </a>

        <form className="location-search" aria-label={t('searchLabel')} onSubmit={handleSearchSubmit}>
          <label htmlFor="location">{t('searchLabel')}</label>
          <div>
            <PinIcon />
            <input
              id="location"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={t('searchPlaceholder')}
            />
            <button type="submit">{t('searchButton')}</button>
          </div>
        </form>

        <nav className="top-actions" aria-label={t('settings')}>
          <button type="button" aria-label={t('useCurrentLocation')} onClick={requestLocation}>
            <CrosshairIcon />
          </button>
          <div role="group" aria-label={t('languageLabel')}>
            <button
              type="button"
              className={lang === 'nl' ? 'active' : ''}
              onClick={() => setLang('nl')}
              aria-pressed={lang === 'nl'}
            >
              NL
            </button>
            <button
              type="button"
              className={lang === 'en' ? 'active' : ''}
              onClick={() => setLang('en')}
              aria-pressed={lang === 'en'}
            >
              EN
            </button>
          </div>
        </nav>
      </header>

      {!active && (
        <div className="welcome-cta">
          <p className="welcome-text">{t('welcomeMessage')}</p>
          <button className="locate-btn" onClick={requestLocation}>
            {t('findSunshine')}
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
          <button className="locate-btn" onClick={requestLocation}>{t('tryAgain')}</button>
        </div>
      )}

      {active && !loading && !error && places.length > 0 && bestPlace && (
        <>
          <section className="answer-grid" aria-label={t('sunAdvice')}>
            <BestDestinationCard
              best={bestPlace}
              fromLocation={activeLocation}
              isNight={isNight}
            />
            <aside className="settings-card" aria-label={t('searchFilters')}>
              <div className="setting-row">
                <div>
                  <span className="label">{t('momentLabel')}</span>
                  <strong>{timeLabel}</strong>
                </div>
                <div className="chips" role="group" aria-label={t('momentLabel')}>
                  {TIME_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={opt.value === hoursAhead ? 'active' : ''}
                      onClick={() => setHoursAhead(opt.value)}
                      aria-pressed={opt.value === hoursAhead}
                    >
                      {opt.key ? t(opt.key) : opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="setting-row">
                <div>
                  <span className="label">{t('radiusLabel')}</span>
                  <strong>{radiusKm} km</strong>
                </div>
                <div className="chips" role="group" aria-label={t('radiusLabel')}>
                  {RADIUS_OPTIONS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      className={r === radiusKm ? 'active' : ''}
                      onClick={() => setRadiusKm(r)}
                      aria-pressed={r === radiusKm}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          </section>

          <section className="workbench" aria-label={t('mapAndAlternatives')}>
            <section className="sun-map-frame" aria-label={t('sunshineNearby')}>
              <WeatherMap
                places={places}
                radiusKm={radiusKm}
                pinnedLocation={pinnedLocation}
                onPinLocation={setPinnedLocation}
              />
              {refreshing && (
                <div className="map-refreshing-overlay">
                  <div className="refreshing-spinner" />
                  <span>{t('updating')}</span>
                </div>
              )}
              <div className="map-overlay">
                <div>
                  <span className="label">{t('routeLabel')}</span>
                  <strong>
                    {bestPlace && bestPlace.distance > 0 && fromName
                      ? t('routeFromTo', { from: fromName, to: bestPlace.cityName })
                      : fromName || t('yourLocation')}
                  </strong>
                </div>
                {bestPlace && bestPlace.distance > 0 && activeLocation && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&origin=${activeLocation.lat},${activeLocation.lon}&destination=${bestPlace.lat},${bestPlace.lon}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none' }}
                  >
                    <button type="button">{t('openMap')}</button>
                  </a>
                )}
              </div>
            </section>

            <aside className="side-stack">
              <SunRanking places={sunnyRanking} onSelect={handleRankingSelect} />
              {sunshineHours && userPlace && (
                <ForecastTimeline
                  allHours={sunshineHours}
                  cityName={userPlace.cityName}
                  hoursAhead={hoursAhead}
                />
              )}
            </aside>
          </section>
        </>
      )}

      <section className="seo-section">
        <h2>{t('seoHeading')}</h2>
        <p>{t('seoText')}</p>
        <h3>{t('seoHeading2')}</h3>
        <p>{t('seoText2')}</p>
        <h3>{t('seoHeading3')}</h3>
        <p>{t('seoText3')}</p>
        <h3>{t('seoHeading4')}</h3>
        <p>{t('seoText4')}</p>
      </section>

      <section className="faq-section" itemScope itemType="https://schema.org/FAQPage">
        <h2>{t('faqTitle')}</h2>
        {(strings.faqItems || []).map((item, i) => (
          <details key={i} className="faq-item" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
            <summary itemProp="name">{item.q}</summary>
            <div className="faq-answer" itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
              <p itemProp="text">{item.a}</p>
            </div>
          </details>
        ))}
      </section>

      <footer className="app-footer">
        <p>
          {t('footerData')}{' '}
          <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">Open-Meteo</a>
          {' — '}
          {t('footerScanning', {
            radius: radiusKm,
            location: pinnedLocation ? (pinnedLocation.name || t('pinnedLocation')) : t('you'),
          })}
        </p>
      </footer>
    </main>
  );
}

export default App;
