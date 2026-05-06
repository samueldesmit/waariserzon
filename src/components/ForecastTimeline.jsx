import { useMemo } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

const SAMPLES = 9;

export default function ForecastTimeline({ allHours, cityName, hoursAhead = 0 }) {
  const { t } = useLanguage();

  const window = useMemo(() => {
    if (!allHours || allHours.length === 0) return null;
    const startTime = new Date(Date.now() + hoursAhead * 3600 * 1000);
    let startIdx = 0;
    for (let i = 0; i < allHours.length; i++) {
      if (allHours[i].time >= startTime) {
        startIdx = i;
        break;
      }
    }
    if (hoursAhead === 0 && startIdx > 0 && allHours[startIdx].time > startTime) {
      startIdx = Math.max(0, startIdx - 1);
    }
    // 24h window — sample evenly to SAMPLES bars
    const slice = allHours.slice(startIdx, startIdx + 24);
    if (slice.length < SAMPLES) return slice;
    const step = (slice.length - 1) / (SAMPLES - 1);
    const sampled = [];
    for (let i = 0; i < SAMPLES; i++) {
      sampled.push(slice[Math.round(i * step)]);
    }
    return sampled;
  }, [allHours, hoursAhead]);

  if (!window || window.length < 2) return null;

  const labelTimes = window.filter((_, i) => i % 2 === 0);

  return (
    <section className="forecast" aria-label={t('sunWindows')}>
      <div className="section-head">
        <span className="label">{cityName || ''}</span>
        <strong>{t('sunWindows')}</strong>
      </div>
      <div className="timeline" style={{ '--cols': window.length }} aria-hidden="true">
        {window.map((h, i) => {
          const height = Math.max(4, Math.min(100, h.sunChance));
          const cls = !h.isDay ? 'night-bar' : h.sunChance < 25 ? 'low' : '';
          return <i key={i} className={cls} style={{ height: `${height}%` }} />;
        })}
      </div>
      <div className="times">
        {labelTimes.map((h, i) => (
          <span key={i}>{String(h.hour).padStart(2, '0')}</span>
        ))}
      </div>
    </section>
  );
}
