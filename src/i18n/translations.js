export const translations = {
  en: {
    // Header
    title: 'Follow the Sun',
    titleNight: 'Follow the Moon',
    tagline: 'Find the sunshine near you',
    taglineNight: 'The sun will return — find when & where',

    // Welcome
    welcomeMessage: 'Discover where the sun is shining around you',
    findSunshine: 'Find sunshine near me',
    orSearchPlace: 'or search for a place',
    searchPlaceholder: 'Search for a city or place...',

    // Controls
    when: 'When:',
    now: 'Now',
    radius: 'Radius:',
    momentLabel: 'When',
    radiusLabel: 'Radius',
    today: 'Today',
    tomorrow: 'Tomorrow',
    inDays: 'in {n} days',
    hourShort: 'h',
    play: 'Play',
    pause: 'Pause',
    settings: 'Settings',
    languageLabel: 'Language',
    useCurrentLocation: 'Use current location',
    searchLabel: 'Departure',
    searchButton: 'Find sun',
    sunAdvice: 'Sun advice',
    searchFilters: 'Search filters',
    mapAndAlternatives: 'Map and alternatives',
    routeLabel: 'Route',
    routeFromTo: '{from} to {to}',
    openMap: 'Open map',
    topPlaces: 'Top places',
    inRangeNow: 'In range now',
    rankingEmpty: 'No clear sunny spots in range. Try a larger radius or look ahead.',
    sunWindows: 'Sun windows',
    bestDestKicker: 'Best destination',
    youreInSunshineKicker: 'You are in the sun',
    answerCopyHere: '{pct}% chance of sunshine right where you are. {description}.',
    answerCopyAway: '{pct}% sun — about {distance} km away. {description}.',
    weatherSummary: 'Weather summary',
    sunScore: 'Sun score',
    temperature: 'Temperature',
    sky: 'Sky',
    startRoute: 'Get directions',
    openInMaps: 'Open in maps',
    shareAdvice: 'Share',
    shareText: '{city} — {pct}% sunshine, about {distance} km away.',

    // Night state
    nightKicker: 'It\'s night',
    nightCopy: 'The sun is below the horizon in {city}. Sunrise at {time} — in {h}h {m}m.',
    nightCopyShort: 'The sun has set in {city}. Come back at sunrise.',
    sunriseLabel: 'Sunrise',
    planForSunrise: 'Plan for sunrise',
    nightShareText: 'It\'s night in {city} — sun rises at {time}.',

    // Loading & error
    loading: 'Finding the sunshine...',
    errorPrefix: 'Oops!',
    errorHint: 'Make sure location access is enabled in your browser.',
    geoNotSupported: 'Geolocation is not supported by your browser',
    geoDenied: 'Location access was denied.',
    geoDeniedHint: 'On iPhone: go to Settings → Safari → Location and set it to "Allow". Then reload the page.',
    geoTimeout: 'Location request timed out. Please try again.',
    geoUnavailable: 'Your location could not be determined. Please try again.',
    tryAgain: 'Try again',

    // Footer
    footerData: 'Weather data from',
    footerScanning: 'scanning up to ~{radius} km around {location}',
    pinnedLocation: 'pinned location',
    you: 'you',

    // Internal nav (SEO landing pages)
    citiesNavLabel: 'Sun by city',
    homepageLink: 'Home',
    todayLink: 'Sun today',
    weekendLink: 'Sun this weekend',
    aboutLink: 'About',
    contactLink: 'Contact',
    privacyLink: 'Privacy',

    // Location card
    youAreHere: 'You are here',
    sunChance: '{pct}% sun',
    clouds: '{pct}% clouds',
    wind: '{speed} km/h wind',

    // SunMap
    sunshineNearby: 'Sunshine Nearby',
    headThisWay: 'Head this way for sun!',
    headToOne: 'Head to one of these directions for sun!',
    clearSkiesTonight: 'Clear Skies Tonight',
    clearSpotsSubtitle: 'These spots have clear night skies right now.',
    noSunNight: "The sun has set. Try looking ahead in time to find tomorrow's sunshine!",
    noSunDay: 'No sunshine found nearby. Try increasing the radius or looking ahead in time!',
    updating: 'Updating...',

    // WeatherMap
    weatherMap: 'Weather map',
    yourLocation: 'Your Location',
    pinnedLocationLabel: 'Pinned Location',
    loadingLocation: 'Loading...',
    backToMyLocation: 'Back to my location',

    // SunshineGraph
    sunGraphTitle: 'Sunshine forecast for {city}',
    sunChanceLabel: 'sun',
    sunGraphSunny: 'Sunny',
    sunGraphCloudy: 'Cloudy',
    sunGraphNight: 'Night',

    // NearestSunshine
    youreInSunshine: "You're in the sunshine!",
    enjoyClearSkies: 'Enjoy the clear skies right where you are.',
    noSunshineNearby: 'No sunshine nearby',
    cloudyAllAround: 'It\'s cloudy all around you. Try increasing the radius or looking ahead in time!',
    sunStillUp: 'Sun is still up: {place}',
    nightButSun: "It's nighttime here, but the sun is still shining in {place} — about {distance} km away.",
    clearNightSkies: 'Clear night skies',
    nighttime: 'Nighttime',
    clearNightMsg: "The sun has set but the skies are clear. Try looking ahead in time to find tomorrow's sunshine!",
    overcastNightMsg: "It's nighttime and overcast. Try looking ahead in time to find sunshine!",
    nearestSunshine: 'Nearest sunshine: {place}',
    headTo: 'Head to {place} — about {distance} km away. {description}, {temp}°C.',

    // Weather descriptions
    clearSky: 'Clear sky',
    clearNight: 'Clear night',
    partlyCloudy: 'Partly cloudy',
    partlyCloudyNight: 'Partly cloudy night',
    overcast: 'Overcast',
    fog: 'Fog',
    drizzle: 'Drizzle',
    rain: 'Rain',
    snow: 'Snow',
    rainShowers: 'Rain showers',
    snowShowers: 'Snow showers',
    thunderstorm: 'Thunderstorm',
    unknown: 'Unknown',

    // Directions
    north: 'North', northeast: 'Northeast', east: 'East', southeast: 'Southeast',
    south: 'South', southwest: 'Southwest', west: 'West', northwest: 'Northwest',
    far: '(far)',

    // SEO intro text
    seoHeading: 'Find sunshine near you — in real time',
    seoText: 'Waar is er zon? shows you exactly where the sun is shining right now. Live weather data is sampled at dozens of points around you so you can see at a glance which direction is clearest. Planning a day trip, bike ride, or terrace visit? Check the map, set the radius from 10 km up to 500 km, and scrub the timeline to look up to 14 days ahead.',
    seoHeading2: 'How does the sunshine map work?',
    seoText2: 'When you share your location — or click a spot on the map — Waar is er zon? fetches hourly forecast data for dozens of points around you. Each point\'s sunshine chance is derived from cloud cover; fewer clouds means a higher chance of sun. The map combines a live cloud-coverage layer with a 24-hour scrub slider, so you can morph the overlay through the day to see when sun breaks through.',
    seoHeading3: 'When should you use Waar is er zon?',
    seoText3: 'Whether you want to know if it\'s worth driving to the coast, or you\'re looking for a sunny spot for a walk or an afternoon on the terrace — this tool helps you pick the best option. Set the radius from 10 to 500 kilometres and look up to 14 days ahead with day-window presets. That way you know not only where the sun is shining now, but also where the weather will be nice tomorrow, this weekend, or next week. Works across the Netherlands, Belgium, Germany, and the rest of Europe.',
    seoHeading4: 'Free to use, no account required',
    seoText4: 'Waar is er zon? is completely free and works without signing up. Your location stays in your browser and is only sent to our weather provider to fetch forecasts. The site shows ads (Google AdSense) and uses Google Analytics, both of which set cookies — see your browser\'s cookie controls to manage these. Weather data is from Open-Meteo, cloud-coverage tiles from OpenWeatherMap, and city names from GeoNames. Works on phone, tablet, and desktop in Dutch and English.',

    // FAQ
    faqTitle: 'Frequently Asked Questions',
    faqItems: [
      {
        q: 'How does Follow the Sun work?',
        a: 'We use your location (or a location you choose on the map) and fetch real-time weather data from Open-Meteo for dozens of points in all directions around you. For each point, we show the current temperature, cloud cover, sunshine chance, and the nearest city name. Everything updates live as you move the time or radius slider.'
      },
      {
        q: 'Is this app free?',
        a: 'Yes, Follow the Sun is completely free. No account, no ads, no tracking cookies. We use open weather data from Open-Meteo and city data from GeoNames.'
      },
      {
        q: 'How accurate is the sunshine prediction?',
        a: 'We use hourly forecast data from Open-Meteo, which combines multiple weather models. The current conditions are very accurate. Forecasts up to 24 hours ahead are reliable; beyond that, treat them as a general indication.'
      },
      {
        q: 'Can I look ahead in time?',
        a: 'Yes. The 24-hour time scrubber covers a full day at any zoom level, and the day-window presets jump up to 14 days ahead. Combined, you can plan anything from this afternoon to two weeks from now. Note that forecasts beyond about 5 days are an indication rather than a precise prediction.'
      },
      {
        q: 'Does it work outside the Netherlands?',
        a: 'Yes, Follow the Sun works across all of Europe. The weather data covers the entire continent, and our city database includes over 8,000 European cities and towns.'
      },
      {
        q: 'Why does it ask for my location?',
        a: 'Your location is used to center the weather scan around you. It is never stored on our servers — it stays in your browser only. You can also click anywhere on the map to scan a different area without sharing your location.'
      },
    ],
  },

  nl: {
    // Header
    title: 'Waar is er zon?',
    titleNight: 'Volg de maan',
    tagline: 'Vind de zon bij jou in de buurt',
    taglineNight: 'De zon komt terug — ontdek wanneer & waar',

    // Welcome
    welcomeMessage: 'Ontdek waar de zon schijnt bij jou in de buurt',
    findSunshine: 'Vind zonneschijn bij mij',
    orSearchPlace: 'of zoek een plaats',
    searchPlaceholder: 'Zoek een stad of plaats...',

    // Controls
    when: 'Wanneer:',
    now: 'Nu',
    radius: 'Straal:',
    momentLabel: 'Moment',
    radiusLabel: 'Straal',
    today: 'Vandaag',
    tomorrow: 'Morgen',
    inDays: 'over {n} dagen',
    hourShort: 'u',
    play: 'Afspelen',
    pause: 'Pauze',
    settings: 'Instellingen',
    languageLabel: 'Taal',
    useCurrentLocation: 'Gebruik huidige locatie',
    searchLabel: 'Vertrekpunt',
    searchButton: 'Vind zon',
    sunAdvice: 'Zonadvies',
    searchFilters: 'Zoekfilters',
    mapAndAlternatives: 'Kaart en alternatieven',
    routeLabel: 'Route',
    routeFromTo: '{from} naar {to}',
    openMap: 'Open kaart',
    topPlaces: 'Top plekken',
    inRangeNow: 'Nu binnen bereik',
    rankingEmpty: 'Geen duidelijk zonnige plekken in bereik. Probeer een grotere straal of kijk vooruit.',
    sunWindows: 'Zonvensters',
    bestDestKicker: 'Beste bestemming',
    youreInSunshineKicker: 'Je staat in de zon',
    answerCopyHere: '{pct}% kans op zon, precies waar je bent. {description}.',
    answerCopyAway: '{pct}% zon — ongeveer {distance} km verderop. {description}.',
    weatherSummary: 'Weer samenvatting',
    sunScore: 'Zonscore',
    temperature: 'Temperatuur',
    sky: 'Hemel',
    startRoute: 'Start route',
    openInMaps: 'Open in kaart',
    shareAdvice: 'Deel advies',
    shareText: '{city} — {pct}% zon, ongeveer {distance} km verderop.',

    // Night state
    nightKicker: 'Het is nacht',
    nightCopy: 'De zon is onder in {city}. Zonsopkomst om {time} — over {h}u {m}m.',
    nightCopyShort: 'De zon is onder in {city}. Kom terug bij zonsopkomst.',
    sunriseLabel: 'Zonsopkomst',
    planForSunrise: 'Plan voor zonsopkomst',
    nightShareText: 'Het is nacht in {city} — zon komt op om {time}.',

    // Loading & error
    loading: 'Zoeken naar zonneschijn...',
    errorPrefix: 'Oeps!',
    errorHint: 'Zorg dat locatietoegang is ingeschakeld in je browser.',
    geoNotSupported: 'Geolocatie wordt niet ondersteund door je browser',
    geoDenied: 'Locatietoegang is geweigerd.',
    geoDeniedHint: 'Op iPhone: ga naar Instellingen → Safari → Locatie en zet het op "Sta toe". Herlaad daarna de pagina.',
    geoTimeout: 'Locatieverzoek verlopen. Probeer het opnieuw.',
    geoUnavailable: 'Je locatie kon niet worden bepaald. Probeer het opnieuw.',
    tryAgain: 'Probeer opnieuw',

    // Footer
    footerData: 'Weerdata van',
    footerScanning: 'scannen tot ~{radius} km rond {location}',
    pinnedLocation: 'vastgezette locatie',
    you: 'jou',

    // Internal nav (SEO landing pages)
    citiesNavLabel: 'Zon per stad',
    homepageLink: 'Home',
    todayLink: 'Zon vandaag',
    weekendLink: 'Zon dit weekend',
    aboutLink: 'Over',
    contactLink: 'Contact',
    privacyLink: 'Privacy',

    // Location card
    youAreHere: 'Je bent hier',
    sunChance: '{pct}% zon',
    clouds: '{pct}% bewolking',
    wind: '{speed} km/u wind',

    // SunMap
    sunshineNearby: 'Zonneschijn in de buurt',
    headThisWay: 'Ga deze kant op voor zon!',
    headToOne: 'Ga naar een van deze richtingen voor zon!',
    clearSkiesTonight: 'Heldere lucht vanavond',
    clearSpotsSubtitle: 'Deze plekken hebben nu een heldere nachtelijke hemel.',
    noSunNight: 'De zon is onder. Kijk vooruit in de tijd om de zonneschijn van morgen te vinden!',
    noSunDay: 'Geen zon in de buurt. Vergroot de straal of kijk vooruit in de tijd!',
    updating: 'Bijwerken...',

    // WeatherMap
    weatherMap: 'Weerkaart',
    yourLocation: 'Jouw locatie',
    pinnedLocationLabel: 'Vastgezette locatie',
    loadingLocation: 'Laden...',
    backToMyLocation: 'Terug naar mijn locatie',

    // SunshineGraph
    sunGraphTitle: 'Zonnegrafiek voor {city}',
    sunChanceLabel: 'zon',
    sunGraphSunny: 'Zonnig',
    sunGraphCloudy: 'Bewolkt',
    sunGraphNight: 'Nacht',

    // NearestSunshine
    youreInSunshine: 'Je staat in de zon!',
    enjoyClearSkies: 'Geniet van de heldere lucht waar je bent.',
    noSunshineNearby: 'Geen zon in de buurt',
    cloudyAllAround: 'Het is overal bewolkt. Vergroot de straal of kijk vooruit in de tijd!',
    sunStillUp: 'De zon schijnt nog: {place}',
    nightButSun: 'Het is hier nacht, maar de zon schijnt nog in {place} — ongeveer {distance} km verderop.',
    clearNightSkies: 'Heldere nachtelijke hemel',
    nighttime: 'Nacht',
    clearNightMsg: 'De zon is onder maar de lucht is helder. Kijk vooruit in de tijd om de zonneschijn van morgen te vinden!',
    overcastNightMsg: 'Het is nacht en bewolkt. Kijk vooruit in de tijd om zon te vinden!',
    nearestSunshine: 'Dichtstbijzijnde zon: {place}',
    headTo: 'Ga naar {place} — ongeveer {distance} km verderop. {description}, {temp}°C.',

    // Weather descriptions
    clearSky: 'Onbewolkt',
    clearNight: 'Heldere nacht',
    partlyCloudy: 'Licht bewolkt',
    partlyCloudyNight: 'Licht bewolkte nacht',
    overcast: 'Bewolkt',
    fog: 'Mist',
    drizzle: 'Motregen',
    rain: 'Regen',
    snow: 'Sneeuw',
    rainShowers: 'Regenbuien',
    snowShowers: 'Sneeuwbuien',
    thunderstorm: 'Onweer',
    unknown: 'Onbekend',

    // Directions
    north: 'Noord', northeast: 'Noordoost', east: 'Oost', southeast: 'Zuidoost',
    south: 'Zuid', southwest: 'Zuidwest', west: 'West', northwest: 'Noordwest',
    far: '(ver)',

    // SEO intro text
    seoHeading: 'Vind zonneschijn bij jou in de buurt — in real-time',
    seoText: 'Waar is er zon? laat je precies zien waar de zon nu schijnt. Met live weerdata bemonsteren we tientallen punten rondom jou zodat je in één oogopslag ziet welke kant het helderst is. Ben je een dagje uit, fietstocht of terrasbezoek aan het plannen? Bekijk de kaart, stel de straal in van 10 km tot 500 km, en sleep de tijdbalk om tot 14 dagen vooruit te kijken.',
    seoHeading2: 'Hoe werkt de zonnekaart?',
    seoText2: 'Op het moment dat je je locatie deelt — of een plek op de kaart kiest — haalt Waar is er zon? uurlijkse voorspellingsdata op voor tientallen punten in alle richtingen om je heen. Per punt berekenen we de zonkans op basis van de bewolkingsgraad: hoe minder wolken, hoe hoger de kans op zon. De kaart combineert een live wolkenlaag met een 24-uurs schuif waarmee je de bewolking door de dag heen kunt scrubben en kunt zien wanneer de zon doorbreekt.',
    seoHeading3: 'Wanneer gebruik je Waar is er zon?',
    seoText3: 'Of je nu wilt weten of het de moeite waard is om naar de kust te rijden, of je zoekt een zonnig plekje voor een wandeling of terrasje — deze tool helpt je om de beste keuze te maken. Stel de straal in van 10 tot 500 kilometer en kijk tot 14 dagen vooruit met dag-presets. Zo weet je niet alleen waar de zon nu schijnt, maar ook waar het morgen, dit weekend of volgende week mooi weer wordt. Werkt in heel Nederland, België, Duitsland en de rest van Europa.',
    seoHeading4: 'Gratis te gebruiken, zonder account',
    seoText4: 'Waar is er zon? is volledig gratis en werkt zonder registratie. Je locatie blijft in je browser en wordt alleen naar onze weerprovider gestuurd om de voorspelling op te halen. De site toont advertenties (Google AdSense) en gebruikt Google Analytics; beide plaatsen cookies — beheer deze via je browser-instellingen. Weerdata komt van Open-Meteo, wolkentegels van OpenWeatherMap en plaatsnamen uit GeoNames. Werkt op telefoon, tablet en desktop in het Nederlands en Engels.',

    // FAQ
    faqTitle: 'Veelgestelde vragen',
    faqItems: [
      {
        q: 'Hoe werkt Waar is er zon?',
        a: 'We gebruiken je locatie (of een locatie die je op de kaart kiest) en halen real-time weerdata op van Open-Meteo voor tientallen punten in alle richtingen om je heen. Per punt tonen we de huidige temperatuur, bewolking, zonkans en de dichtstbijzijnde plaatsnaam. Alles wordt live bijgewerkt als je de tijd- of straalschuif aanpast.'
      },
      {
        q: 'Is deze app gratis?',
        a: 'Ja, Waar is er zon? is volledig gratis. Geen account, geen advertenties, geen tracking cookies. We gebruiken open weerdata van Open-Meteo en plaatsnamen van GeoNames.'
      },
      {
        q: 'Hoe nauwkeurig is de zonnevoorspelling?',
        a: 'We gebruiken uurlijkse voorspellingsdata van Open-Meteo, dat meerdere weermodellen combineert. De huidige condities zijn zeer nauwkeurig. Voorspellingen tot 24 uur vooruit zijn betrouwbaar; daarna zijn ze een algemene indicatie.'
      },
      {
        q: 'Kan ik vooruit in de tijd kijken?',
        a: 'Ja. De 24-uurs tijdschuif laat je een volledige dag scrubben, en de dag-presets springen tot 14 dagen vooruit. Daarmee plan je alles van vanmiddag tot twee weken vooruit. Voorspellingen voorbij ongeveer 5 dagen zijn meer een indicatie dan een nauwkeurige voorspelling.'
      },
      {
        q: 'Werkt het ook buiten Nederland?',
        a: 'Ja, Waar is er zon? werkt in heel Europa. De weerdata dekt het hele continent en onze plaatsnamen-database bevat meer dan 8.000 Europese steden en dorpen.'
      },
      {
        q: 'Waarom vraagt het om mijn locatie?',
        a: 'Je locatie wordt gebruikt om de weerscan rondom jou te centreren. Deze wordt nooit op onze servers opgeslagen — hij blijft alleen in je browser. Je kunt ook ergens op de kaart klikken om een ander gebied te scannen zonder je locatie te delen.'
      },
    ],
  },
};

export function t(strings, key, replacements = {}) {
  let str = strings[key] || key;
  for (const [k, v] of Object.entries(replacements)) {
    str = str.replace(`{${k}}`, v);
  }
  return str;
}
