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

// Given the hourly array produced by useSunshineHourly and a reference time,
// return the first hour that breaks the current sunny streak. Returns null if
// we're not currently sunny (night or already cloudy) or if the forecast
// horizon runs out before the streak breaks — both are signals to stay silent
// rather than over-promise.
export function sunnyUntil(hours, nowMs, { cloudThreshold = 40 } = {}) {
  if (!hours || hours.length === 0) return null;
  let startIdx = -1;
  for (let i = 0; i < hours.length; i++) {
    if (hours[i].time.getTime() <= nowMs) startIdx = i;
    else break;
  }
  if (startIdx === -1) return null;
  const current = hours[startIdx];
  if (!current.isDay || current.cloudCover > cloudThreshold) return null;
  for (let i = startIdx + 1; i < hours.length; i++) {
    const h = hours[i];
    if (!h.isDay) return { until: h.time, reason: 'sunset' };
    if (h.cloudCover > cloudThreshold) return { until: h.time, reason: 'clouds' };
  }
  return null;
}
