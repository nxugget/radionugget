"use client";

import React from "react";
import * as d3 from "d3";
import Link from "next/link";
import { satelliteColors } from "@/src/utils/satelliteColors";

interface SatellitePass {
  startTime: string;
  endTime: string;
  maxElevation: number;
  satelliteName: string;
  satelliteId: string;
  aosAzimuth: number; // Obligatoire
  losAzimuth: number; // Obligatoire
}

interface SatelliteTabProps {
  passes: SatellitePass[];
  useLocalTime: boolean;
  utcOffset: number;
}

// Utilisation des couleurs définies dans l'utilitaire
const colors = satelliteColors;

const SatelliteTab: React.FC<SatelliteTabProps> = ({
  passes,
  useLocalTime,
  utcOffset,
}) => {
  // Create a color map based on unique satellite names
  const uniqueSatellites = Array.from(
    new Set(passes.map((d) => d.satelliteName))
  );
  const colorMap: { [key: string]: string } = {};
  uniqueSatellites.forEach((sat, index) => {
    colorMap[sat] = colors[index % colors.length];
  });

  // Sort passes by startTime (closest first)
  const sortedPasses = passes.slice().sort((a, b) => {
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
  });

  // Formatters pour UTC et Local
  const timeFormatUTC = d3.utcFormat("%I:%M %p");
  const timeFormatLocal = d3.timeFormat("%I:%M %p");

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    if (useLocalTime) {
      return timeFormatLocal(date);
    } else {
      return timeFormatUTC(date);
    }
  };

  const getCardinalDirection = (azimuth: number): string => {
    const directions = [
      "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
      "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW", "N",
    ];
    const index = Math.round((azimuth % 360) / 22.5);
    return directions[index];
  };

  return (
    <div className="overflow-x-auto bg-nottooblack rounded-md p-2 sm:p-4 text-xs sm:text-lg">
      <table className="w-full min-w-[340px] sm:min-w-[420px]">
        <thead>
          <tr className="text-center bg-gray-800">
            <th className="px-1 sm:px-4 py-1 sm:py-2 text-white text-xs sm:text-base">
              Satellite
            </th>
            <th className="px-1 sm:px-4 py-1 sm:py-2 text-white text-xs sm:text-base">
              AOS
            </th>
            <th className="px-1 sm:px-4 py-1 sm:py-2 text-white text-xs sm:text-base">
              LOS
            </th>
            <th className="px-1 sm:px-4 py-1 sm:py-2 text-white text-xs sm:text-base">
              Max Élévation
            </th>
            <th className="px-1 sm:px-4 py-1 sm:py-2 text-white text-xs sm:text-base">
              Azimuth
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedPasses.map((pass, idx) => (
            <tr
              key={idx}
              className="border-b border-gray-600 text-center"
              style={{ color: colorMap[pass.satelliteName] }}
            >
              <td className="px-1 sm:px-4 py-1 sm:py-2">
                <Link
                  href={`/${"fr" /* ou dynamique */}/tools/area-sat?satelliteId=${encodeURIComponent(
                    pass.satelliteId
                  )}`}
                  className="hover:brightness-125 transition-all duration-200"
                >
                  {pass.satelliteName}
                </Link>
              </td>
              <td className="px-1 sm:px-4 py-1 sm:py-2">
                {formatTime(pass.startTime)}
              </td>
              <td className="px-1 sm:px-4 py-1 sm:py-2">
                {formatTime(pass.endTime)}
              </td>
              <td className="px-1 sm:px-4 py-1 sm:py-2">
                {Math.round(pass.maxElevation)}°
              </td>
              <td className="px-1 sm:px-4 py-1 sm:py-2">
                {Math.round(pass.aosAzimuth)}° (
                {getCardinalDirection(pass.aosAzimuth)}) →
                {Math.round(pass.losAzimuth)}° (
                {getCardinalDirection(pass.losAzimuth)})
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SatelliteTab;
