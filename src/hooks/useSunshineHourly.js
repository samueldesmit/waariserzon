import { useState, useEffect, useMemo, useRef } from 'react';
import { fetchOpenMeteo, bucketForecastDays } from '../lib/openMeteo';

// Hourly cloud_cover/is_day for a single location, used by the sunshine graph.
//
// Refetches only when the location or the forecast-days bucket changes —
// scrubbing or auto-playing the time slider reuses the cached snapshot.
// Without this, the slider's 60ms tick used to fire one Open-Meteo request
// per frame, blowing past the free-tier rate limit in seconds.

const CACHE_TTL_MS = 10 * 60 * 1000;

function cacheKey(location, bucket) {
  return `wsh:${location.lat.toFixed(3)},${location.lon.toFixed(3)}-${bucket}`;
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
    /* quota exceeded — ignore */
  }
}

export function useSunshineHourly(location, hoursAhead = 0) {
  const [snapshot, setSnapshot] = useState(null);
  const abortRef = useRef(null);

  const bucket = bucketForecastDays(Math.ceil((hoursAhead + 24) / 24) + 1);

  useEffect(() => {
    if (!location) return;
    if (abortRef.current) abortRef.current.abort();

    const key = cacheKey(location, bucket);
    const cached = readCache(key);
    if (cached) {
      setSnapshot(cached);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat.toFixed(4)}&longitude=${location.lon.toFixed(4)}&hourly=cloud_cover,is_day&forecast_days=${bucket}&timezone=auto`;

    fetchOpenMeteo(url, { signal: controller.signal })
      .then((data) => {
        const hourly = data?.hourly;
        if (!hourly?.time) return;
        const next = {
          time: hourly.time,
          cloudCover: hourly.cloud_cover,
          isDay: hourly.is_day,
        };
        setSnapshot(next);
        writeCache(key, next);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setSnapshot(null);
      });

    return () => controller.abort();
    // location is referenced through .lat/.lon — depending on the object
    // identity would refetch on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.lat, location?.lon, bucket]);

  const hours = useMemo(() => {
    if (!snapshot?.time) return null;
    return snapshot.time.map((time, i) => {
      const d = new Date(time);
      return {
        time: d,
        hour: d.getHours(),
        label: `${String(d.getHours()).padStart(2, '0')}:00`,
        cloudCover: snapshot.cloudCover[i],
        sunChance: Math.max(0, 100 - snapshot.cloudCover[i]),
        isDay: snapshot.isDay[i] === 1,
      };
    });
  }, [snapshot]);

  return { hours };
}
