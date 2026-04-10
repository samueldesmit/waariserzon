import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

function createWeatherIcon(emoji, isSunny, isNight) {
  const cls = isNight ? 'marker-night' : isSunny ? 'marker-sunny' : 'marker-cloudy';
  return L.divIcon({
    className: 'weather-marker',
    html: `<div class="marker-bubble ${cls}">${emoji}</div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22],
  });
}

function createUserIcon() {
  return L.divIcon({
    className: 'weather-marker',
    html: `<div class="marker-bubble marker-user">📍</div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22],
  });
}

function createPinIcon() {
  return L.divIcon({
    className: 'weather-marker',
    html: `<div class="marker-bubble marker-pin">📌</div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22],
  });
}

function FitBounds({ places }) {
  const map = useMap();
  useEffect(() => {
    if (places.length > 0) {
      const bounds = L.latLngBounds(places.map((p) => [p.lat, p.lon]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [places, map]);
  return null;
}

function MapClickHandler({ onPinLocation }) {
  useMapEvents({
    click(e) {
      onPinLocation({ lat: e.latlng.lat, lon: e.latlng.lng });
    },
  });
  return null;
}

export default function WeatherMap({ places, radiusKm = 60, pinnedLocation, onPinLocation }) {
  const userPlace = places.find((p) => p.short === 'Here');
  const nearby = places.filter((p) => p.short !== 'Here');
  const center = userPlace ? [userPlace.lat, userPlace.lon] : [0, 0];
  const radiusMeters = radiusKm * 1000;

  const circleCenter = pinnedLocation
    ? [pinnedLocation.lat, pinnedLocation.lon]
    : userPlace
      ? [userPlace.lat, userPlace.lon]
      : null;

  return (
    <div className="weather-map-container">
      <div className="map-wrapper">
        {pinnedLocation && onPinLocation && (
          <div className="map-pin-overlay">
            <span className="map-pin-name">{pinnedLocation.name || 'Loading...'}</span>
            <button className="map-back-btn" onClick={() => onPinLocation(null)}>
              Back to my location
            </button>
          </div>
        )}
        <MapContainer center={center} zoom={10} className="weather-map" scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds places={places} />
          {onPinLocation && <MapClickHandler onPinLocation={onPinLocation} />}

          {/* Radius circle */}
          {circleCenter && (
            <Circle
              center={circleCenter}
              radius={radiusMeters}
              pathOptions={{
                color: pinnedLocation ? '#E040FB' : '#FFB800',
                fillColor: pinnedLocation ? '#E040FB' : '#FFB800',
                fillOpacity: 0.12,
                weight: 2,
                dashArray: '8 5',
              }}
            />
          )}

          {/* User marker (always shown) */}
          {userPlace && (
            <Marker position={[userPlace.lat, userPlace.lon]} icon={createUserIcon()}>
              <Popup>
                <strong>{pinnedLocation ? 'Pinned Location' : 'Your Location'}</strong>
                <br />
                {userPlace.weather?.icon} {userPlace.weather?.description}
                <br />
                {userPlace.weather && `${Math.round(userPlace.weather.temperature)}°C`}
              </Popup>
            </Marker>
          )}

          {/* Pinned location marker */}
          {pinnedLocation && (
            <Marker position={[pinnedLocation.lat, pinnedLocation.lon]} icon={createPinIcon()}>
              <Popup>
                <strong>{pinnedLocation.name || 'Pinned Location'}</strong>
                <br />
                {pinnedLocation.lat.toFixed(4)}, {pinnedLocation.lon.toFixed(4)}
              </Popup>
            </Marker>
          )}

          {/* Nearby weather markers */}
          {nearby.map((place) => {
            if (!place.weather) return null;
            const isSunny =
              place.weather.condition === 'sunny' || place.weather.condition === 'partly-cloudy';
            const isNight = !place.weather.isDay;
            return (
              <Marker
                key={place.short}
                position={[place.lat, place.lon]}
                icon={createWeatherIcon(place.weather.icon, isSunny, isNight)}
              >
                <Popup>
                  <strong>{place.label}</strong>
                  <br />
                  {place.weather.icon} {place.weather.description}
                  <br />
                  {Math.round(place.weather.temperature)}°C — {place.weather.cloudCover}% clouds
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
