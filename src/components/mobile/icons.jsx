// SVG icons styled to match the iOS app's SF Symbol set. Each icon takes its
// stroke from `currentColor` so wrapping components control the colour.

export function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function LocateIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}

export function SlidersIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h12M20 18h0M14 4v4M8 10v4M16 16v4" />
    </svg>
  );
}

export function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M7 5.5v13a1 1 0 0 0 1.55.83l10-6.5a1 1 0 0 0 0-1.66l-10-6.5A1 1 0 0 0 7 5.5Z" />
    </svg>
  );
}

export function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <rect x="6.5" y="5" width="4" height="14" rx="1" />
      <rect x="13.5" y="5" width="4" height="14" rx="1" />
    </svg>
  );
}

export function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function ChevronUpIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m6 15 6-6 6 6" />
    </svg>
  );
}

export function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function DirectionsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m13 4 7 8-7 8-7-8 7-8Z" />
      <path d="M9 12h6m0 0-2-2m2 2-2 2" />
    </svg>
  );
}

export function SunBadge() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <linearGradient id="m-sun-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFC341" />
          <stop offset="100%" stopColor="#FF7A1A" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill="#FFF4CF" stroke="#1F2018" strokeWidth="4" />
      <circle cx="50" cy="50" r="22" fill="url(#m-sun-grad)" stroke="#1F2018" strokeWidth="3" />
      <g stroke="#1F2018" strokeWidth="4" strokeLinecap="round">
        <path d="M50 6v10" />
        <path d="M50 84v10" />
        <path d="M6 50h10" />
        <path d="M84 50h10" />
        <path d="m17 17 7 7" />
        <path d="m76 76 7 7" />
        <path d="m17 83 7-7" />
        <path d="m76 24 7-7" />
      </g>
    </svg>
  );
}

// Flat moon-and-stars glyph (uses currentColor) — drawn ON the badge's
// forest-coloured circle background, matching iOS NightCard's
// "moon.stars.fill" SF Symbol. The crescent fills most of the 24×24 viewBox.
export function MoonBadge() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
      <circle cx="6" cy="6.5" r="1.1" />
      <circle cx="9.5" cy="3" r="0.65" />
      <circle cx="4.5" cy="11" r="0.6" />
    </svg>
  );
}

export function SunriseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 18h18" />
      <path d="M5 14a7 7 0 0 1 14 0" />
      <path d="M12 4v4M5 10l2 2M19 10l-2 2" />
    </svg>
  );
}

export function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}
