"use client";

import React from "react";
import * as d3 from "d3";
import Link from "next/link";

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

const colors = d3.schemeCategory10;

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

  const timeFormat = d3.timeFormat("%I:%M %p");

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    if (useLocalTime) date.setHours(date.getHours() + utcOffset);
    return timeFormat(date);
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
    <div className="overflow-x-auto bg-nottooblack rounded-md p-4 text-lg">
      <table className="w-full">
        <thead>
          <tr className="text-center bg-gray-800">
            <th className="px-4 py-2 text-white">Satellite</th>
            <th className="px-4 py-2 text-white">AOS</th>
            <th className="px-4 py-2 text-white">LOS</th>
            <th className="px-4 py-2 text-white">Max Élévation</th>
            <th className="px-4 py-2 text-white">Azimuth</th>
          </tr>
        </thead>
        <tbody>
          {sortedPasses.map((pass, idx) => (
            <tr
              key={idx}
              className="border-b border-gray-600 text-center"
              style={{ color: colorMap[pass.satelliteName] }}
            >
              <td className="px-4 py-2">
                <Link
                  href={`/${"fr" /* ou dynamique */}/tools/satellite-explorer?satelliteId=${encodeURIComponent(
                    pass.satelliteId
                  )}`}
                  legacyBehavior
                >
                  <a className="hover:underline">{pass.satelliteName}</a>
                </Link>
              </td>
              <td className="px-4 py-2">{formatTime(pass.startTime)}</td>
              <td className="px-4 py-2">{formatTime(pass.endTime)}</td>
              <td className="px-4 py-2">{Math.round(pass.maxElevation)}°</td>
              <td className="px-4 py-2">
                {Math.round(pass.aosAzimuth)}° ({getCardinalDirection(pass.aosAzimuth)}) →
                {Math.round(pass.losAzimuth)}° ({getCardinalDirection(pass.losAzimuth)})
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SatelliteTab;
