export default function NearestSunshine({ places }) {
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

    // Check if there's sunshine somewhere (different timezone further east/west)
    if (sunnySpots.length > 0) {
      const nearest = sunnySpots[0];
      return (
        <div className="nearest-sunshine has-sun night-banner">
          <div className="nearest-icon">🌅</div>
          <div className="nearest-content">
            <h2>Sun is still up: {nearest.label}</h2>
            <p>
              It's nighttime here, but the sun is still shining in{' '}
              <strong>{nearest.label}</strong> — about{' '}
              <strong>{nearest.distance} km</strong> away.
            </p>
          </div>
          <div className="nearest-distance">{nearest.distance} km</div>
        </div>
      );
    }

    const userClearNight =
      userPlace?.weather?.condition === 'clear-night' || userPlace?.weather?.condition === 'partly-cloudy-night';

    return (
      <div className="nearest-sunshine night-banner">
        <div className="nearest-icon">🌙</div>
        <div className="nearest-content">
          <h2>{userClearNight ? 'Clear night skies' : 'Nighttime'}</h2>
          <p>
            {userClearNight
              ? 'The sun has set but the skies are clear. Try looking ahead in time to find tomorrow\'s sunshine!'
              : 'It\'s nighttime and overcast. Try looking ahead in time to find sunshine!'}
          </p>
        </div>
      </div>
    );
  }

  if (userIsSunny) {
    return (
      <div className="nearest-sunshine here-sunny">
        <div className="nearest-icon">☀️</div>
        <div className="nearest-content">
          <h2>You're in the sunshine!</h2>
          <p>Enjoy the clear skies right where you are.</p>
        </div>
      </div>
    );
  }

  if (sunnySpots.length === 0) {
    return (
      <div className="nearest-sunshine no-sun">
        <div className="nearest-icon">☁️</div>
        <div className="nearest-content">
          <h2>No sunshine nearby</h2>
          <p>It's cloudy all around you. Try increasing the radius or looking ahead in time!</p>
        </div>
      </div>
    );
  }

  const nearest = sunnySpots[0];

  return (
    <div className="nearest-sunshine has-sun">
      <div className="nearest-icon">☀️</div>
      <div className="nearest-content">
        <h2>Nearest sunshine: {nearest.label}</h2>
        <p>
          Head to <strong>{nearest.label}</strong> — about{' '}
          <strong>{nearest.distance} km</strong> away.{' '}
          {nearest.weather.description}, {Math.round(nearest.weather.temperature)}°C.
        </p>
      </div>
      <div className="nearest-distance">{nearest.distance} km</div>
    </div>
  );
}
