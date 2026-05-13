import { useState, useEffect } from 'react';
import WeatherMap from '../WeatherMap';
import MobileTopBar from './MobileTopBar';
import MobileBottomDock from './MobileBottomDock';
import MobileSearchSheet from './MobileSearchSheet';
import MobileDetailsSheet from './MobileDetailsSheet';
import MobileSettingsSheet from './MobileSettingsSheet';
import { useLanguage } from '../../i18n/LanguageContext';
import { detectDevice } from '../../lib/device';
import './mobile.css';

const GEO_DENIED_HINT_KEY = {
  ios: 'geoDeniedHintIOS',
  android: 'geoDeniedHintAndroid',
  desktop: 'geoDeniedHintDesktop',
};

export default function MobileShell({ bag }) {
  const { t, lang, setLang } = useLanguage();
  const {
    active,
    loading,
    error,
    geoError,
    places,
    bestPlace,
    sunnyRanking,
    radiusKm,
    setRadiusKm,
    hoursAhead,
    presetBase,
    sliderValue,
    sliderMax,
    handlePresetClick,
    handleSliderChange,
    playing,
    setPlaying,
    pinnedLocation,
    setPinnedLocation,
    requestLocation,
    activeLocation,
    fromName,
    isNight,
    userPlace,
    sunriseTime,
    hoursToSunrise,
    handleSkipToSunrise,
    timeLabel,
    sunshineHours,
    refreshing,
    searchValue,
    setSearchValue,
    suggestions,
    searching,
    pickSuggestion,
    searchTypingRef,
  } = bag;

  const [searchOpen, setSearchOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  // Becomes true once the user types in the search sheet; resets when the
  // sheet is opened again. Lives here so we don't reset state via effect
  // inside the sheet.
  const [searchDirty, setSearchDirty] = useState(false);
  const openSearch = () => {
    setSearchDirty(false);
    setSearchOpen(true);
  };

  // Tag <html>/<body> while the mobile shell is mounted so global styles can
  // suppress page scroll without inheriting from desktop rules.
  useEffect(() => {
    document.documentElement.classList.add('m-active');
    document.body.classList.add('m-active');
    return () => {
      document.documentElement.classList.remove('m-active');
      document.body.classList.remove('m-active');
    };
  }, []);

  const handleLocate = () => {
    if (pinnedLocation) setPinnedLocation(null);
    requestLocation();
  };

  const handlePickSearch = (s) => {
    pickSuggestion(s);
    setSearchOpen(false);
  };

  return (
    <div className="m-app">
      <div className="m-map">
        {active && (
          <WeatherMap
            places={places}
            radiusKm={radiusKm}
            pinnedLocation={pinnedLocation}
            onPinLocation={setPinnedLocation}
            hoursAhead={hoursAhead}
          />
        )}
      </div>

      <MobileTopBar
        label={fromName}
        onSearch={openSearch}
        onLocate={handleLocate}
        onSettings={() => setSettingsOpen(true)}
      />

      {/* The pinned location is surfaced via the search pill (which shows the
          active city name) and the locate icon button (taps back to GPS), so
          the desktop's standalone "back to my location" badge is omitted. */}

      {active && refreshing && (
        <div className="m-refreshing">
          <span className="m-refreshing-spinner" />
          <span>{t('updating')}</span>
        </div>
      )}

      {!active && (
        <div className="m-overlay">
          <div className="m-overlay-card">
            <p>{t('welcomeMessage')}</p>
            <button type="button" className="m-btn m-btn--sun" onClick={requestLocation}>
              {t('findSunshine')}
            </button>
          </div>
        </div>
      )}

      {active && loading && (
        <div className="m-overlay">
          <div className="m-overlay-card">
            <span className="m-loading-spinner" aria-hidden="true" />
            <p>{t('loading')}</p>
          </div>
        </div>
      )}

      {active && error && (
        <div className="m-overlay">
          <div className="m-overlay-card">
            {geoError === 'PERMISSION_DENIED' ? (
              <>
                <p>{t('geoDenied')}</p>
                <p className="m-overlay-hint">
                  {t(GEO_DENIED_HINT_KEY[detectDevice()] || 'geoDeniedHint')}
                </p>
              </>
            ) : geoError === 'TIMEOUT' ? (
              <p>{t('geoTimeout')}</p>
            ) : geoError === 'UNAVAILABLE' ? (
              <p>{t('geoUnavailable')}</p>
            ) : (
              <>
                <p>{t('errorPrefix')} {error}</p>
                <p className="m-overlay-hint">{t('errorHint')}</p>
              </>
            )}
            <button type="button" className="m-btn m-btn--sun" onClick={requestLocation}>
              {t('tryAgain')}
            </button>
          </div>
        </div>
      )}

      {active && !loading && !error && (places.length > 0) && (
        <MobileBottomDock
          hasLocation
          hoursAhead={hoursAhead}
          presetBase={presetBase}
          sliderValue={sliderValue}
          sliderMax={sliderMax}
          onPresetClick={handlePresetClick}
          onSliderChange={handleSliderChange}
          playing={playing}
          onTogglePlay={() => setPlaying((p) => !p)}
          radiusKm={radiusKm}
          onRadiusChange={setRadiusKm}
          timeLabel={timeLabel}
          isNight={isNight}
          bestPlace={bestPlace}
          activeLocation={activeLocation}
          fromName={fromName}
          userPlace={userPlace}
          sunriseTime={sunriseTime}
          hoursToSunrise={hoursToSunrise}
          onSkipToSunrise={handleSkipToSunrise}
          onMore={() => setDetailsOpen(true)}
        />
      )}

      <MobileSearchSheet
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        query={searchValue}
        onQueryChange={(v) => {
          searchTypingRef.current = true;
          setSearchDirty(true);
          setSearchValue(v);
        }}
        results={suggestions}
        searching={searching}
        onPick={handlePickSearch}
        onLocate={handleLocate}
        dirty={searchDirty}
      />

      <MobileDetailsSheet
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        ranking={sunnyRanking}
        onPickRanked={(p) => {
          setPinnedLocation({
            lat: p.lat,
            lon: p.lon,
            name: p.cityName,
            cityName: p.cityName,
          });
        }}
        sunshineHours={sunshineHours}
        hoursAhead={hoursAhead}
        cityName={userPlace?.cityName}
      />

      <MobileSettingsSheet
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        lang={lang}
        setLang={setLang}
      />
    </div>
  );
}
