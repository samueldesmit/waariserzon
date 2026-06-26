import { useState, useEffect, useMemo, useRef } from 'react';
import { useGeolocation } from './hooks/useGeolocation';
import { useNearbyWeather } from './hooks/useNearbyWeather';
import { useSunshineHourly } from './hooks/useSunshineHourly';
import { useIsMobile } from './hooks/useIsMobile';
import WeatherMap from './components/WeatherMap';
import BestDestinationCard from './components/BestDestinationCard';
import NightCard from './components/NightCard';
import SunRanking from './components/SunRanking';
import ForecastTimeline from './components/ForecastTimeline';
import MobileShell from './components/mobile/MobileShell';
import { useLanguage } from './i18n/LanguageContext';
import { searchPlaces, reverseGeocode, resolveSuggestion } from './lib/geocoder';
import { detectDevice } from './lib/device';
import './App.css';

// Each preset opens a 24-hour scrub window starting at that offset from now.
const TIME_PRESETS = [
  { value: 0, key: 'now' },
  { value: 24, label: '+1d' },
  { value: 48, label: '+2d' },
  { value: 72, label: '+3d' },
  { value: 96, label: '+4d' },
  { value: 120, label: '+5d' },
  { value: 144, label: '+6d' },
  { value: 168, label: '+7d' },
  { value: 336, label: '+14d' },
];
const SLIDER_MAX = 24;
const TIME_MAX = 360; // last preset (+14d = 336h) plus the 24h slider window

// SEO landing pages auto-pin the map to the city in the URL so visitors
// landing on /zon-amsterdam see Amsterdam without needing to share location.
const CITY_LANDINGS = {
  'zon-amsterdam': { lat: 52.3676, lon: 4.9041, name: 'Amsterdam', cityName: 'Amsterdam' },
  'zon-rotterdam': { lat: 51.9225, lon: 4.4792, name: 'Rotterdam', cityName: 'Rotterdam' },
  'zon-utrecht': { lat: 52.0907, lon: 5.1214, name: 'Utrecht', cityName: 'Utrecht' },
  'zon-den-haag': { lat: 52.0705, lon: 4.3007, name: 'Den Haag', cityName: 'Den Haag' },
  'zon-eindhoven': { lat: 51.4416, lon: 5.4697, name: 'Eindhoven', cityName: 'Eindhoven' },
};

const CITY_NAV = [
  { slug: 'zon-amsterdam', label: 'Amsterdam' },
  { slug: 'zon-rotterdam', label: 'Rotterdam' },
  { slug: 'zon-utrecht', label: 'Utrecht' },
  { slug: 'zon-den-haag', label: 'Den Haag' },
  { slug: 'zon-eindhoven', label: 'Eindhoven' },
];

const RADIUS_OPTIONS = [10, 30, 60, 100, 200];

const GEO_DENIED_HINT_KEY = {
  ios: 'geoDeniedHintIOS',
  android: 'geoDeniedHintAndroid',
  desktop: 'geoDeniedHintDesktop',
};

function formatScrubberLabel(hoursAhead, lang, t) {
  if (hoursAhead === 0) return t('now');
  const locale = lang === 'nl' ? 'nl-NL' : 'en-GB';
  const now = new Date();
  const target = new Date(now.getTime() + hoursAhead * 3600 * 1000);
  const time = target.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  const startOfToday = new Date(now); startOfToday.setHours(0, 0, 0, 0);
  const dayDelta = Math.floor((target.getTime() - startOfToday.getTime()) / 86400000);
  if (dayDelta === 0) return `${t('today')} ${time}`;
  if (dayDelta === 1) return `${t('tomorrow')} ${time}`;
  if (dayDelta <= 6) {
    const weekday = target.toLocaleDateString(locale, { weekday: 'short' });
    return `${weekday} ${time}`;
  }
  const dateStr = target.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
  return `${dateStr} ${time}`;
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
  const isMobile = useIsMobile();
  const [radiusKm, setRadiusKm] = useState(30);
  const [hoursAhead, setHoursAhead] = useState(0);
  // presetBase = the start of the current 24h scrub window (Now = 0, +1d = 24,
  // +2d = 48, etc.). The slider scrubs hoursAhead from presetBase to
  // presetBase + 24.
  const [presetBase, setPresetBase] = useState(0);
  const [pinnedLocation, setPinnedLocation] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchActive, setSearchActive] = useState(-1);
  const [searching, setSearching] = useState(false);
  const searchTypingRef = useRef(false);
  const [playing, setPlaying] = useState(false);

  const sliderValue = Math.max(0, Math.min(SLIDER_MAX, hoursAhead - presetBase));

  const handlePresetClick = (preset) => {
    setPlaying(false);
    setPresetBase(preset.value);
    setHoursAhead(preset.value);
  };

  const handleSliderChange = (offset) => {
    setPlaying(false);
    setHoursAhead(presetBase + offset);
  };

  // Auto-advance the scrubber across the current 24-hour window. 0.2h every
  // 60ms → 7.2s full sweep, ~16fps.
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setHoursAhead((h) => {
        const offset = h - presetBase;
        const next = +(offset + 0.2).toFixed(2);
        if (next >= SLIDER_MAX) {
          setPlaying(false);
          return presetBase;
        }
        return presetBase + next;
      });
    }, 60);
    return () => clearInterval(id);
  }, [playing, presetBase]);
  const { location, error: geoError, loading: geoLoading, requested, requestLocation, clearError: clearGeoError } = useGeolocation();

  // Fallback when the user has blocked geolocation in the browser. Drops a
  // default pin (Utrecht — geographic center of NL) so the map, search, and
  // sunshine ranking remain usable instead of the error overlay trapping them.
  const handleDismissGeoError = () => {
    clearGeoError();
    if (!pinnedLocation) {
      setPinnedLocation({ lat: 52.0907, lon: 5.1214, name: 'Utrecht', cityName: 'Utrecht' });
    }
  };
  const activeLocation = pinnedLocation ?? location;

  // Reverse-geocoded name for the active coords. Only used when the active
  // location wasn't explicitly named by the user (e.g. raw GPS or a map
  // click). PDOK gives us the actual woonplaats — "Grave" for someone
  // standing in Grave — instead of findNearestCity's nearest-big-city
  // fallback ("Wijchen").
  const [resolvedCityName, setResolvedCityName] = useState(null);
  const [resolvingCityName, setResolvingCityName] = useState(false);
  useEffect(() => {
    if (!activeLocation) {
      setResolvedCityName(null);
      setResolvingCityName(false);
      return;
    }
    // User-named locations (search picks, city URLs) already carry a
    // precise name — skip the lookup, that name wins.
    if (activeLocation.cityName || activeLocation.name) {
      setResolvedCityName(null);
      setResolvingCityName(false);
      return;
    }
    const ctl = new AbortController();
    setResolvedCityName(null);
    setResolvingCityName(true);
    reverseGeocode(activeLocation.lat, activeLocation.lon, { signal: ctl.signal, lang })
      .then((name) => {
        if (name) setResolvedCityName(name);
      })
      .catch(() => {})
      .finally(() => setResolvingCityName(false));
    return () => ctl.abort();
  }, [activeLocation?.lat, activeLocation?.lon, activeLocation?.cityName, activeLocation?.name, lang]);

  const enrichedLocation = useMemo(() => {
    if (!activeLocation) return null;
    if (activeLocation.cityName || activeLocation.name) return activeLocation;
    if (resolvedCityName) {
      return { ...activeLocation, name: resolvedCityName, cityName: resolvedCityName };
    }
    return activeLocation;
  }, [activeLocation, resolvedCityName]);

  // Only fetch as many days as the current preset window actually needs.
  // Default sessions stay near "Now" (4 days covers Now + slider + +1d/+3d);
  // we bump up when the user jumps further out in the week.
  const forecastDays = Math.min(
    16,
    Math.max(4, Math.ceil((presetBase + SLIDER_MAX + 4) / 24)),
  );
  const { places, loading: weatherLoading, refreshing, error: weatherError } = useNearbyWeather(
    enrichedLocation,
    radiusKm,
    hoursAhead,
    lang,
    forecastDays,
  );
  const { hours: sunshineHours } = useSunshineHourly(activeLocation, hoursAhead);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // Auto-pin from city landing URL (e.g. /zon-amsterdam) so the map renders
  // centered on that city without prompting for geolocation.
  useEffect(() => {
    const slug = window.location.pathname
      .replace(/^\/+/, '')
      .replace(/\.html$/, '')
      .replace(/\/$/, '');
    const city = CITY_LANDINGS[slug];
    if (city) setPinnedLocation(city);
  }, []);

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
    const target = Math.min(TIME_MAX, Math.max(1, Math.ceil(hours)));
    // Snap to the largest preset day-window that contains this target hour.
    const base = TIME_PRESETS.reduce(
      (max, p) => (p.value <= target && p.value > max ? p.value : max),
      0,
    );
    setPresetBase(base);
    setHoursAhead(target);
  };

  // Sync search field with active city when it changes (unless user is typing)
  useEffect(() => {
    if (fromName && !searchTypingRef.current) setSearchValue(fromName);
  }, [fromName]);

  // Debounced geocoder lookup. Re-runs on every keystroke but only after the
  // user pauses for 250ms — keeps PDOK happy and avoids flicker.
  useEffect(() => {
    if (!searchTypingRef.current) return;
    const q = searchValue.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const ctl = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const results = await searchPlaces(q, { signal: ctl.signal, lang });
        setSuggestions(results);
        setSearchActive(results.length > 0 ? 0 : -1);
      } catch (err) {
        if (err?.name !== 'AbortError') setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      ctl.abort();
    };
  }, [searchValue, lang]);

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
        sunChance: p.weather.isDay
          ? Math.round(Math.max(0, 100 - p.weather.cloudCover))
          : 0,
      }));
    // Tie-break by cloud cover so the ranking still has a meaningful order at
    // night (clearest skies first) when every sunChance is 0.
    const sorted = [...enriched].sort((a, b) => {
      if (b.sunChance !== a.sunChance) return b.sunChance - a.sunChance;
      return a.weather.cloudCover - b.weather.cloudCover;
    });
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

  const pickSuggestion = async (suggestion) => {
    if (!suggestion) return;
    searchTypingRef.current = false;
    // PDOK /suggest results carry no coords; resolve via /lookup before
    // pinning. Mapbox results already include coords and pass through.
    let resolved = suggestion;
    if (resolved.lat == null || resolved.lon == null) {
      try {
        resolved = await resolveSuggestion(suggestion);
      } catch {}
    }
    if (resolved?.lat == null || resolved?.lon == null) return;
    const displayName = resolved.cityName || resolved.name;
    setPinnedLocation({
      lat: resolved.lat,
      lon: resolved.lon,
      name: displayName,
      cityName: displayName,
    });
    setSearchValue(displayName);
    setSuggestions([]);
    setSearchOpen(false);
    setSearchActive(-1);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (suggestions.length > 0) {
      pickSuggestion(suggestions[Math.max(0, searchActive)]);
      return;
    }
    // Empty input → fall back to "use my location" so the legacy GPS shortcut
    // still works for users who hit Enter on an empty field.
    if (!searchValue.trim()) requestLocation();
  };

  const handleSearchKeyDown = (e) => {
    if (!searchOpen || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSearchActive((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSearchActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === 'Escape') {
      setSearchOpen(false);
    }
  };

  const handleRankingSelect = (place) => {
    setPinnedLocation({
      lat: place.lat,
      lon: place.lon,
      name: place.cityName,
      cityName: place.cityName,
    });
  };

  if (isMobile) {
    const bag = {
      active,
      loading,
      error,
      geoError,
      places,
      bestPlace,
      sunnyRanking,
      radiusKm,
      setRadiusKm,
      hoursAhead,
      presetBase,
      sliderValue,
      sliderMax: SLIDER_MAX,
      handlePresetClick,
      handleSliderChange,
      playing,
      setPlaying,
      pinnedLocation,
      setPinnedLocation,
      requestLocation,
      handleDismissGeoError,
      activeLocation,
      fromName,
      isNight,
      userPlace,
      sunriseTime,
      hoursToSunrise,
      handleSkipToSunrise,
      timeLabel,
      sunshineHours,
      refreshing,
      searchValue,
      setSearchValue,
      suggestions,
      searching,
      pickSuggestion,
      searchTypingRef,
    };
    return <MobileShell bag={bag} />;
  }

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
          <div
            role="combobox"
            aria-expanded={searchOpen && suggestions.length > 0}
            aria-haspopup="listbox"
            aria-owns="location-suggestions"
          >
            <PinIcon />
            <input
              id="location"
              value={searchValue}
              autoComplete="off"
              onChange={(e) => {
                searchTypingRef.current = true;
                setSearchValue(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
              onKeyDown={handleSearchKeyDown}
              placeholder={t('searchPlaceholder')}
              aria-autocomplete="list"
              aria-controls="location-suggestions"
              aria-activedescendant={
                searchActive >= 0 && suggestions[searchActive]
                  ? `location-suggestion-${searchActive}`
                  : undefined
              }
            />
            <button type="submit">{t('searchButton')}</button>
            {searchOpen && (suggestions.length > 0 || (searching && searchValue.trim().length >= 2)) && (
              <ul
                id="location-suggestions"
                className="location-suggestions"
                role="listbox"
              >
                {suggestions.length === 0 && searching && (
                  <li className="location-suggestions__hint" aria-disabled="true">
                    {t('searchSearching')}
                  </li>
                )}
                {suggestions.map((s, i) => (
                  <li
                    key={s.id}
                    id={`location-suggestion-${i}`}
                    role="option"
                    aria-selected={i === searchActive}
                    className={i === searchActive ? 'is-active' : ''}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      pickSuggestion(s);
                    }}
                    onMouseEnter={() => setSearchActive(i)}
                  >
                    <PinIcon />
                    <span>{s.label}</span>
                  </li>
                ))}
              </ul>
            )}
            {searchOpen
              && !searching
              && suggestions.length === 0
              && searchValue.trim().length >= 2 && (
                <ul id="location-suggestions" className="location-suggestions" role="listbox">
                  <li className="location-suggestions__hint" aria-disabled="true">
                    {t('searchNoResults')}
                  </li>
                </ul>
            )}
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
              <p className="error-hint">{t(GEO_DENIED_HINT_KEY[detectDevice()] || 'geoDeniedHint')}</p>
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
          <div className="error-actions">
            <button className="locate-btn" onClick={requestLocation}>{t('tryAgain')}</button>
            {error === 'PERMISSION_DENIED' && (
              <button className="locate-btn locate-btn--secondary" onClick={handleDismissGeoError}>
                {t('continueWithoutLocation')}
              </button>
            )}
          </div>
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
                hoursAhead={hoursAhead}
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
              {pinnedLocation && (
                <div className="map-pin-overlay">
                  <span className="map-pin-name">
                    {pinnedLocation.name ||
                      pinnedLocation.cityName ||
                      resolvedCityName ||
                      (resolvingCityName ? t('loadingLocation') : t('pinnedLocation'))}
                  </span>
                  <button className="map-back-btn" onClick={() => setPinnedLocation(null)}>
                    {t('backToMyLocation')}
                  </button>
                </div>
              )}
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
                    max={SLIDER_MAX}
                    step={0.1}
                    value={sliderValue}
                    onChange={(e) => handleSliderChange(Number(e.target.value))}
                    aria-label={t('momentLabel')}
                    aria-valuetext={timeLabel}
                  />
                </div>
              </div>
              <div className="time-extras">
                <div className="time-presets" role="group" aria-label={t('momentLabel')}>
                  {TIME_PRESETS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      className={presetBase === p.value ? 'active' : ''}
                      onClick={() => handlePresetClick(p)}
                    >
                      {p.key ? t(p.key) : p.label}
                    </button>
                  ))}
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

      <nav className="city-nav" aria-label={t('citiesNavLabel')}>
        <strong>{t('citiesNavLabel')}</strong>
        <ul>
          <li><a href="/">{t('homepageLink')}</a></li>
          {CITY_NAV.map((c) => (
            <li key={c.slug}><a href={`/${c.slug}`}>{c.label}</a></li>
          ))}
          <li><a href="/zon-vandaag">{t('todayLink')}</a></li>
          <li><a href="/zon-weekend">{t('weekendLink')}</a></li>
        </ul>
      </nav>

      <nav className="city-nav" aria-label={t('guidesNavLabel')}>
        <strong>{t('guidesNavLabel')}</strong>
        <ul>
          <li><a href="/zonkans-uitleg">{t('guideZonkansLink')}</a></li>
          <li><a href="/uv-index">UV-index</a></li>
          <li><a href="/zeebries">{t('guideSeabreezeLink')}</a></li>
          <li><a href="/zonneschijn-per-maand">{t('guideMonthlyLink')}</a></li>
          <li><a href="/zonnigste-plekken-nederland">{t('guideSunniestNLLink')}</a></li>
        </ul>
      </nav>

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
        <p className="footer-links">
          <a href="/about">{t('aboutLink')}</a>
          {' · '}
          <a href="/contact">{t('contactLink')}</a>
          {' · '}
          <a href="/privacy">{t('privacyLink')}</a>
          {' · '}
          <a href="/voorwaarden">{t('termsLink')}</a>
        </p>
        <p className="footer-badge">
          <a href="https://verifieddr.com/website/waariserzon-nl" target="_blank">
            <img src="https://verifieddr.com/badge/waariserzon-nl-dark.svg?metric=truedr" alt="Verified DR - TrueDR (Real Authority Score) for waariserzon.nl" width="220" height="68" />
          </a>
        </p>
      </footer>
    </main>
  );
}

export default App;
