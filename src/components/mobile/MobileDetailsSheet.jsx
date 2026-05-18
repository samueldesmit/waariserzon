import { useMemo } from 'react';
import Sheet from './Sheet';
import { useLanguage } from '../../i18n/LanguageContext';

const SAMPLES = 9;

function sampleTimeline(allHours, hoursAhead) {
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
  const slice = allHours.slice(startIdx, startIdx + 24);
  if (slice.length < SAMPLES) return slice;
  const step = (slice.length - 1) / (SAMPLES - 1);
  const out = [];
  for (let i = 0; i < SAMPLES; i++) out.push(slice[Math.round(i * step)]);
  return out;
}

export default function MobileDetailsSheet({
  open,
  onClose,
  ranking,
  onPickRanked,
  sunshineHours,
  hoursAhead,
  cityName,
}) {
  const { t } = useLanguage();

  const timelineWindow = useMemo(
    () => sampleTimeline(sunshineHours, hoursAhead),
    [sunshineHours, hoursAhead],
  );
  const labelTimes = timelineWindow ? timelineWindow.filter((_, i) => i % 2 === 0) : [];

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={t('topPlaces')}
      detent="large"
      rightAction={
        <button type="button" className="m-sheet-action" onClick={onClose}>{t('done')}</button>
      }
    >
      <section className="m-section">
        <h3>{t('inRangeNow')}</h3>
        {ranking.length === 0 ? (
          <p className="m-rank-empty">{t('rankingEmpty')}</p>
        ) : (
          <ol className="m-rank-list">
            {ranking.map((p, i) => {
              const sunChance = p.weather.isDay
                ? Math.round(Math.max(0, Math.min(100, 100 - p.weather.cloudCover)))
                : 0;
              const name = p.cityName || `${p.lat.toFixed(2)}°, ${p.lon.toFixed(2)}°`;
              return (
                <li key={p.short}>
                  <button
                    type="button"
                    className="m-rank-row"
                    onClick={() => {
                      onPickRanked(p);
                      onClose();
                    }}
                  >
                    <span>{i + 1}</span>
                    <div>
                      <strong>{name}</strong>
                      <small>{p.distance} km</small>
                    </div>
                    <b>{sunChance}%</b>
                  </button>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      {timelineWindow && timelineWindow.length >= 2 && (
        <section className="m-section">
          <h3>{t('sunWindows')}{cityName ? ` — ${cityName}` : ''}</h3>
          <div className="m-timeline" style={{ '--cols': timelineWindow.length }} aria-hidden="true">
            {timelineWindow.map((h, i) => {
              const height = Math.max(4, Math.min(100, h.sunChance));
              const cls = !h.isDay ? 'night' : h.sunChance < 25 ? 'low' : '';
              return <i key={i} className={cls} style={{ height: `${height}%` }} />;
            })}
          </div>
          <div className="m-times">
            {labelTimes.map((h, i) => (
              <span key={i}>{String(h.hour).padStart(2, '0')}</span>
            ))}
          </div>
        </section>
      )}
    </Sheet>
  );
}
