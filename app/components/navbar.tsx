"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export const Navbar = () => {
  const [navHeight, setNavHeight] = useState(0);
  const navRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (navRef.current) {
      setNavHeight(navRef.current.offsetHeight);
      console.log("Navbar initial height:", navRef.current.offsetHeight);
    }

    const handleResize = () => {
      if (navRef.current) {
        setNavHeight(navRef.current.offsetHeight);
        console.log("Navbar resized, new height:", navRef.current.offsetHeight);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <nav
        ref={navRef}
        className="fixed top-0 w-full z-50 backdrop-blur-md shadow-md px-8 py-4 flex items-center justify-between bg-black/40 transition-all duration-300"
      >
        {/* Partie gauche : Logo + Texte */}
        <div className="flex items-center gap-3">
          <Link href="/">
            <Image
              src="/images/logo.webp"
              alt="Logo"
              width={60}
              height={60}
              priority
              className="rounded-full hover:scale-110 transition-transform duration-300"
            />
          </Link>
          <div className="relative text-2xl font-bold text-white hover:text-purple transition duration-300">
            RADIONUGGET
          </div>
        </div>

        {/* Conteneur des liens */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <div className="bg-black/30 backdrop-blur-lg rounded-full px-10 py-3">
            <div className="flex gap-10">
              <Link
                href="/"
                className="text-white text-lg font-medium hover:text-purple transition duration-300 hover:scale-105"
              >
                Home
              </Link>
              <Link
                href="/blog"
                className="text-white text-lg font-medium hover:text-purple transition duration-300 hover:scale-105"
              >
                Blog
              </Link>

              {/* Tools Menu (affiché automatiquement au hover) */}
              <div className="relative group">
                <button className="text-white text-lg font-medium flex items-center gap-1 transition duration-300 hover:text-purple hover:scale-105">
                  Tools
                  <svg
                    className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 011.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.23 8.27a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu affiché au survol */}
                <div
                  className="absolute left-0 mt-2 w-48 bg-black/80 backdrop-blur-lg rounded-lg shadow-lg overflow-hidden transition-all duration-300 opacity-0 scale-95 translate-y-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0"
                >
                  <Link
                    href="/grid-square"
                    className="block px-4 py-3 text-white text-md hover:text-orange transition duration-300 hover:pl-6"
                  >
                    Grid Square
                  </Link>
                  <Link
                    href="/satellite-prediction"
                    className="block px-4 py-3 text-white text-md hover:text-orange transition duration-300 hover:pl-6"
                  >
                    Satellite Prediction
                  </Link>
                </div>
              </div>

              <Link
                href="/gallery"
                className="text-white text-lg font-medium hover:text-purple transition duration-300 hover:scale-105"
              >
                Gallery
              </Link>
              {/* <Link
                href="/aboutme"
                className="text-white text-lg font-medium hover:text-purple transition duration-300 hover:scale-105"
              >
                About Me
              </Link> */}
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer invisible pour compenser la navbar */}
      <div style={{ height: navHeight }} />
    </>
  );
};
