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
  },
  navbar: {
    home: "Home",
    blog: "Blog",
    tools: "Tools",
    gridSquare: "Grid Square",
    satellitePrediction: "Satellite Prediction",
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
  footer: {  // new footer translations
    thanks: "Thanks",
    solhey: "Sol'hey",
    illustration: "for the homepage illustration",
    madeWith: "Made with",
    by: "by",
    myself: "myself"
  }
} as const;