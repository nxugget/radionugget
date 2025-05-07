// locales/en.ts
export default {
  home: "Home",
  notFound: "Not found",
  address: {
    placeholder: "Enter a city or address...",
    example: "Example: Reykjavik or Area 51"
  },
  gridSquare: {
    directSearchPlaceholder: "Grid square search...",
    invalid: "Invalid grid square"
  },
  navbar: {
    home: "Home",
    blog: "Blog",
    tools: "Tools",
    gridSquare: "GridSquare",
    satellitePrediction: "PrediSat",
    satelliteInfo: "AreaSat",
    gallery: "Gallery",
    english: "English",
    french: "Français"
  },
  gridSquareInfo: {
    question: "What is a Grid Square?",
    description1: "A Grid Square is a coordinate system used by amateur radio operators to precisely locate a point on Earth.",
    description2: "Instead of precise GPS coordinates like 37°14'3.60\" N -115°48'23.99\" W, we simply say DM27bf. This is much more convenient :).",
    description3: "Grid squares divide the globe into 324 large areas (10° by 20°), each subdivided into 100 squares. Additional letters further refine your position by subdividing each square.",
  },
  gridSquareCalculator: {
    calculator: "Calculator"
  },
  projectsSection: {
    title: "Selection of my projects",
    weatherSatelliteStation: "Weather Satellite Station",
    satellitePrediction: "Satellite Prediction",
    decodingSignal: "Decoding signal",
    satelliteExplorer: "Satellite Explorer",
    homemadeQfhAntenna: "Homemade QFH antenna",
    sstvReception: "SSTV reception",
    gridSquareCalculator: "Grid Square calculator",
    airTrafficCommunication: "Air traffic communication"
  },
  footer: {
    thanks: "Thanks",
    illustration: "for the homepage illustration",
    madeWith: "Made with",
    by: "by",
    myself: "myself"
  },
  locationError: "Could not access your location",
  useMyLocation: "Use my current location",
  or: "OR", // Ajout de la traduction pour "OU" en anglais
  betaDescription: "This tool is in beta version. If you notice any bugs or have improvement ideas, I am extremely open and responsive :) You can send me an email at this address: contact@radionugget.com",
  satellites: {
    explorer: {
      title: "Area Satellite",
      loading: "Loading...",
      searchPlaceholder: "Search for a satellite...",
      lastUpdate: "Last update:",
      lastTleUpdate: "Last TLE update:",
      lastTransmitterUpdate: "Last transmitter update:", // Ajouté
      noDescription: "No description available at the moment.",
      status: "Status:",
      frequency: "Frequency:",
      photoNA: "Photo NA",
      source: "Source",
      focusMode: "Focus Mode",
      exitFocus: "Exit Focus",
      polarChart: "PolarChart",
      elevation: "Elevation:",
      azimuth: "Azimuth:",
      enterValidGridSquare: "Enter a valid Grid Square",
      gridSquareLabel: "GridSquare:",
      setGrid: "Set Grid",
      invalidGridSquare: "Invalid grid square",
      satMap: "SatMap",
      tleTitle: "TLE",
      transponders: "Transmitters"
    },
    countdown: {
      losIn: "LOS in",
      aosIn: "AOS in",
      noPassPredicted: "No pass predicted",
      noPassNext24h: "No pass predicted (next 24h)"
    },
    tle: {
      lineNumber1: "Line Number (always 1)",
      catalogNumber: "Satellite Catalog Number (NORAD ID)",
      classification: "Classification (U = Unclassified)",
      launchYear: "International Designator (Launch Year)",
      launchNumber: "International Designator (Launch Number)",
      launchPiece: "International Designator (Piece of the launch)",
      intlDesignatorYear: "International Designator (Launch Year)",  // ajout
      intlDesignatorLaunchNumber: "International Designator (Launch Number)",  // ajout
      intlDesignatorPiece: "International Designator (Piece of the launch)",  // ajout
      epochYear: "Epoch Year (Last two digits of the year)",
      epochDay: "Epoch (Day of year plus fractional portion)",
      firstTimeDerivative: "First Time Derivative of Mean Motion (rev/day²)",
      secondTimeDerivative: "Second Time Derivative of Mean Motion (decimal point assumed, rev/day³)",
      bstarDrag: "BSTAR drag term (decimal point assumed)",
      ephemerisType: "Ephemeris Type",
      elementSetNumber: "Element Set Number",
      lineNumber2: "Line Number (always 2)",
      inclination: "Inclination (degrees)",
      rightAscension: "Right Ascension of the Ascending Node (degrees)",
      eccentricity: "Eccentricity (decimal point assumed)",
      argumentOfPerigee: "Argument of Perigee (degrees)",
      meanAnomaly: "Mean Anomaly (degrees)",
      meanMotion: "Mean Motion (orbits per day)",
      revolutionNumber: "Revolution Number at Epoch",
      checksum: "Checksum (modulo 10)", // Added for TLE
      noInfo: "No info"
    },
    transmitter: { 
      uplink: "Uplink",
      downlink: "Downlink",
      beacon: "Beacon",
      mode: "Mode",
      active: "Active",
      inactive: "Inactive"
    }
  },
  cookies: {
    message: "To save your favorites and your position, this page uses cookies. These are stored only on your device and no one else will have access to them :)",
    accept: "Accept"
  },
  and: "and", // Added for "Powered by"
  satellite: {
    name: "Satellite",
    prediction: "Prediction",
    predictableSatellites: "Predictable Satellites",
    satellitesToPredict: "Satellites to Predict",
    chooseYourPosition: "Choose Your Position",
    cityPlaceholder: "City (e.g. Reykjavik)",
    gridSquarePlaceholder: "Grid Square (e.g. DM27bf)",
    latitude: "Latitude",
    longitude: "Longitude",
    coordinatesExplanation: "Negative values indicate South for latitude and West for longitude.",
    minElevation: "Minimum Elevation (°)",
    predict: "PREDICT",
    errorNoSelection: "Please select at least one satellite.",
    errorFetchingPredictions: "Error retrieving predictions.",
    addSelected: "Add selected satellite",
    removeSelected: "Remove selected satellite",
    cleanAll: "Clean All",
    addToFavorites: "Add to favorites",
    search: "Search...",
    searchPlaceholder: "Search satellites...", // Added missing translation
    toggleFavorites: "Toggle favorites", // Added missing translation
    allCategories: "All categories", // Added missing translation
    found: "found", // Added missing translation
    addAllFiltered: "Add all filtered", // Added missing translation
    filterAll: "All",
    filterWeather: "Weather",
    filterAmateur: "Amateur",
    filterFavorites: "Favorites",
    addAll: "Add All",
    timelineView: "Timeline",
    tableView: "Table",
    utcTime: "UTC Time",
    localTime: "Local Time",
    invalidLatitude: "Invalid latitude (must be between -90° and 90°)",
    invalidLongitude: "Invalid longitude (must be between -180° and 180°)",
    invalidCoordinates: "Invalid coordinates",
    missingCoordinates: "Please enter valid coordinates",
    cityNotFound: "City not found",
    citySearchError: "Error searching for city",
    cityTooShort: "Enter at least 3 characters",
    azimuthFilter: "Azimuth Filter",
    azimuthExplanation: "Filter passes by direction (0° = East, 90° = South, 180° = West, 270° = North)",
    trajectorySettings: "Satellite Trajectory"
  }
} as const;