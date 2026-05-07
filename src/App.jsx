import { useState, useEffect, useMemo } from 'react';
import { useGeolocation } from './hooks/useGeolocation';
import { useNearbyWeather } from './hooks/useNearbyWeather';
import { useSunshineHourly } from './hooks/useSunshineHourly';
import WeatherMap from './components/WeatherMap';
import BestDestinationCard from './components/BestDestinationCard';
import NightCard from './components/NightCard';
import SunRanking from './components/SunRanking';
import ForecastTimeline from './components/ForecastTimeline';
import { useLanguage } from './i18n/LanguageContext';
import './App.css';

const TIME_TICKS = [
  { value: 0, key: 'now' },
  { value: 2, label: '+2h' },
  { value: 4, label: '+4h' },
  { value: 6, label: '+6h' },
  { value: 8, label: '+8h' },
];
const TIME_MAX = 8;

const RADIUS_OPTIONS = [30, 60, 100, 200, 500];

function formatScrubberLabel(hoursAhead, lang, t) {
  if (hoursAhead === 0) return t('now');
  const now = new Date();
  const target = new Date(now.getTime() + hoursAhead * 3600 * 1000);
  const time = target.toLocaleTimeString(lang === 'nl' ? 'nl-NL' : 'en-GB', {
    hour: '2-digit', minute: '2-digit',
  });
  const startOfToday = new Date(now); startOfToday.setHours(0, 0, 0, 0);
  const dayDelta = Math.floor((target.getTime() - startOfToday.getTime()) / 86400000);
  if (dayDelta === 0) return `${t('today')} ${time}`;
  if (dayDelta === 1) return `${t('tomorrow')} ${time}`;
  const weekday = target.toLocaleDateString(lang === 'nl' ? 'nl-NL' : 'en-GB', { weekday: 'short' });
  return `${weekday} ${time}`;
}

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
  const [playing, setPlaying] = useState(false);

  // Auto-advance the scrubber smoothly. 0.1h every 80ms → 6.4s full sweep,
  // ~12fps. Combined with sub-hour interpolation in useNearbyWeather, the
  // cloud overlay morphs continuously like a weather radar.
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setHoursAhead((h) => {
        const next = +(h + 0.1).toFixed(2);
        if (next >= TIME_MAX) {
          setPlaying(false);
          return 0;
        }
        return next;
      });
    }, 80);
    return () => clearInterval(id);
  }, [playing]);

  const adjustHours = (delta) => {
    setPlaying(false);
    setHoursAhead((h) => Math.min(TIME_MAX, Math.max(0, +(h + delta).toFixed(2))));
  };
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
  const isNight = !!(userPlace && userPlace.weather && !userPlace.weather.isDay);
  const fromName = pinnedLocation?.name || pinnedLocation?.cityName || userPlace?.cityName || '';

  // Compute sunrise based on hourly forecast: first daytime hour after now
  const { sunriseTime, hoursToSunrise } = useMemo(() => {
    if (!isNight || !sunshineHours || sunshineHours.length === 0) {
      return { sunriseTime: null, hoursToSunrise: null };
    }
    const nowMs = Date.now();
    let firstDayHour = null;
    let prev = null;
    for (const h of sunshineHours) {
      // sunrise = transition from night -> day, after now
      if (h.time.getTime() < nowMs) { prev = h; continue; }
      if (h.isDay && (!prev || !prev.isDay)) { firstDayHour = h; break; }
      prev = h;
    }
    // Fallback: any future daytime hour
    if (!firstDayHour) {
      firstDayHour = sunshineHours.find((h) => h.time.getTime() >= nowMs && h.isDay) || null;
    }
    if (!firstDayHour) return { sunriseTime: null, hoursToSunrise: null };
    const delta = (firstDayHour.time.getTime() - nowMs) / 3600000;
    return { sunriseTime: firstDayHour.time, hoursToSunrise: delta };
  }, [isNight, sunshineHours]);

  const handleSkipToSunrise = (hours) => {
    setHoursAhead(Math.min(TIME_MAX, Math.max(1, Math.ceil(hours))));
  };

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
        sunChance: Math.round(Math.max(0, 100 - p.weather.cloudCover)),
      }));
    const sorted = [...enriched].sort((a, b) => b.sunChance - a.sunChance);
    const best = sorted[0];
    // Ranking: dedupe by city name so we don't show the same town three times.
    const seen = new Set();
    const rankingPool = [];
    for (const p of sorted) {
      if (p.short === 'Here') continue;
      const key = p.cityName || `${p.lat.toFixed(2)},${p.lon.toFixed(2)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      rankingPool.push(p);
      if (rankingPool.length >= 3) break;
    }
    return { bestPlace: best, sunnyRanking: rankingPool };
  }, [places]);

  const timeLabel = useMemo(
    () => formatScrubberLabel(hoursAhead, lang, t),
    [hoursAhead, lang, t],
  );

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
            {isNight ? (
              <NightCard
                cityName={fromName || userPlace?.cityName || t('yourLocation')}
                weather={userPlace?.weather}
                sunriseTime={sunriseTime}
                hoursToSunrise={hoursToSunrise}
                onSkipToSunrise={handleSkipToSunrise}
              />
            ) : (
              <BestDestinationCard
                best={bestPlace}
                fromLocation={activeLocation}
                isNight={isNight}
              />
            )}
          </section>

          <section className="map-stage" aria-label={t('mapAndAlternatives')}>
            <section className="sun-map-frame" aria-label={t('sunshineNearby')}>
              <div className="map-time-badge">
                <span className="label">{t('momentLabel')}</span>
                <strong>{timeLabel}</strong>
              </div>
              <WeatherMap
                places={places}
                radiusKm={radiusKm}
                pinnedLocation={pinnedLocation}
                onPinLocation={setPinnedLocation}
                hoursAhead={hoursAhead}
              />
              {refreshing && (
                <div className="map-refreshing-overlay">
                  <div className="refreshing-spinner" />
                  <span>{t('updating')}</span>
                </div>
              )}
              <div className="map-overlay">
                <div>
                  <span className="label">{isNight ? t('nightKicker') : t('routeLabel')}</span>
                  <strong>
                    {isNight
                      ? fromName || t('yourLocation')
                      : bestPlace && bestPlace.distance > 0 && fromName
                        ? t('routeFromTo', { from: fromName, to: bestPlace.cityName })
                        : fromName || t('yourLocation')}
                  </strong>
                </div>
                {!isNight && bestPlace && bestPlace.distance > 0 && activeLocation && (
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

            <div className="time-controls" aria-label={t('momentLabel')}>
              <div className="time-bar">
                <button
                  type="button"
                  className="play-btn"
                  onClick={() => setPlaying((p) => !p)}
                  aria-label={playing ? t('pause') : t('play')}
                  aria-pressed={playing}
                >
                  {playing ? '⏸' : '▶'}
                </button>
                <div className="scrubber-wrap">
                  <input
                    className="time-scrubber"
                    type="range"
                    min={0}
                    max={TIME_MAX}
                    step={0.1}
                    value={hoursAhead}
                    onChange={(e) => {
                      setPlaying(false);
                      setHoursAhead(Number(e.target.value));
                    }}
                    aria-label={t('momentLabel')}
                    aria-valuetext={timeLabel}
                    list="time-ticks"
                  />
                  <datalist id="time-ticks">
                    {TIME_TICKS.map((tick) => (
                      <option key={tick.value} value={tick.value} />
                    ))}
                  </datalist>
                  <div className="time-tick-labels" aria-hidden="true">
                    {TIME_TICKS.map((tick) => (
                      <button
                        key={tick.value}
                        type="button"
                        className={Math.abs(tick.value - hoursAhead) < 0.5 ? 'active' : ''}
                        onClick={() => {
                          setPlaying(false);
                          setHoursAhead(tick.value);
                        }}
                      >
                        {tick.key ? t(tick.key) : tick.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="time-extras">
                <div className="quick-jumps" role="group" aria-label={t('momentLabel')}>
                  <button type="button" onClick={() => adjustHours(-1)}>−1{t('hourShort')}</button>
                  <button type="button" onClick={() => adjustHours(1)}>+1{t('hourShort')}</button>
                  <button type="button" onClick={() => adjustHours(3)}>+3{t('hourShort')}</button>
                  <button type="button" onClick={() => adjustHours(8)}>+8{t('hourShort')}</button>
                </div>
                <div className="radius-inline" role="group" aria-label={t('radiusLabel')}>
                  <span className="label">{t('radiusLabel')}</span>
                  <div className="chips">
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
              </div>
            </div>
          </section>

          <section className="lower-stack" aria-label={t('mapAndAlternatives')}>
            <SunRanking places={sunnyRanking} onSelect={handleRankingSelect} />
            {sunshineHours && userPlace && (
              <ForecastTimeline
                allHours={sunshineHours}
                cityName={userPlace.cityName}
                hoursAhead={hoursAhead}
              />
            )}
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
