import React, { useState } from "react";

interface TLEDisplayProps {
  tle1: string;
  tle2: string;
}

// Explications complètes pour la première ligne TLE
const explanationsLine1: { [index: number]: string } = {
  0: "Line Number (always 1)",
  1: "Satellite Catalog Number (NORAD ID)",
  2: "Classification (U = Unclassified)",
  3: "International Designator (Launch Year)",
  4: "International Designator (Launch Number)",
  5: "International Designator (Piece of the launch)",
  6: "Epoch Year (Last two digits of the year)",
  7: "Epoch (Day of year plus fractional portion)",
  8: "First Time Derivative of Mean Motion (rev/day²)",
  9: "Second Time Derivative of Mean Motion (decimal point assumed, rev/day³)",
  10: "BSTAR drag term (decimal point assumed)",
  11: "Ephemeris Type",
  12: "Element Set Number"
};

// Explications complètes pour la deuxième ligne TLE
const explanationsLine2: { [index: number]: string } = {
  0: "Line Number (always 2)",
  1: "Satellite Catalog Number (NORAD ID)",
  2: "Inclination (degrees)",
  3: "Right Ascension of the Ascending Node (degrees)",
  4: "Eccentricity (decimal point assumed)",
  5: "Argument of Perigee (degrees)",
  6: "Mean Anomaly (degrees)",
  7: "Mean Motion (orbits per day)",
  8: "Revolution Number at Epoch"
};

interface PopupData {
  text: string;
  x: number;
  y: number;
}

interface RenderTLELineProps {
  line: string;
  lineType: "line1" | "line2";
  setPopup: (popup: PopupData | null) => void;
}

function RenderTLELine({ line, lineType, setPopup }: RenderTLELineProps) {
  // Sélectionne la correspondance selon le type
  const explanations = lineType === "line1" ? explanationsLine1 : explanationsLine2;
  const parts = line.trim().split(/\s+/);
  return (
    <div className="flex flex-wrap text-white text-left whitespace-nowrap">
      {parts.map((part, index) => (
        <span
          key={index}
          className="cursor-pointer p-1 hover:bg-purple hover:rounded text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl"
          onMouseEnter={(e) => {
            // Utilise e.clientX et e.clientY pour position fixed
            setPopup({ text: explanations[index] || "No info", x: e.clientX + 10, y: e.clientY + 10 });
          }}
          onMouseLeave={() => setPopup(null)}
        >
          {part}&nbsp;
        </span>
      ))}
    </div>
  );
}

export default function TLEDisplay({ tle1, tle2 }: TLEDisplayProps) {
  const [popup, setPopup] = useState<PopupData | null>(null);
  return (
    <div className="relative p-1 sm:p-4 rounded w-full text-center tracking-normal text-white">
      {tle1 && <RenderTLELine line={tle1} lineType="line1" setPopup={setPopup} />}
      {tle2 && <RenderTLELine line={tle2} lineType="line2" setPopup={setPopup} />}
      {popup && (
        <div 
          className="fixed bg-black text-white text-xs sm:text-sm px-2 py-1 rounded z-50"
          style={{ left: popup.x, top: popup.y }}
        >
          {popup.text}
        </div>
      )}
    </div>
  );
}

