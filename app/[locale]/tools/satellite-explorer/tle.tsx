import React, { useState } from "react";
import { useI18n } from "@/locales/client";

interface TLEDisplayProps {
  tle1: string;
  tle2: string;
}

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
  const t = useI18n();
  
  // Define the full dictionary of translation keys for line 1
  const line1Explanations = [
    "satellites.tle.lineNumber1",
    "satellites.tle.catalogNumber",
    "satellites.tle.classification",
    "satellites.tle.launchYear",
    "satellites.tle.launchNumber",
    "satellites.tle.launchPiece",
    "satellites.tle.epochYear",
    "satellites.tle.epochDay",
    "satellites.tle.firstTimeDerivative",
    "satellites.tle.secondTimeDerivative",
    "satellites.tle.bstarDrag",
    "satellites.tle.ephemerisType",
    "satellites.tle.elementSetNumber"
  ];

  // Define the full dictionary of translation keys for line 2
  const line2Explanations = [
    "satellites.tle.lineNumber2",
    "satellites.tle.catalogNumber",
    "satellites.tle.inclination",
    "satellites.tle.rightAscension",
    "satellites.tle.eccentricity",
    "satellites.tle.argumentOfPerigee",
    "satellites.tle.meanAnomaly",
    "satellites.tle.meanMotion",
    "satellites.tle.revolutionNumber"
  ];

  // Select the correct explanation dictionary based on line type
  const explanations = lineType === "line1" ? line1Explanations : line2Explanations;
  
  const parts = line.trim().split(/\s+/);
  return (
    <div className="flex flex-wrap text-white text-left whitespace-nowrap">
      {parts.map((part, index) => (
        <span
          key={index}
          className="cursor-pointer p-1 hover:bg-purple hover:rounded text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl"
          onMouseEnter={(e) => {
            // Get the translation for this index or use a fallback
            const translationKey = index < explanations.length 
              ? explanations[index] 
              : "satellites.tle.noInfo";
            
            setPopup({ 
              // Add the empty params object as the second argument
              text: t(translationKey as any, {}), 
              x: e.clientX + 10, 
              y: e.clientY + 10 
            });
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

