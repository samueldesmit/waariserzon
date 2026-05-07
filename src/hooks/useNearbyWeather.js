import { useState, useEffect, useMemo, useRef } from 'react';
import { translations, t } from '../i18n/translations';
import CITIES from '../data/cities';

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5)); // ~137.5°
const DIRECTION_KEYS = [
  'north', 'northeast', 'east', 'southeast',
  'south', 'southwest', 'west', 'northwest',
];

function pointCountForRadius(radiusKm) {
  const n = Math.round(15 + Math.sqrt(radiusKm) * 6);
  return Math.max(24, Math.min(80, n));
}

// Per-browser snapshot cache. Keyed by (lat, lon, radius, forecastDays, lang)
// rounded to 3 decimal places so tiny coordinate jitter still hits the cache.
const CACHE_TTL_MS = 10 * 60 * 1000;
function cacheKey(loc, radiusKm, forecastDays, lang) {
  return `wnw:${loc.lat.toFixed(3)},${loc.lon.toFixed(3)}-${radiusKm}-${forecastDays}-${lang}`;
}
function readCache(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || Date.now() - parsed.ts > CACHE_TTL_MS) return null;
    return parsed.snapshot;
  } catch {
    return null;
  }
}
function writeCache(key, snapshot) {
  try {
    localStorage.setItem(key, JSON.stringify({ snapshot, ts: Date.now() }));
  } catch {
    /* quota exceeded — drop the oldest entries silently */
  }
}

function bearingToDirectionKey(dLat, dLon) {
  const angle = (Math.atan2(dLon, dLat) * 180) / Math.PI;
  const idx = Math.round(((angle + 360) % 360) / 45) % 8;
  return DIRECTION_KEYS[idx];
}

function generateNearbyPoints(lat, lon, radiusKm, strings) {
  const points = [{ label: strings.youAreHere, short: 'Here', lat, lon, distance: 0 }];
  const count = pointCountForRadius(radiusKm);
  const lonScale = 111 * Math.cos((lat * Math.PI) / 180);

  for (let i = 0; i < count; i++) {
    const t01 = (i + 1) / (count + 1);
    const r = Math.sqrt(t01) * radiusKm;
    const theta = (i + 1) * GOLDEN_ANGLE;
    const dLat = (r * Math.cos(theta)) / 111;
    const dLon = (r * Math.sin(theta)) / lonScale;
    const dirKey = bearingToDirectionKey(dLat, dLon);
    const distKm = Math.round(r);
    const suffix = distKm > radiusKm * 0.85 ? ` ${strings.far}` : '';
    points.push({
      label: `${t(strings, dirKey)}${suffix}`,
      short: `P${i}`,
      lat: lat + dLat,
      lon: lon + dLon,
      distance: distKm,
    });
  }
  return points;
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function findNearestCity(lat, lon) {
  let bestName = null;
  let bestDist = Infinity;
  for (let i = 0; i < CITIES.length; i++) {
    const dLat = CITIES[i][0] - lat;
    const dLon = CITIES[i][1] - lon;
    const dist = dLat * dLat + dLon * dLon;
    if (dist < bestDist) {
      bestDist = dist;
      bestName = CITIES[i][2];
    }
  }
  return bestName;
}

function interpretWeatherCode(code, isDay, strings) {
  if (code <= 1) {
    if (isDay) return { condition: 'sunny', icon: '☀️', description: strings.clearSky };
    return { condition: 'clear-night', icon: '🌙', description: strings.clearNight };
  }
  if (code === 2) {
    if (isDay) return { condition: 'partly-cloudy', icon: '⛅', description: strings.partlyCloudy };
    return { condition: 'partly-cloudy-night', icon: '🌤️', description: strings.partlyCloudyNight };
  }
  if (code === 3) return { condition: 'cloudy', icon: '☁️', description: strings.overcast };
  if (code <= 49) return { condition: 'foggy', icon: '🌫️', description: strings.fog };
  if (code <= 59) return { condition: 'rainy', icon: '🌧️', description: strings.drizzle };
  if (code <= 69) return { condition: 'rainy', icon: '🌧️', description: strings.rain };
  if (code <= 79) return { condition: 'snowy', icon: '🌨️', description: strings.snow };
  if (code <= 84) return { condition: 'rainy', icon: '🌧️', description: strings.rainShowers };
  if (code <= 86) return { condition: 'snowy', icon: '🌨️', description: strings.snowShowers };
  if (code <= 99) return { condition: 'stormy', icon: '⛈️', description: strings.thunderstorm };
  return { condition: 'unknown', icon: '❓', description: strings.unknown };
}

function formatLocalDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Minute-precise day/night check using sunrise/sunset for the target's date.
// Returns null if the daily window can't tell — caller should fall back to
// the hourly is_day flag.
function isDayAtMinute(targetDate, daily) {
  if (!daily?.time || !daily.sunrise || !daily.sunset) return null;
  const localDateStr = formatLocalDate(targetDate);
  const idx = daily.time.indexOf(localDateStr);
  if (idx === -1) return null;
  const sunrise = new Date(daily.sunrise[idx]).getTime();
  const sunset = new Date(daily.sunset[idx]).getTime();
  const t = targetDate.getTime();
  return t >= sunrise && t < sunset;
}

function findHourPair(times, targetDate) {
  const targetMs = targetDate.getTime();
  let lower = 0;
  for (let i = 0; i < times.length; i++) {
    const t = new Date(times[i]).getTime();
    if (t <= targetMs) lower = i;
    else break;
  }
  const upper = Math.min(lower + 1, times.length - 1);
  const lowerMs = new Date(times[lower]).getTime();
  const upperMs = new Date(times[upper]).getTime();
  const frac = upperMs > lowerMs
    ? Math.max(0, Math.min(1, (targetMs - lowerMs) / (upperMs - lowerMs)))
    : 0;
  return { lower, upper, frac };
}

const lerp = (a, b, f) => a * (1 - f) + b * f;

export function useNearbyWeather(
  location,
  radiusKm = 60,
  hoursAhead = 0,
  lang = 'en',
  forecastDays = 4,
) {
  // Prefetched data: stable across hoursAhead changes so scrubbing is instant
  const [snapshot, setSnapshot] = useState(null);
  // snapshot: { points, hourly: [{ time, weatherCode, temperature, cloudCover, windSpeed, isDay }] }
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);
  const abortRef = useRef(null);

  const strings = translations[lang] || translations.en;

  // Fetch hourly forecast. Only refetches when the map area, language, or
  // forecast window changes — NOT when the user scrubs time. Caches per
  // (lat, lon, radius, forecastDays, lang) in localStorage with a 10-minute
  // TTL to keep the API call rate well under Open-Meteo's free-tier limits.
  useEffect(() => {
    if (!location) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortRef.current) abortRef.current.abort();

    const key = cacheKey(location, radiusKm, forecastDays, lang);
    const cached = readCache(key);
    if (cached) {
      setSnapshot(cached);
      setInitialLoading(false);
      setRefreshing(false);
      setError(null);
      return;
    }

    const isFirst = !snapshot;
    if (!isFirst) setRefreshing(true);
    const delay = isFirst ? 0 : 250;

    debounceRef.current = setTimeout(() => {
      const controller = new AbortController();
      abortRef.current = controller;

      const generated = generateNearbyPoints(location.lat, location.lon, radiusKm, strings);
      const lats = generated.map((p) => p.lat.toFixed(4)).join(',');
      const lons = generated.map((p) => p.lon.toFixed(4)).join(',');
      // forecastDays scales with the user's selected preset window — most
      // sessions only need 4 days; we bump it when the user explicitly
      // jumps to +7d or +14d. daily sunrise/sunset gives minute-precision
      // day/night.
      const params =
        `hourly=weather_code,temperature_2m,cloud_cover,wind_speed_10m,is_day&daily=sunrise,sunset&forecast_days=${forecastDays}`;
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&${params}&timezone=auto`;

      fetch(url, { signal: controller.signal })
        .then((res) => {
          if (!res.ok) throw new Error('Weather API request failed');
          return res.json();
        })
        .then((data) => {
          const results = Array.isArray(data) ? data : [data];
          const points = generated.map((p) => ({
            ...p,
            cityName: findNearestCity(p.lat, p.lon),
            distance: Math.round(haversineKm(location.lat, location.lon, p.lat, p.lon)),
          }));
          const hourly = results.map((r) => {
            if (!r?.hourly?.time) return null;
            return {
              time: r.hourly.time,
              weatherCode: r.hourly.weather_code,
              temperature: r.hourly.temperature_2m,
              cloudCover: r.hourly.cloud_cover,
              windSpeed: r.hourly.wind_speed_10m,
              isDay: r.hourly.is_day,
            };
          });
          const daily = results.map((r) =>
            r?.daily?.time
              ? { time: r.daily.time, sunrise: r.daily.sunrise, sunset: r.daily.sunset }
              : null,
          );
          const next = { points, hourly, daily };
          setSnapshot(next);
          writeCache(key, next);
          setInitialLoading(false);
          setRefreshing(false);
          setError(null);
        })
        .catch((err) => {
          if (err.name === 'AbortError') return;
          setError(err.message);
          setInitialLoading(false);
          setRefreshing(false);
        });
    }, delay);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // strings is a stable reference per lang; depending on lang directly
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.lat, location?.lon, radiusKm, lang, forecastDays]);

  // Slice the cached forecast at the user's chosen hour. Pure client-side, and
  // interpolates between adjacent hours so the cloud overlay morphs smoothly
  // when the user scrubs (Buienradar-style animation).
  const places = useMemo(() => {
    if (!snapshot) return [];
    const targetDate = new Date(Date.now() + hoursAhead * 3600 * 1000);
    return snapshot.points.map((point, i) => {
      const h = snapshot.hourly[i];
      const d = snapshot.daily?.[i];
      if (!h) return { ...point, weather: null };
      const { lower, upper, frac } = findHourPair(h.time, targetDate);
      // Discrete attributes (day/night, weather code) snap to nearest hour so
      // the marker emoji doesn't flicker while interpolating.
      const snapIdx = frac < 0.5 ? lower : upper;
      const minuteDay = isDayAtMinute(targetDate, d);
      const isDay = minuteDay !== null ? minuteDay : h.isDay[snapIdx] === 1;
      const weatherCode = h.weatherCode[snapIdx];
      const weather = interpretWeatherCode(weatherCode, isDay, strings);
      return {
        ...point,
        weather: {
          ...weather,
          temperature: lerp(h.temperature[lower], h.temperature[upper], frac),
          cloudCover: lerp(h.cloudCover[lower], h.cloudCover[upper], frac),
          windSpeed: lerp(h.windSpeed[lower], h.windSpeed[upper], frac),
          weatherCode,
          isDay,
        },
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot, hoursAhead, lang]);

  return { places, loading: initialLoading, refreshing, error };
}
