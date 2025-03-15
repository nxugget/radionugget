"use client";

import { useState, useEffect } from "react";
import { getGridSquare } from "@/lib/gridSquare";
import { TypewriterEffectSmooth } from "../components/typewritter-effect";
import dynamic from "next/dynamic";
import GridSquareInfo from "../components/GridSquareInfo"; 

const Map = dynamic(() => import("../components/Map"), { ssr: false });

export default function GridSquareCalculator() {
  const [query, setQuery] = useState("");
  const [gridSquare, setGridSquare] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ lat: 0, lon: 0, grid: "" });
  const [copied, setCopied] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [utcTime, setUtcTime] = useState(new Date()); // Horloge UTC dynamique

  // Empêcher le TypewriterEffect de se relancer après un scroll
  useEffect(() => {
    if (!hasLoaded) {
      setHasLoaded(true);
    }
  }, [hasLoaded]);

  useEffect(() => {
    const interval = setInterval(() => {
      setUtcTime(new Date()); // Mise à jour de l'heure UTC
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchCoordinates = async (address: string) => {
    setLoading(true);
    setError(null);
    setGridSquare(null);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );
      const data = await response.json();

      if (data.length === 0) {
        throw new Error("Adresse non trouvée.");
      }

      const { lat, lon } = data[0];
      const square = getGridSquare(parseFloat(lat), parseFloat(lon));
      setGridSquare(square);
    } catch (err) {
      setError("Impossible de récupérer les données. Vérifiez l'adresse.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (gridSquare) {
      navigator.clipboard.writeText(gridSquare);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-3">
      <div className="w-full max-w-[90%] lg:max-w-[1400px]">
        <div className="w-full flex justify-center">
          {hasLoaded && (
            <TypewriterEffectSmooth
              words={[
                { text: "Grid", className: "text-[#b400ff]" },
                { text: "Square", className: "text-[#b400ff]" },
                { text: "Calculator", className: "text-[#ffaa00]" },
              ]}
              className="text-lg sm:text-xl md:text-2xl font-bold text-center mb-2"
              cursorClassName="bg-[#b400ff]"
            />
          )}
        </div>

        <GridSquareInfo />

        <form onSubmit={(e) => {
          e.preventDefault();
          if (query.trim() !== "") {
            fetchCoordinates(query);
          }
        }} 
          className="flex items-center space-x-2 my-2 w-full max-w-md mx-auto"
        >
  <input
    className="bg-zinc-200 text-zinc-600 font-mono ring-1 ring-zinc-400 focus:ring-2 focus:ring-purple-400 outline-none duration-300 placeholder:text-zinc-600 placeholder:opacity-50 rounded-full px-4 py-2 shadow-md focus:shadow-lg w-full"
    autoComplete="off"
    placeholder="Entrez une ville ou une adresse..."
    name="text"
    type="text"
    value={query}
    onChange={(e) => setQuery(e.target.value)}
  />
  <button type="submit" className="rounded-full bg-zinc-200 text-zinc-600 font-mono ring-1 ring-zinc-400 focus:ring-2 focus:ring-purple-400 px-3 py-2 shadow-md">
    🔍
  </button>
</form>


        <p className="text-zinc-400 text-xs md:text-sm text-center">Ex: Reykjavik ou Zone 51</p>

        {gridSquare && (
          <div className="bg-gray-800 text-white font-mono px-4 py-2 rounded-md shadow-lg mt-4 flex justify-between items-center w-full max-w-md mx-auto">
            <span className="font-bold text-green-400">Grid Square: {gridSquare}</span>
            <button
              onClick={handleCopy}
              className="text-white bg-gray-600 hover:bg-gray-700 px-2 py-1 rounded-md text-sm transition"
            >
              {copied ? "✅" : "📋"}
            </button>
          </div>
        )}
      </div>

      <div className="w-full max-w-[98%] lg:max-w-[1600px] mt-5">
        <div className="w-full bg-gray-900 text-white text-left py-2 px-4 rounded-t-md shadow-md flex items-center">
          <span className="text-orange-400 font-bold"> Latitude:&nbsp;</span> <span className="text-yellow-400">{mousePosition.lat.toFixed(4)}</span> &nbsp;|&nbsp;  
          <span className="text-white font-bold"> Longitude:&nbsp;</span> <span className="text-cyan-400">{mousePosition.lon.toFixed(4)}</span> &nbsp;|&nbsp; 
          <span className="text-white font-bold"> Grid Square:&nbsp;</span> <span className="font-bold text-green-400">{mousePosition.grid}</span>  
          <span className="text-gray-400 font-bold ml-auto">UTC Time: {utcTime.toISOString().split("T")[1].split(".")[0]}</span>
        </div>

        <Map center={[48.8566, 2.3522]} setMousePosition={setMousePosition} />
      </div>
    </div>
  );
}
