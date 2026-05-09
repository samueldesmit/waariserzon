// Shared helpers for talking to api.open-meteo.com.
//
// Open-Meteo's free tier rate-limits per IP (≈600/min, 5k/hour, 10k/day) and
// counts each lat/lon pair in a multi-location request as a separate call.
// fetchOpenMeteo retries on 429 with exponential backoff + jitter and honors
// the Retry-After header when present.

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 600;

function parseRetryAfter(header) {
  if (!header) return null;
  const seconds = Number(header);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const date = Date.parse(header);
  if (Number.isFinite(date)) return Math.max(0, date - Date.now());
  return null;
}

function backoff(attempt) {
  const exp = BASE_DELAY_MS * 2 ** attempt;
  return exp + Math.random() * exp;
}

export async function fetchOpenMeteo(url, { signal } = {}) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch(url, { signal });
    if (res.status !== 429) {
      if (!res.ok) throw new Error(`Weather API request failed (${res.status})`);
      return res.json();
    }
    if (attempt === MAX_RETRIES) {
      throw new Error('Weather API rate limited');
    }
    const wait = parseRetryAfter(res.headers.get('Retry-After')) ?? backoff(attempt);
    await new Promise((resolve, reject) => {
      const timer = setTimeout(resolve, wait);
      if (signal) {
        signal.addEventListener(
          'abort',
          () => {
            clearTimeout(timer);
            reject(new DOMException('Aborted', 'AbortError'));
          },
          { once: true },
        );
      }
    });
  }
  throw new Error('Weather API rate limited');
}

// Bucket forecastDays so small changes (e.g. preset jumps) reuse the same
// cached snapshot instead of triggering a fresh request.
export function bucketForecastDays(days) {
  if (days <= 4) return 4;
  if (days <= 8) return 8;
  return 16;
}
