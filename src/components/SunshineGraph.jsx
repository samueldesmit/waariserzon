import { useMemo } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

export default function SunshineGraph({ allHours, cityName, hoursAhead = 0 }) {
  const { t } = useLanguage();

  // Slice 24 hours starting from now + hoursAhead
  const hours = useMemo(() => {
    if (!allHours || allHours.length === 0) return null;

    const startTime = new Date(Date.now() + hoursAhead * 3600 * 1000);
    // Find the first hour >= startTime
    let startIdx = 0;
    for (let i = 0; i < allHours.length; i++) {
      if (allHours[i].time >= startTime) {
        startIdx = i;
        break;
      }
    }
    // If hoursAhead is 0, also include the current hour (go back one if we overshot)
    if (hoursAhead === 0 && startIdx > 0 && allHours[startIdx].time > startTime) {
      startIdx = Math.max(0, startIdx - 1);
    }

    return allHours.slice(startIdx, startIdx + 24);
  }, [allHours, hoursAhead]);

  if (!hours || hours.length < 2) return null;

  const W = 800;
  const H = 180;
  const padLeft = 0;
  const padRight = 0;
  const padTop = 5;
  const padBot = 0;
  const chartW = W - padLeft - padRight;
  const chartH = H - padTop - padBot;
  const n = hours.length;

  // Build SVG area path for sunshine (filled from bottom)
  const points = hours.map((h, i) => ({
    x: padLeft + (i / (n - 1)) * chartW,
    y: padTop + chartH - (h.sunChance / 100) * chartH,
    ...h,
  }));

  // Smooth area path
  const areaPath = buildSmoothArea(points, padTop + chartH);

  // Find the "now" position
  const now = new Date();
  const nowRelative = hoursAhead === 0
    ? (now - hours[0].time) / (hours[n - 1].time - hours[0].time)
    : 0;
  const nowX = padLeft + Math.max(0, Math.min(1, nowRelative)) * chartW;

  // Grid lines at 0%, 50%, 100%
  const gridLines = [0, 50, 100].map((pct) => ({
    y: padTop + chartH - (pct / 100) * chartH,
    label: `${pct}%`,
  }));

  // Time labels — every 2 hours
  const timeLabels = hours.filter((_, i) => i % 2 === 0 || i === n - 1);

  return (
    <div className="sgraph">
      <h2 className="sgraph-title">
        {t('sunGraphTitle', { city: cityName || '' })}
      </h2>
      <div className="sgraph-wrap">
        <svg viewBox={`0 0 ${W} ${H + 28}`} className="sgraph-svg" preserveAspectRatio="none">
          <defs>
            <linearGradient id="sunFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFB800" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#FFD54F" stopOpacity="0.25" />
            </linearGradient>
            <clipPath id="chartClip">
              <rect x={padLeft} y={padTop} width={chartW} height={chartH} />
            </clipPath>
          </defs>

          {/* Grid lines */}
          {gridLines.map((g) => (
            <g key={g.label}>
              <line x1={padLeft} y1={g.y} x2={padLeft + chartW} y2={g.y} stroke="#e0e0e0" strokeWidth="0.5" />
            </g>
          ))}

          {/* Night shading */}
          {hours.map((h, i) => {
            if (h.isDay || i >= n - 1) return null;
            const x1 = padLeft + (i / (n - 1)) * chartW;
            const x2 = padLeft + ((i + 1) / (n - 1)) * chartW;
            return (
              <rect key={`night-${i}`} x={x1} y={padTop} width={x2 - x1} height={chartH} fill="#263238" opacity="0.06" />
            );
          })}

          {/* Area fill */}
          <path d={areaPath} fill="url(#sunFill)" clipPath="url(#chartClip)" />

          {/* Area outline */}
          <polyline
            points={points.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="#FFB800"
            strokeWidth="2"
            strokeLinejoin="round"
            clipPath="url(#chartClip)"
          />

          {/* Now marker */}
          {hoursAhead === 0 && (
            <>
              <line x1={nowX} y1={padTop} x2={nowX} y2={padTop + chartH} stroke="#FF6D00" strokeWidth="1.5" strokeDasharray="4 3" />
              <circle cx={nowX} cy={padTop - 1} r="4" fill="#FF6D00" />
            </>
          )}

          {/* Time labels */}
          {timeLabels.map((h, i) => {
            const idx = hours.indexOf(h);
            const x = padLeft + (idx / (n - 1)) * chartW;
            return (
              <text key={i} x={x} y={H + 16} textAnchor="middle" fontSize="11" fill="#888" fontFamily="Nunito, sans-serif">
                {h.label}
              </text>
            );
          })}
        </svg>

        {/* Y-axis labels */}
        <div className="sgraph-yaxis">
          {gridLines.map((g) => (
            <span key={g.label} style={{ top: `${((g.y) / (H + 28)) * 100}%` }}>{g.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// Build a smooth area path using cardinal spline
function buildSmoothArea(points, baseY) {
  if (points.length < 2) return '';
  const line = smoothLine(points);
  return `${line} L ${points[points.length - 1].x},${baseY} L ${points[0].x},${baseY} Z`;
}

function smoothLine(points) {
  if (points.length < 3) {
    return `M ${points.map((p) => `${p.x},${p.y}`).join(' L ')}`;
  }
  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }
  return d;
}
