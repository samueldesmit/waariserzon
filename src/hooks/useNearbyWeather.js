import { useState, useEffect, useRef } from 'react';

const DIRECTIONS = [
  { label: 'North', short: 'N', dLat: 1, dLon: 0 },
  { label: 'Northeast', short: 'NE', dLat: 0.7, dLon: 0.7 },
  { label: 'East', short: 'E', dLat: 0, dLon: 1 },
  { label: 'Southeast', short: 'SE', dLat: -0.7, dLon: 0.7 },
  { label: 'South', short: 'S', dLat: -1, dLon: 0 },
  { label: 'Southwest', short: 'SW', dLat: -0.7, dLon: -0.7 },
  { label: 'West', short: 'W', dLat: 0, dLon: -1 },
  { label: 'Northwest', short: 'NW', dLat: 0.7, dLon: -0.7 },
];

// 1 degree latitude ≈ 111 km
function kmToDegrees(km) {
  return km / 111;
}

function generateNearbyPoints(lat, lon, radiusKm) {
  const points = [{ label: 'You', short: 'Here', lat, lon, distance: 0 }];

  // 3 rings: 1/3, 2/3, and full radius
  const rings = [
    { factor: 1 / 3, suffix: '' },
    { factor: 2 / 3, suffix: '' },
    { factor: 1, suffix: ' (far)' },
  ];

  for (let r = 0; r < rings.length; r++) {
    const ring = rings[r];
    const offsetKm = radiusKm * ring.factor;
    const offset = kmToDegrees(offsetKm);
    for (const dir of DIRECTIONS) {
      points.push({
        label: `${dir.label}${ring.suffix}`,
        short: `${dir.short}${r > 0 ? r + 1 : ''}`,
        lat: lat + dir.dLat * offset,
        lon: lon + dir.dLon * offset,
        distance: Math.round(offsetKm),
      });
    }
  }
  return points;
}

// Haversine distance in km
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

// WMO weather codes — day/night aware
function interpretWeatherCode(code, isDay) {
  if (code <= 1) {
    if (isDay) return { condition: 'sunny', icon: '☀️', description: 'Clear sky' };
    return { condition: 'clear-night', icon: '🌙', description: 'Clear night' };
  }
  if (code === 2) {
    if (isDay) return { condition: 'partly-cloudy', icon: '⛅', description: 'Partly cloudy' };
    return { condition: 'partly-cloudy-night', icon: '🌤️', description: 'Partly cloudy night' };
  }
  if (code === 3) return { condition: 'cloudy', icon: '☁️', description: 'Overcast' };
  if (code <= 49) return { condition: 'foggy', icon: '🌫️', description: 'Fog' };
  if (code <= 59) return { condition: 'rainy', icon: '🌧️', description: 'Drizzle' };
  if (code <= 69) return { condition: 'rainy', icon: '🌧️', description: 'Rain' };
  if (code <= 79) return { condition: 'snowy', icon: '🌨️', description: 'Snow' };
  if (code <= 84) return { condition: 'rainy', icon: '🌧️', description: 'Rain showers' };
  if (code <= 86) return { condition: 'snowy', icon: '🌨️', description: 'Snow showers' };
  if (code <= 99) return { condition: 'stormy', icon: '⛈️', description: 'Thunderstorm' };
  return { condition: 'unknown', icon: '❓', description: 'Unknown' };
}

// Find the index in hourly.time that best matches the target date
function findHourIndex(times, targetDate) {
  const targetISO = targetDate.toISOString().slice(0, 13);
  for (let i = 0; i < times.length; i++) {
    if (times[i].startsWith(targetISO)) return i;
  }
  const targetMs = targetDate.getTime();
  let best = 0;
  let bestDiff = Infinity;
  for (let i = 0; i < times.length; i++) {
    const diff = Math.abs(new Date(times[i]).getTime() - targetMs);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = i;
    }
  }
  return best;
}

export function useNearbyWeather(location, radiusKm = 60, hoursAhead = 0) {
  const [places, setPlaces] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    if (!location) return;

    // Cancel pending debounce
    if (debounceRef.current) clearTimeout(debounceRef.current);
    // Cancel in-flight request
    if (abortRef.current) abortRef.current.abort();

    const isFirst = places.length === 0;
    if (!isFirst) setRefreshing(true);

    const delay = isFirst ? 0 : 400;

    debounceRef.current = setTimeout(() => {
      const controller = new AbortController();
      abortRef.current = controller;

      const points = generateNearbyPoints(location.lat, location.lon, radiusKm);
      const lats = points.map((p) => p.lat.toFixed(4)).join(',');
      const lons = points.map((p) => p.lon.toFixed(4)).join(',');

      const forecastDays = Math.ceil(hoursAhead / 24) + 1;
      const params = hoursAhead === 0
        ? 'current=weather_code,temperature_2m,cloud_cover,wind_speed_10m,is_day'
        : `hourly=weather_code,temperature_2m,cloud_cover,wind_speed_10m,is_day&forecast_days=${forecastDays}`;

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&${params}&timezone=auto`;

      fetch(url, { signal: controller.signal })
        .then((res) => {
          if (!res.ok) throw new Error('Weather API request failed');
          return res.json();
        })
        .then((data) => {
          const results = Array.isArray(data) ? data : [data];
          const userLat = location.lat;
          const userLon = location.lon;
          const targetDate = new Date(Date.now() + hoursAhead * 3600 * 1000);

          const enriched = points.map((point, i) => {
            const result = results[i];
            if (!result) return { ...point, weather: null };

            let weatherCode, temperature, cloudCover, windSpeed, isDay;

            if (hoursAhead === 0) {
              const current = result.current;
              if (!current) return { ...point, weather: null };
              weatherCode = current.weather_code;
              temperature = current.temperature_2m;
              cloudCover = current.cloud_cover;
              windSpeed = current.wind_speed_10m;
              isDay = current.is_day === 1;
            } else {
              const hourly = result.hourly;
              if (!hourly || !hourly.time) return { ...point, weather: null };
              const idx = findHourIndex(hourly.time, targetDate);
              weatherCode = hourly.weather_code[idx];
              temperature = hourly.temperature_2m[idx];
              cloudCover = hourly.cloud_cover[idx];
              windSpeed = hourly.wind_speed_10m[idx];
              isDay = hourly.is_day[idx] === 1;
            }

            const weather = interpretWeatherCode(weatherCode, isDay);
            const distKm = Math.round(haversineKm(userLat, userLon, point.lat, point.lon));
            return {
              ...point,
              distance: distKm,
              weather: {
                ...weather,
                temperature,
                cloudCover,
                windSpeed,
                weatherCode,
                isDay,
              },
            };
          });
          setPlaces(enriched);
          setInitialLoading(false);
          setRefreshing(false);

          // Reverse geocode nearby points to get city names
          const nearby = enriched.filter((p) => p.short !== 'Here');
          Promise.allSettled(
            nearby.map((p, i) =>
              new Promise((resolve) => setTimeout(resolve, i * 100))
                .then(() =>
                  fetch(
                    `https://nominatim.openstreetmap.org/reverse?lat=${p.lat.toFixed(4)}&lon=${p.lon.toFixed(4)}&format=json&zoom=10`,
                    { signal: controller.signal }
                  )
                )
                .then((r) => r.json())
                .then((d) => {
                  const a = d.address || {};
                  return a.city || a.town || a.village || a.municipality || a.hamlet || a.county || null;
                })
            )
          ).then((results) => {
            if (controller.signal.aborted) return;
            setPlaces((current) =>
              current.map((place) => {
                if (place.short === 'Here') return place;
                const idx = nearby.findIndex((n) => n.short === place.short);
                if (idx === -1) return place;
                const r = results[idx];
                const name = r.status === 'fulfilled' && r.value ? r.value : null;
                return name ? { ...place, label: name } : place;
              })
            );
          });
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
  }, [location, radiusKm, hoursAhead]);

  return { places, loading: initialLoading, refreshing, error };
}
