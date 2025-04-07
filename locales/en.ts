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
    gridSquare: "Grid Square",
    satellitePrediction: "Satellite Prediction",
    satelliteInfo: "Satellite Info",
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
  projects: {
    "1": { title: "Build an ADS-B station connected to FlightRadar" },
    "2": { title: "Automatic reception of NOAA satellite images" },
    "3": { title: "Receive images from the ISS" },
    "4": { title: "Build a Quadrifilar Antenna (QFH)" },
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
      title: "Satellite Explorer",
      loading: "Loading...",
      searchPlaceholder: "Search for a satellite...",
      lastUpdate: "Last update:",
      lastTleUpdate: "Last TLE update:",
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
      tleTitle: "TLE"
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
      noInfo: "No info"
    }
  }
} as const;