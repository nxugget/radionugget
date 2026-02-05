"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function NotFound() {
  const [flicker, setFlicker] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFlicker((prev) => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen text-white px-6">

      {/* Message */}
      <div className="glass-card rounded-2xl px-8 py-10 text-center max-w-lg mx-auto">
        <h1 className={`text-5xl sm:text-7xl font-bold text-gradient-purple mb-4 transition-opacity duration-500 ${flicker ? "opacity-80" : "opacity-100"}`}>
          404
        </h1>
        <p className="text-gray-400 text-sm sm:text-base leading-relaxed tracking-wide mb-6">
          ..shhh.. ..houston... ..lost.. ..in.. ..space.. ..shhhhh...
        </p>
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-purple/10 border border-purple/20 rounded-xl text-purple-300 text-sm font-medium hover:bg-purple/20 hover:border-purple/40 transition-all duration-300"
        >
          ← Back to Earth
        </Link>
      </div>

      {/* Astronaute Animation */}
      <div className="relative w-[200px] h-[330px] mt-8 opacity-60">
        <div className="absolute w-[200px] h-[330px] bg-no-repeat bg-contain"
             style={{ backgroundImage: "url('https://i.imgur.com/VurcHkh.png')" }} 
             id="astronaut"></div>
      </div>

      {/* Animations Tailwind */}
      <style jsx>{`
        @keyframes move {
          0% { transform: translate(0,50px); }
          50% { transform: translate(20px,100px); }
          100% { transform: translate(0,50px); }
        }
        #astronaut {
          animation: move 10s infinite;
        }
      `}</style>
    </div>
  );
}
