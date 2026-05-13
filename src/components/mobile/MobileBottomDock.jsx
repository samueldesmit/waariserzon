import { useMemo, useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { sunnyUntil } from '../../lib/openMeteo';
import {
  PlayIcon,
  PauseIcon,
  ChevronDownIcon,
  ClockIcon,
  DirectionsIcon,
  ChevronUpIcon,
  SunBadge,
  MoonBadge,
  SunriseIcon,
} from './icons';

const TIME_PRESETS = [
  { value: 0, key: 'now' },
  { value: 24, label: '+1d' },
  { value: 72, label: '+3d' },
  { value: 168, label: '+7d' },
  { value: 336, label: '+14d' },
];

const RADIUS_OPTIONS = [10, 30, 60, 100, 200];

function formatTime(date, lang) {
  return date.toLocaleTimeString(lang === 'nl' ? 'nl-NL' : 'en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function PrimaryDayCard({ best, fromLocation, hoursAhead, onMore }) {
  const { t, lang } = useLanguage();
  const [open, setOpen] = useState(false);

  const sunChance = best.weather.isDay
    ? Math.round(Math.max(0, Math.min(100, 100 - best.weather.cloudCover)))
    : 0;
  const cityName = best.cityName || `${best.lat.toFixed(2)}°, ${best.lon.toFixed(2)}°`;
  const isHere = best.distance === 0;
  const kicker = isHere ? t('youreInSunshineKicker') : t('bestDestKicker');

  const sunWindowLine = useMemo(() => {
    if (!best.weather.isDay || !best.hourly) return null;
    const raw = best.hourly;
    const hours = raw.time.map((tStr, i) => ({
      time: new Date(tStr),
      cloudCover: raw.cloudCover[i],
      isDay: raw.isDay[i] === 1,
    }));
    // eslint-disable-next-line react-hooks/purity
    const momentMs = Date.now() + hoursAhead * 3600 * 1000;
    const sun = sunnyUntil(hours, momentMs);
    if (!sun) return null;
    const time = formatTime(sun.until, lang);
    return t(sun.reason === 'sunset' ? 'sunnyUntilSunset' : 'sunnyUntilClouds', { time });
  }, [best.weather.isDay, best.hourly, hoursAhead, lang, t]);

  const directionsUrl = fromLocation
    ? `https://www.google.com/maps/dir/?api=1&origin=${fromLocation.lat},${fromLocation.lon}&destination=${best.lat},${best.lon}`
    : `https://www.google.com/maps/search/?api=1&query=${best.lat},${best.lon}`;

  return (
    <article
      className={`m-primary m-primary--day ${open ? 'm-primary--open' : ''}`}
      onClick={() => setOpen((v) => !v)}
    >
      <div className="m-primary-head">
        <div className="m-primary-badge"><SunBadge /></div>
        <div className="m-primary-text">
          <span className="kicker">{kicker}</span>
          <strong>{cityName}</strong>
        </div>
        {best.distance > 0 && (
          <span className="m-primary-badge-pill">{best.distance} km</span>
        )}
        <span className="m-primary-chevron"><ChevronDownIcon /></span>
      </div>

      {open && (
        <div className="m-primary-body" onClick={(e) => e.stopPropagation()}>
          <p className="m-primary-copy">
            {isHere
              ? t('answerCopyHere', { pct: sunChance, description: best.weather.description })
              : t('answerCopyAway', { pct: sunChance, distance: best.distance, description: best.weather.description.toLowerCase() })}
          </p>
          {sunWindowLine && (
            <span className="m-primary-pill">
              <ClockIcon />
              {sunWindowLine}
            </span>
          )}
          <div className={`m-primary-actions ${best.distance === 0 ? 'm-primary-actions--single' : ''}`}>
            {best.distance > 0 && (
              <a
                className="m-btn m-btn--sun"
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <DirectionsIcon />
                {t('openInMaps')}
              </a>
            )}
            <button
              type="button"
              className="m-btn m-btn--night"
              onClick={(e) => { e.stopPropagation(); onMore(); }}
            >
              <ChevronUpIcon />
              {t('topPlaces')}
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

function PrimaryNightCard({ cityName, weather, sunriseTime, hoursToSunrise, onSkipToSunrise, onMore }) {
  const { t, lang } = useLanguage();
  const [open, setOpen] = useState(false);
  if (!weather) return null;

  const sunriseLabel = sunriseTime ? formatTime(sunriseTime, lang) : null;
  const totalMinutes = hoursToSunrise != null ? Math.max(0, Math.round(hoursToSunrise * 60)) : null;
  const h = totalMinutes != null ? Math.floor(totalMinutes / 60) : null;
  const m = totalMinutes != null ? totalMinutes % 60 : null;

  return (
    <article
      className={`m-primary m-primary--night ${open ? 'm-primary--open' : ''}`}
      onClick={() => setOpen((v) => !v)}
    >
      <div className="m-primary-head">
        <div className="m-primary-badge m-primary-badge--night"><MoonBadge /></div>
        <div className="m-primary-text">
          <span className="kicker">{t('nightKicker')}</span>
          <strong>{cityName}</strong>
        </div>
        {sunriseLabel && (
          <span className="m-primary-badge-pill m-primary-badge-pill--sun">
            <SunriseIcon />
            {' '}
            {sunriseLabel}
          </span>
        )}
        <span className="m-primary-chevron"><ChevronDownIcon /></span>
      </div>

      {open && (
        <div className="m-primary-body" onClick={(e) => e.stopPropagation()}>
          <p className="m-primary-copy">
            {sunriseLabel
              ? t('nightCopy', { city: cityName, time: sunriseLabel, h, m })
              : t('nightCopyShort', { city: cityName })}
          </p>
          <div className="m-primary-actions">
            {sunriseTime && hoursToSunrise > 0 && onSkipToSunrise && (
              <button
                type="button"
                className="m-btn m-btn--sun"
                onClick={(e) => { e.stopPropagation(); onSkipToSunrise(hoursToSunrise); }}
              >
                <SunriseIcon />
                {t('planForSunrise')}
              </button>
            )}
            <button
              type="button"
              className="m-btn m-btn--night"
              onClick={(e) => { e.stopPropagation(); onMore(); }}
            >
              <ChevronUpIcon />
              {t('topPlaces')}
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

export default function MobileBottomDock({
  hasLocation,
  hoursAhead,
  presetBase,
  sliderValue,
  sliderMax,
  onPresetClick,
  onSliderChange,
  playing,
  onTogglePlay,
  radiusKm,
  onRadiusChange,
  timeLabel,
  isNight,
  bestPlace,
  activeLocation,
  fromName,
  userPlace,
  sunriseTime,
  hoursToSunrise,
  onSkipToSunrise,
  onMore,
}) {
  const { t } = useLanguage();
  if (!hasLocation) return null;

  return (
    <div className="m-bottom">
      <div className="m-controls">
        {/* time scrubber */}
        <div className="m-control-header">
          <span className="label">{t('momentLabel')}</span>
          <strong>{timeLabel}</strong>
        </div>
        <div className="m-scrubber-row">
          <button
            type="button"
            className="m-play"
            onClick={onTogglePlay}
            aria-label={playing ? t('pause') : t('play')}
            aria-pressed={playing}
          >
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>
          <input
            type="range"
            min={0}
            max={sliderMax}
            step={0.1}
            value={sliderValue}
            onChange={(e) => onSliderChange(Number(e.target.value))}
            className="m-scrubber"
            aria-label={t('momentLabel')}
            aria-valuetext={timeLabel}
          />
        </div>
        <div className="m-preset-row" role="group" aria-label={t('momentLabel')}>
          {TIME_PRESETS.map((p) => (
            <button
              key={p.value}
              type="button"
              className={`m-chip m-chip--preset ${presetBase === p.value ? 'is-active' : ''}`}
              onClick={() => onPresetClick(p)}
            >
              {p.key ? t(p.key) : p.label}
            </button>
          ))}
        </div>

        {/* radius */}
        <div className="m-control-header">
          <span className="label">{t('radiusLabel')}</span>
          <strong>{radiusKm} km</strong>
        </div>
        <div className="m-radius-row" role="group" aria-label={t('radiusLabel')}>
          {RADIUS_OPTIONS.map((r) => (
            <button
              key={r}
              type="button"
              className={`m-chip m-chip--radius ${r === radiusKm ? 'is-active' : ''}`}
              onClick={() => onRadiusChange(r)}
              aria-pressed={r === radiusKm}
            >
              {r} km
            </button>
          ))}
        </div>
      </div>

      {isNight ? (
        <PrimaryNightCard
          cityName={fromName || userPlace?.cityName || t('yourLocation')}
          weather={userPlace?.weather}
          sunriseTime={sunriseTime}
          hoursToSunrise={hoursToSunrise}
          onSkipToSunrise={onSkipToSunrise}
          onMore={onMore}
        />
      ) : bestPlace ? (
        <PrimaryDayCard
          best={bestPlace}
          fromLocation={activeLocation}
          hoursAhead={hoursAhead}
          onMore={onMore}
        />
      ) : null}
    </div>
  );
}
