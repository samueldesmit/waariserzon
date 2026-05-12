// Place search for the header input. PDOK Locatieserver (Dutch national
// geocoder) is queried first — it's free, key-less, and resolves NL street +
// postcode + house-number queries down to a few meters. If PDOK returns
// nothing and a Mapbox token is configured, we fall back to Mapbox geocoding
// for international queries.

const PDOK_URL = 'https://api.pdok.nl/bzk/locatieserver/search/v3_1/free';
const PDOK_REVERSE_URL = 'https://api.pdok.nl/bzk/locatieserver/search/v3_1/reverse';
const MAPBOX_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places';
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// PDOK returns a WKT POINT, e.g. "POINT(4.89707 52.37403)".
function parseWktPoint(wkt) {
  if (!wkt) return null;
  const match = /POINT\(([-\d.]+)\s+([-\d.]+)\)/.exec(wkt);
  if (!match) return null;
  return { lon: Number(match[1]), lat: Number(match[2]) };
}

async function searchPdok(query, { signal, limit = 6 } = {}) {
  // Restrict to the types that map to a useful pin. We exclude provinces,
  // municipalities (gemeente) and country-level so users get streets/towns
  // rather than huge polygons.
  const fq = 'type:(adres OR weg OR woonplaats OR postcode)';
  const params = new URLSearchParams({
    q: query,
    rows: String(limit),
    fl: 'id,weergavenaam,type,centroide_ll,straatnaam,woonplaatsnaam,huisnummer,postcode',
    fq,
  });
  const res = await fetch(`${PDOK_URL}?${params.toString()}`, { signal });
  if (!res.ok) return [];
  const data = await res.json();
  const docs = data?.response?.docs ?? [];
  return docs
    .map((doc) => {
      const coords = parseWktPoint(doc.centroide_ll);
      if (!coords) return null;
      const cityName = doc.woonplaatsnaam || doc.straatnaam || doc.weergavenaam;
      return {
        id: `pdok:${doc.id}`,
        name: doc.weergavenaam,
        label: doc.weergavenaam,
        cityName,
        type: doc.type,
        lat: coords.lat,
        lon: coords.lon,
        source: 'pdok',
      };
    })
    .filter(Boolean);
}

async function searchMapbox(query, { signal, lang = 'nl', limit = 5 } = {}) {
  if (!MAPBOX_TOKEN) return [];
  const params = new URLSearchParams({
    access_token: MAPBOX_TOKEN,
    autocomplete: 'true',
    limit: String(limit),
    language: lang,
    types: 'place,locality,neighborhood,address,postcode',
  });
  const url = `${MAPBOX_URL}/${encodeURIComponent(query)}.json?${params.toString()}`;
  const res = await fetch(url, { signal });
  if (!res.ok) return [];
  const data = await res.json();
  const features = data?.features ?? [];
  return features
    .map((feat) => {
      const [lon, lat] = feat.center ?? [];
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
      // Mapbox returns the city/place at the end of `context`; fall back to
      // the feature text itself for place-type features.
      const placeCtx = (feat.context ?? []).find((c) => c.id?.startsWith('place'));
      const cityName = placeCtx?.text || feat.text || feat.place_name;
      return {
        id: `mapbox:${feat.id}`,
        name: feat.place_name,
        label: feat.place_name,
        cityName,
        type: feat.place_type?.[0] ?? 'place',
        lat,
        lon,
        source: 'mapbox',
      };
    })
    .filter(Boolean);
}

// PDOK first, Mapbox fallback. We only call Mapbox when PDOK has no hits —
// for NL queries PDOK is more precise and saves a network round-trip.
export async function searchPlaces(query, { signal, lang = 'nl' } = {}) {
  const q = query.trim();
  if (q.length < 2) return [];
  try {
    const pdok = await searchPdok(q, { signal });
    if (pdok.length > 0) return pdok;
    return await searchMapbox(q, { signal, lang });
  } catch (err) {
    if (err?.name === 'AbortError') throw err;
    return [];
  }
}

// Reverse geocoding cache. Key is lat,lon rounded to 4 decimals (~11m) so
// minor GPS jitter still hits the cache.
const reverseCache = new Map();

function reverseKey(lat, lon) {
  return `${lat.toFixed(4)},${lon.toFixed(4)}`;
}

async function reverseFromPdok(lat, lon, { signal }) {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    type: 'woonplaats',
    rows: '1',
    fl: 'woonplaatsnaam,weergavenaam',
  });
  const res = await fetch(`${PDOK_REVERSE_URL}?${params.toString()}`, { signal });
  if (!res.ok) return null;
  const data = await res.json();
  const doc = data?.response?.docs?.[0];
  return doc?.woonplaatsnaam || null;
}

async function reverseFromMapbox(lat, lon, { signal, lang }) {
  if (!MAPBOX_TOKEN) return null;
  const params = new URLSearchParams({
    access_token: MAPBOX_TOKEN,
    types: 'place',
    limit: '1',
    language: lang,
  });
  const url = `${MAPBOX_URL}/${lon},${lat}.json?${params.toString()}`;
  const res = await fetch(url, { signal });
  if (!res.ok) return null;
  const data = await res.json();
  const feat = data?.features?.[0];
  return feat?.text || null;
}

// Look up the actual city/woonplaats for given coordinates. PDOK is checked
// first (it covers all NL places, not just the bundled CITIES list); if PDOK
// can't resolve (e.g. outside NL), we fall back to Mapbox when a token is
// configured. Returns null when nothing resolves so the caller can fall back
// to its own heuristic.
export async function reverseGeocode(lat, lon, { signal, lang = 'nl' } = {}) {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  const key = reverseKey(lat, lon);
  if (reverseCache.has(key)) return reverseCache.get(key);
  try {
    let name = await reverseFromPdok(lat, lon, { signal });
    if (!name) name = await reverseFromMapbox(lat, lon, { signal, lang });
    reverseCache.set(key, name);
    return name;
  } catch (err) {
    if (err?.name === 'AbortError') throw err;
    return null;
  }
}
