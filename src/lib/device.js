// Lightweight device-class detection for surfacing the right "how to re-enable
// location" instructions. We only need three buckets — the OS Settings path on
// iOS differs from the in-browser permission flow on Android/desktop.
export function detectDevice() {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent || '';
  // iPadOS 13+ reports as Mac; the maxTouchPoints check disambiguates.
  const isIOS = /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (isIOS) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'desktop';
}
