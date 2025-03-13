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
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-cover bg-center text-white" 
         style={{ backgroundImage: "url('https://i.imgur.com/bsqWdBi.jpg')" }}>

      {/* Message */}
      <h1 className={`text-2xl sm:text-4xl font-semibold text-center transition-opacity duration-500 ${flicker ? "opacity-90" : "opacity-100"}`}>
        ..shhh.. ..houston... ..404... ..shhhh... ..lost.. ..in.. ..space. .shhhhh...
      </h1>

      {/* Astronaute Animation */}
      <div className="relative w-[265px] h-[430px] mt-10">
        <Link href="/" className="block w-full h-full">
          <div className="absolute w-[265px] h-[429px] bg-no-repeat bg-contain"
               style={{ backgroundImage: "url('https://i.imgur.com/VurcHkh.png')" }} 
               id="astronaut"></div>
        </Link>
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
