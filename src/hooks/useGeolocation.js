import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'fts-location';

function getSavedLocation() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return null;
}

export function useGeolocation() {
  const saved = getSavedLocation();
  const [location, setLocation] = useState(saved);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [requested, setRequested] = useState(!!saved);

  // On mount with a saved location, silently refresh in the background
  useEffect(() => {
    if (!saved || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = { lat: position.coords.latitude, lon: position.coords.longitude };
        setLocation(loc);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
      },
      () => {} // keep using saved location on error
    );
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setRequested(true);
      return;
    }

    setRequested(true);
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = { lat: position.coords.latitude, lon: position.coords.longitude };
        setLocation(loc);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }, []);

  return { location, error, loading, requested, requestLocation };
}
