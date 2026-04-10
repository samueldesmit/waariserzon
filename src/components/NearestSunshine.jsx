import { useLanguage } from '../i18n/LanguageContext';

export default function NearestSunshine({ places }) {
  const { t } = useLanguage();
  const userPlace = places.find((p) => p.short === 'Here');
  const userIsDay = userPlace?.weather?.isDay;
  const userIsSunny =
    userPlace?.weather?.condition === 'sunny' || userPlace?.weather?.condition === 'partly-cloudy';

  const sunnySpots = places
    .filter((p) => p.short !== 'Here')
    .filter((p) => p.weather?.condition === 'sunny' || p.weather?.condition === 'partly-cloudy')
    .sort((a, b) => a.distance - b.distance);

  // Nighttime at user's location
  if (!userIsDay) {
    const clearNightSpots = places
      .filter((p) => p.short !== 'Here')
      .filter((p) => p.weather?.condition === 'clear-night' || p.weather?.condition === 'partly-cloudy-night')
      .sort((a, b) => a.distance - b.distance);

    if (sunnySpots.length > 0) {
      const nearest = sunnySpots[0];
      return (
        <div className="nearest-sunshine has-sun night-banner" role="status">
          <div className="nearest-icon" aria-hidden="true">🌅</div>
          <div className="nearest-content">
            <h2>{t('sunStillUp', { place: nearest.cityName || nearest.label })}</h2>
            <p>{t('nightButSun', { place: nearest.cityName || nearest.label, distance: nearest.distance })}</p>
          </div>
          <div className="nearest-distance">{nearest.distance} km</div>
        </div>
      );
    }

    const userClearNight =
      userPlace?.weather?.condition === 'clear-night' || userPlace?.weather?.condition === 'partly-cloudy-night';

    return (
      <div className="nearest-sunshine night-banner" role="status">
        <div className="nearest-icon" aria-hidden="true">🌙</div>
        <div className="nearest-content">
          <h2>{userClearNight ? t('clearNightSkies') : t('nighttime')}</h2>
          <p>{userClearNight ? t('clearNightMsg') : t('overcastNightMsg')}</p>
        </div>
      </div>
    );
  }

  if (userIsSunny) {
    return (
      <div className="nearest-sunshine here-sunny" role="status">
        <div className="nearest-icon" aria-hidden="true">☀️</div>
        <div className="nearest-content">
          <h2>{t('youreInSunshine')}</h2>
          <p>{t('enjoyClearSkies')}</p>
        </div>
      </div>
    );
  }

  if (sunnySpots.length === 0) {
    return (
      <div className="nearest-sunshine no-sun" role="status">
        <div className="nearest-icon" aria-hidden="true">☁️</div>
        <div className="nearest-content">
          <h2>{t('noSunshineNearby')}</h2>
          <p>{t('cloudyAllAround')}</p>
        </div>
      </div>
    );
  }

  const nearest = sunnySpots[0];

  return (
    <div className="nearest-sunshine has-sun" role="status">
      <div className="nearest-icon" aria-hidden="true">☀️</div>
      <div className="nearest-content">
        <h2>{t('nearestSunshine', { place: nearest.cityName || nearest.label })}</h2>
        <p>{t('headTo', { place: nearest.cityName || nearest.label, distance: nearest.distance, description: nearest.weather.description, temp: Math.round(nearest.weather.temperature) })}</p>
      </div>
      <div className="nearest-distance">{nearest.distance} km</div>
    </div>
  );
}
