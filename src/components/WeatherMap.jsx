import { useEffect, useMemo, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useLanguage } from '../i18n/LanguageContext';
import { brandMapStyle } from './mapStyle';
import { reverseGeocode } from '../lib/geocoder';

function cloudPointsGeoJSON(places) {
  return {
    type: 'FeatureCollection',
    features: places
      .filter((p) => p.weather && typeof p.weather.cloudCover === 'number')
      .map((p) => ({
        type: 'Feature',
        properties: {
          cloud_cover: p.weather.cloudCover,
          is_day: p.weather.isDay ? 1 : 0,
        },
        geometry: { type: 'Point', coordinates: [p.lon, p.lat] },
      })),
  };
}

function makeMarkerEl(html) {
  const el = document.createElement('div');
  el.className = 'weather-marker';
  el.innerHTML = html;
  return el;
}

function weatherMarkerHTML(emoji, isSunny, isNight) {
  const cls = isNight ? 'marker-night' : isSunny ? 'marker-sunny' : 'marker-cloudy';
  return `<div class="marker-bubble ${cls}">${emoji}</div>`;
}

const USER_MARKER_HTML = `<div class="marker-bubble marker-user">📍</div>`;
const PIN_MARKER_HTML = `<div class="marker-bubble marker-pin">📌</div>`;

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

// Thin the icon set so the map stays readable. The cloud overlay still uses
// every data point — only the bubble markers get thinned. Greedy by min
// separation in km, anchored on user + pin so nothing crowds them.
function thinMarkers(places, radiusKm, anchors) {
  const minKm = Math.max(5, radiusKm / 2.5);
  const kept = [];
  const occupied = anchors.slice();
  for (const place of places) {
    if (place.short === 'Here' || !place.weather) continue;
    const tooClose = occupied.some(
      (a) => haversineKm(a.lat, a.lon, place.lat, place.lon) < minKm,
    );
    if (tooClose) continue;
    kept.push(place);
    occupied.push({ lat: place.lat, lon: place.lon });
  }
  return kept;
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

const OWM_KEY = import.meta.env.VITE_OPENWEATHERMAP_KEY;

function coordKey(lat, lon) {
  return `${lat.toFixed(4)},${lon.toFixed(4)}`;
}

export default function WeatherMap({ places, radiusKm = 60, pinnedLocation, onPinLocation, hoursAhead = 0 }) {
  const { t, lang } = useLanguage();
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef(new Map()); // short -> { marker, element, lastHtml, lastPopup }
  const styleLoadedRef = useRef(false);
  const onPinLocationRef = useRef(onPinLocation);
  const fittedOnceRef = useRef(false);
  // Resolved real woonplaats names for marker coords. CITIES (the bundled
  // fallback) only contains pop ≥10k towns, so small villages get mislabeled
  // — when a popup opens we reverse-geocode the actual place and patch the
  // title. Keyed by rounded lat,lon so the override survives panning/scrubbing.
  const [nameOverrides, setNameOverrides] = useState({});
  const pendingLookupsRef = useRef(new Set());
  const langRef = useRef(lang);
  useEffect(() => { langRef.current = lang; }, [lang]);

  const resolveName = (lat, lon) => {
    const key = coordKey(lat, lon);
    if (pendingLookupsRef.current.has(key) || nameOverrides[key]) return;
    pendingLookupsRef.current.add(key);
    reverseGeocode(lat, lon, { lang: langRef.current })
      .then((name) => {
        if (name) setNameOverrides((prev) => (prev[key] === name ? prev : { ...prev, [key]: name }));
      })
      .catch(() => {})
      .finally(() => pendingLookupsRef.current.delete(key));
  };

  useEffect(() => {
    onPinLocationRef.current = onPinLocation;
  }, [onPinLocation]);

  useEffect(() => {
    if (mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: brandMapStyle,
      center: [5.2913, 52.1326],
      zoom: 6,
      attributionControl: {
        compact: true,
        customAttribution:
          '<a href="https://openfreemap.org" target="_blank" rel="noopener">OpenFreeMap</a> · <a href="https://www.openmaptiles.org/" target="_blank" rel="noopener">OpenMapTiles</a> · © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
      },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

    map.on('load', () => {
      styleLoadedRef.current = true;
      const labelLayerId = map.getLayer('place-city') ? 'place-city' : undefined;

      // Live cloud raster (real satellite/observation data) — shown only when
      // the user is at "Now" since the free OWM tier doesn't include forecast tiles.
      if (OWM_KEY) {
        map.addSource('owm-clouds', {
          type: 'raster',
          tiles: [
            `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${OWM_KEY}`,
          ],
          tileSize: 256,
          attribution:
            '<a href="https://openweathermap.org" target="_blank" rel="noopener">© OpenWeatherMap</a>',
        });
        map.addLayer(
          {
            id: 'owm-clouds',
            type: 'raster',
            source: 'owm-clouds',
            paint: {
              'raster-opacity': 0.9,
              'raster-opacity-transition': { duration: 400 },
              'raster-fade-duration': 300,
            },
          },
          labelLayerId,
        );
      }

      // Forecast blob overlay — styled to match the OWM raster's white-cloud look
      // so the cross-fade between live and forecast feels seamless.
      map.addSource('cloud-points', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.addLayer(
        {
          id: 'cloud-blob',
          type: 'circle',
          source: 'cloud-points',
          paint: {
            'circle-radius': [
              'interpolate', ['exponential', 1.6], ['zoom'],
              4, 10,
              6, 26,
              8, 60,
              10, 130,
              12, 260,
              14, 520,
            ],
            'circle-color': [
              'interpolate', ['linear'], ['get', 'cloud_cover'],
              0, 'rgba(255, 255, 255, 0)',
              20, 'rgba(255, 255, 255, 0)',
              40, 'rgba(245, 250, 255, 0.32)',
              60, 'rgba(215, 226, 240, 0.55)',
              80, 'rgba(175, 192, 215, 0.78)',
              100, 'rgba(140, 160, 185, 0.88)',
            ],
            'circle-blur': 1.3,
            'circle-opacity': OWM_KEY ? 0 : 1,
            'circle-opacity-transition': { duration: 400 },
          },
        },
        labelLayerId,
      );
    });

    map.on('click', (e) => {
      if (!onPinLocationRef.current) return;
      // Marker/popup clicks bubble up here too — skip those so clicking an
      // icon just shows its popup instead of dropping a new pin.
      const target = e.originalEvent?.target;
      if (target?.closest?.('.maplibregl-marker, .maplibregl-popup')) return;
      const { lng, lat } = e.lngLat;
      // Pin without a name — App-level reverse geocoding will fill in the
      // actual woonplaats (avoids findNearestCity's bundled-CITIES fallback
      // which mislabels smaller towns).
      onPinLocationRef.current({ lat, lon: lng });
    });

    mapRef.current = map;
    return () => {
      markersRef.current.forEach((entry) => entry.marker.remove());
      markersRef.current.clear();
      map.remove();
      mapRef.current = null;
      styleLoadedRef.current = false;
      fittedOnceRef.current = false;
    };
  }, []);

  // Markers — update in place so scrubbing doesn't tear down & rebuild 100+ DOM nodes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const seen = new Set();
    const upsert = (key, lng, lat, html, popupHtml) => {
      seen.add(key);
      let entry = markersRef.current.get(key);
      if (entry) {
        if (entry.lastHtml !== html) {
          entry.element.innerHTML = html;
          entry.lastHtml = html;
        }
        entry.marker.setLngLat([lng, lat]);
        if (entry.lastPopup !== popupHtml) {
          entry.marker.getPopup()?.setHTML(popupHtml);
          entry.lastPopup = popupHtml;
        }
      } else {
        const element = makeMarkerEl(html);
        const popup = new maplibregl.Popup({ offset: 24, closeButton: false }).setHTML(popupHtml);
        const marker = new maplibregl.Marker({ element, anchor: 'center' })
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(map);
        // Lazy lookup so we don't fire ~12 reverse-geocodes upfront — only when
        // the user actually opens the popup. resolveName dedupes + caches.
        popup.on('open', () => {
          if (key === 'Here' || key === '__pin__') return;
          const ll = marker.getLngLat();
          resolveName(ll.lat, ll.lng);
        });
        markersRef.current.set(key, { marker, element, lastHtml: html, lastPopup: popupHtml });
      }
    };

    const userPlace = places.find((p) => p.short === 'Here');
    if (userPlace) {
      const title = userPlace.cityName || (pinnedLocation ? t('pinnedLocationLabel') : t('yourLocation'));
      const w = userPlace.weather;
      const popupHtml = `<strong>${escapeHtml(title)}</strong>${w ? `<br/>${escapeHtml(w.icon)} ${escapeHtml(w.description)}<br/>${Math.round(w.temperature)}°C` : ''}`;
      upsert('Here', userPlace.lon, userPlace.lat, USER_MARKER_HTML, popupHtml);
    }

    if (pinnedLocation) {
      const title = pinnedLocation.cityName || pinnedLocation.name || t('pinnedLocationLabel');
      const popupHtml = `<strong>${escapeHtml(title)}</strong>`;
      upsert('__pin__', pinnedLocation.lon, pinnedLocation.lat, PIN_MARKER_HTML, popupHtml);
    }

    const anchors = [];
    if (userPlace) anchors.push({ lat: userPlace.lat, lon: userPlace.lon });
    if (pinnedLocation) anchors.push({ lat: pinnedLocation.lat, lon: pinnedLocation.lon });
    const visibleMarkers = thinMarkers(places, radiusKm, anchors);
    for (const place of visibleMarkers) {
      const isSunny =
        place.weather.condition === 'sunny' || place.weather.condition === 'partly-cloudy';
      const isNight = !place.weather.isDay;
      const html = weatherMarkerHTML(place.weather.icon, isSunny, isNight);
      const resolved = nameOverrides[coordKey(place.lat, place.lon)];
      const title = resolved || place.cityName || `${place.lat.toFixed(2)}°, ${place.lon.toFixed(2)}°`;
      const popupHtml = `<strong>${escapeHtml(title)}</strong><br/>${escapeHtml(place.weather.icon)} ${escapeHtml(place.weather.description)}<br/>${Math.round(place.weather.temperature)}°C — ${escapeHtml(t('clouds', { pct: Math.round(place.weather.cloudCover) }))}`;
      upsert(place.short, place.lon, place.lat, html, popupHtml);
    }

    // Drop any markers no longer in the dataset (e.g. radius shrank)
    for (const [key, entry] of markersRef.current.entries()) {
      if (!seen.has(key)) {
        entry.marker.remove();
        markersRef.current.delete(key);
      }
    }
  }, [places, pinnedLocation, radiusKm, nameOverrides, t]);

  // Cloud-cover overlay (forecast blobs)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const apply = () => {
      const src = map.getSource('cloud-points');
      if (!src) return;
      src.setData(cloudPointsGeoJSON(places));
    };
    if (styleLoadedRef.current) apply();
    else map.once('load', apply);
  }, [places]);

  // Cross-fade between OWM live raster ("Now") and blob forecast (scrubbed
  // forward). OWM's free tier only serves current clouds, so we hand off as
  // soon as the user moves the scrubber off "Now". Both layers stay rendered
  // and we animate their opacity for a smooth transition.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const apply = () => {
      const hasOwm = !!map.getLayer('owm-clouds');
      const isLive = hasOwm && hoursAhead < 0.1;
      if (hasOwm) {
        map.setPaintProperty('owm-clouds', 'raster-opacity', isLive ? 0.9 : 0);
      }
      if (map.getLayer('cloud-blob')) {
        // When OWM is unavailable, blobs always carry the visualization.
        map.setPaintProperty('cloud-blob', 'circle-opacity', hasOwm ? (isLive ? 0 : 1) : 1);
      }
    };
    if (styleLoadedRef.current) apply();
    else map.once('load', apply);
  }, [hoursAhead]);

  // Bounds fingerprint — only changes when the set of points moves (i.e. user
  // location or radius changes), NOT when scrubbing through time.
  const boundsKey = useMemo(() => {
    if (places.length === 0) return null;
    let minLat = Infinity, maxLat = -Infinity, minLon = Infinity, maxLon = -Infinity;
    for (const p of places) {
      if (p.lat < minLat) minLat = p.lat;
      if (p.lat > maxLat) maxLat = p.lat;
      if (p.lon < minLon) minLon = p.lon;
      if (p.lon > maxLon) maxLon = p.lon;
    }
    return `${minLat.toFixed(3)},${maxLat.toFixed(3)},${minLon.toFixed(3)},${maxLon.toFixed(3)}`;
  }, [places]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !boundsKey) return;
    const [minLat, maxLat, minLon, maxLon] = boundsKey.split(',').map(Number);
    const bounds = new maplibregl.LngLatBounds([minLon, minLat], [maxLon, maxLat]);
    map.fitBounds(bounds, {
      padding: 60,
      animate: fittedOnceRef.current,
      duration: 600,
      maxZoom: 11,
    });
    fittedOnceRef.current = true;
  }, [boundsKey]);

  return (
    <div className="weather-map-container" role="region" aria-label={t('weatherMap')}>
      <div className="map-wrapper">
        <div ref={containerRef} className="weather-map" />
      </div>
    </div>
  );
}
