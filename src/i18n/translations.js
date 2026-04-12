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
    seoText: 'Follow the Sun shows you exactly where the sun is shining right now. Using live weather data, we scan dozens of locations around you and display the sunshine chance for every nearby city. Planning a day trip, bike ride, or beach visit? Check the map, adjust the radius up to 500 km, and look ahead up to 3 days to find the best weather window.',
    seoHeading2: 'How does the sunshine map work?',
    seoText2: 'The moment you share your location — or pick a spot on the map — Follow the Sun fetches real-time weather data for dozens of points in every direction around you. For each point we calculate the sunshine chance based on cloud cover. Fewer clouds means a higher chance of sun. Results appear instantly on the interactive map and as clear cards per city, including temperature, wind speed, and an hourly sunshine graph.',
    seoHeading3: 'When should you use Follow the Sun?',
    seoText3: 'Whether you want to know if it\'s worth driving to the beach, or you\'re looking for a sunny spot for a walk or an afternoon on the terrace — this tool helps you pick the best option. Set the radius from 10 to 500 kilometres and check the weather up to 3 days ahead. That way you know not only where the sun is shining now, but also where the weather will be nice tomorrow or the day after. Perfect for day trips across the Netherlands, Belgium, or Germany.',
    seoHeading4: 'Free, no account, no ads',
    seoText4: 'Follow the Sun is completely free and works without signing up. We don\'t store your location and we don\'t use tracking cookies. Weather data comes from Open-Meteo, an open-source weather API, and city names from the GeoNames database. The site works on phone, tablet, and desktop and is available in Dutch and English.',

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
        a: 'Yes! Use the time slider to look up to 3 days (72 hours) into the future. This is perfect for planning a weekend trip or finding the best time to go outside.'
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
    seoText: 'Waar is er zon? laat je precies zien waar de zon nu schijnt. Met live weerdata scannen we tientallen locaties rondom jou en tonen de zonkans per stad. Ben je een dagje uit, fietstocht of strandbezoek aan het plannen? Bekijk de kaart, stel de straal in tot 500 km en kijk tot 3 dagen vooruit om het beste weermoment te vinden.',
    seoHeading2: 'Hoe werkt de zonnekaart?',
    seoText2: 'Op het moment dat je je locatie deelt — of een plek op de kaart kiest — haalt Waar is er zon? actuele weerdata op voor tientallen punten in alle richtingen om je heen. Per punt berekenen we de zonkans op basis van de bewolkingsgraad. Hoe minder wolken, hoe hoger de zonkans. De resultaten zie je direct terug op de interactieve kaart en als overzichtelijke kaarten per stad, compleet met temperatuur, windsnelheid en een zonnegrafiek die het verloop van de zon per uur laat zien.',
    seoHeading3: 'Wanneer gebruik je Waar is er zon?',
    seoText3: 'Of je nu wilt weten of het de moeite waard is om naar het strand te rijden, of je zoekt een zonnige plek voor een wandeling of terrasje — deze tool helpt je om de beste keuze te maken. Stel de straal in van 10 tot 500 kilometer en bekijk het weer tot 3 dagen vooruit. Zo weet je niet alleen waar de zon nu schijnt, maar ook waar het morgen of overmorgen mooi weer wordt. Ideaal voor dagjes uit in Nederland, België of Duitsland.',
    seoHeading4: 'Gratis, zonder account, zonder advertenties',
    seoText4: 'Waar is er zon? is volledig gratis en werkt zonder registratie. We slaan je locatie niet op en plaatsen geen tracking cookies. De weerdata komt van Open-Meteo, een open-source weer-API, en de plaatsnamen uit de GeoNames-database. De site werkt op telefoon, tablet en desktop en is beschikbaar in het Nederlands en Engels.',

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
        a: 'Ja! Gebruik de tijdschuif om tot 3 dagen (72 uur) vooruit te kijken. Ideaal om een weekenduitje te plannen of het beste moment te vinden om naar buiten te gaan.'
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
