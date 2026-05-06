import { useLanguage } from '../i18n/LanguageContext';

export default function SunRanking({ places, onSelect }) {
  const { t } = useLanguage();

  return (
    <section className="ranking" aria-label={t('topPlaces')}>
      <div className="section-head">
        <span className="label">{t('topPlaces')}</span>
        <strong>{t('inRangeNow')}</strong>
      </div>
      {places.length === 0 ? (
        <p className="ranking-empty">{t('rankingEmpty')}</p>
      ) : (
        <ol>
          {places.map((p, i) => {
            const sunChance = Math.max(0, Math.min(100, 100 - p.weather.cloudCover));
            const cityName = p.cityName || `${p.lat.toFixed(2)}°, ${p.lon.toFixed(2)}°`;
            return (
              <li
                key={p.short}
                onClick={onSelect ? () => onSelect(p) : undefined}
                style={{ cursor: onSelect ? 'pointer' : 'default' }}
                tabIndex={onSelect ? 0 : -1}
                onKeyDown={(e) => {
                  if (onSelect && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onSelect(p);
                  }
                }}
              >
                <span>{i + 1}</span>
                <div>
                  <strong>{cityName}</strong>
                  <small>{p.distance} km</small>
                </div>
                <b>{sunChance}%</b>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
