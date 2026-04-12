import { useState, useEffect, useRef } from 'react';

export function useSunshineHourly(location, hoursAhead = 0) {
  const [hours, setHours] = useState(null);
  const abortRef = useRef(null);

  useEffect(() => {
    if (!location) return;

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    // Fetch enough days to cover the full window
    const forecastDays = Math.min(7, Math.ceil((hoursAhead + 24) / 24) + 1);
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat.toFixed(4)}&longitude=${location.lon.toFixed(4)}&hourly=cloud_cover,is_day&forecast_days=${forecastDays}&timezone=auto`;

    fetch(url, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        const hourly = data.hourly;
        if (!hourly?.time) return;

        // Store all fetched hours so the component can slice based on hoursAhead
        const all = hourly.time.map((time, i) => ({
          time: new Date(time),
          hour: new Date(time).getHours(),
          label: `${String(new Date(time).getHours()).padStart(2, '0')}:00`,
          cloudCover: hourly.cloud_cover[i],
          sunChance: Math.max(0, 100 - hourly.cloud_cover[i]),
          isDay: hourly.is_day[i] === 1,
        }));

        setHours(all);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setHours(null);
      });

    return () => controller.abort();
  }, [location?.lat, location?.lon, hoursAhead]);

  return { hours };
}
