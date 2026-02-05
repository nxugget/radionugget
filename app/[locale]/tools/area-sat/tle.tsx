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

  // TLE field definitions by column (1-based, inclusive)
  // https://en.wikipedia.org/wiki/Two-line_element_set
  const line1Fields = [
    { key: "satellites.tle.lineNumber1", start: 0, end: 1 }, // 1
    { key: "satellites.tle.catalogNumber", start: 2, end: 7 }, // 3-7
    { key: "satellites.tle.classification", start: 7, end: 8 }, // 8
    { key: "satellites.tle.intlDesignatorYear", start: 9, end: 11 }, // 10-11
    { key: "satellites.tle.intlDesignatorLaunchNumber", start: 11, end: 14 }, // 12-14
    { key: "satellites.tle.intlDesignatorPiece", start: 14, end: 17 }, // 15-17
    { key: "satellites.tle.epochYear", start: 18, end: 20 }, // 19-20
    { key: "satellites.tle.epochDay", start: 20, end: 32 }, // 21-32
    { key: "satellites.tle.firstTimeDerivative", start: 33, end: 43 }, // 34-43
    { key: "satellites.tle.secondTimeDerivative", start: 44, end: 52 }, // 45-52
    { key: "satellites.tle.bstarDrag", start: 53, end: 61 }, // 54-61
    { key: "satellites.tle.ephemerisType", start: 62, end: 63 }, // 63
    { key: "satellites.tle.elementSetNumber", start: 64, end: 68 }, // 65-68
    { key: "satellites.tle.checksum", start: 68, end: 69 }, // 69
  ];

  const line2Fields = [
    { key: "satellites.tle.lineNumber2", start: 0, end: 1 }, // 1
    { key: "satellites.tle.catalogNumber", start: 2, end: 7 }, // 3-7
    { key: "satellites.tle.inclination", start: 8, end: 16 }, // 9-16
    { key: "satellites.tle.rightAscension", start: 17, end: 25 }, // 18-25
    { key: "satellites.tle.eccentricity", start: 26, end: 33 }, // 27-33
    { key: "satellites.tle.argumentOfPerigee", start: 34, end: 42 }, // 35-42
    { key: "satellites.tle.meanAnomaly", start: 43, end: 51 }, // 44-51
    { key: "satellites.tle.meanMotion", start: 52, end: 63 }, // 53-63
    { key: "satellites.tle.revolutionNumber", start: 63, end: 68 }, // 64-68
    { key: "satellites.tle.checksum", start: 68, end: 69 }, // 69
  ];

  const fields = lineType === "line1" ? line1Fields : line2Fields;

  // Extract fields by fixed columns
  const fieldValues = fields.map(f =>
    line.substring(f.start, f.end).trim()
  );

  return (
    <div className="flex flex-wrap text-white text-left whitespace-nowrap">
      {fieldValues.map((part, index) => (
        <span
          key={index}
          className="cursor-pointer p-1 hover:bg-purple hover:rounded text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl"
          onMouseEnter={(e) => {
            const translationKey = fields[index]?.key || "satellites.tle.noInfo";
            setPopup({
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
    <div className="relative p-1 sm:p-4 rounded w-full text-center tracking-normal text-white overflow-x-auto">
      <div className="flex justify-center w-full">
        <div className="inline-block text-left">
          {tle1 && <RenderTLELine line={tle1} lineType="line1" setPopup={setPopup} />}
          {tle2 && <RenderTLELine line={tle2} lineType="line2" setPopup={setPopup} />}
        </div>
      </div>
      {popup && (
        <div 
          className="fixed bg-surface-2/95 backdrop-blur-xl text-white text-xs sm:text-sm px-3 py-1.5 rounded-lg border border-white/[0.06] shadow-float z-50"
          style={{ left: popup.x, top: popup.y }}
        >
          {popup.text}
        </div>
      )}
    </div>
  );
}

