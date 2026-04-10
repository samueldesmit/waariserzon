export default function LocationCard({ place, isUser }) {
  if (!place.weather) return null;

  const isSunny = place.weather.condition === 'sunny' || place.weather.condition === 'partly-cloudy';
  const isNight = !place.weather.isDay;

  return (
    <div className={`location-card ${isSunny ? 'sunny' : 'not-sunny'} ${isNight ? 'night' : ''} ${isUser ? 'is-user' : ''}`}>
      {isUser && <div className="you-badge">You are here</div>}
      <div className="card-icon">{place.weather.icon}</div>
      <h3 className="card-direction">{place.label}</h3>
      <p className="card-description">{place.weather.description}</p>
      <div className="card-stats">
        <span className="stat">{Math.round(place.weather.temperature)}°C</span>
        <span className="stat">{place.weather.cloudCover}% clouds</span>
      </div>
      <div className="card-meta">
        <span className="card-wind">{place.weather.windSpeed} km/h wind</span>
        {!isUser && place.distance > 0 && (
          <span className="card-distance">~{place.distance} km</span>
        )}
      </div>
    </div>
  );
}
