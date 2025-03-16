"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export const Navbar = () => {
  const [navHeight, setNavHeight] = useState(0);
  const navRef = useRef<HTMLDivElement | null>(null);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (navRef.current) {
      setNavHeight(navRef.current.offsetHeight);
    }

    const handleResize = () => {
      if (navRef.current) {
        setNavHeight(navRef.current.offsetHeight);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Ouvrir le menu immédiatement
  const openToolsMenu = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsAnimating(false);
    setIsToolsOpen(true);
  };

  // Fermer le menu avec un effet smooth
  const closeToolsMenu = () => {
    setIsAnimating(true); // Déclenche l'animation de fermeture
    timeoutRef.current = setTimeout(() => {
      setIsToolsOpen(false);
      setIsAnimating(false);
    }, 300); // Attend la fin de l'animation avant de masquer complètement
  };

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

              {/* Tools Menu (avec délai et animation de fermeture smooth) */}
              <div
                className="relative"
                onMouseEnter={openToolsMenu}
                onMouseLeave={closeToolsMenu}
              >
                {/* Bouton Tools */}
                <button className="text-white text-lg font-medium flex items-center gap-1 transition duration-300 hover:text-purple hover:scale-105">
                  Tools
                  <svg
                    className={`w-4 h-4 transition-transform duration-300 ${
                      isToolsOpen ? "rotate-180" : ""
                    }`}
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

                {/* Dropdown Menu (maintenant avec animation fluide) */}
                {isToolsOpen && (
                  <div
                    className={`absolute left-0 mt-2 w-48 bg-black/80 backdrop-blur-lg rounded-lg shadow-lg overflow-hidden transition-all duration-300 ${
                      isAnimating
                        ? "opacity-0 scale-95 translate-y-2"
                        : "opacity-100 scale-100 translate-y-0"
                    }`}
                    onMouseEnter={openToolsMenu} // Empêche la fermeture si on est dessus
                    onMouseLeave={closeToolsMenu} // Ferme avec effet smooth
                  >
                    <Link
                      href="/tools/grid-square"
                      className="block px-4 py-3 text-white text-md transition-all duration-300 hover:text-orange hover:translate-x-2"
                    >
                      Grid Square
                    </Link>
                    <Link
                      href="/tools/satellite-prediction"
                      className="block px-4 py-3 text-white text-md transition-all duration-300 hover:text-orange hover:translate-x-2"
                    >
                      Satellite Prediction
                    </Link>
                  </div>
                )}
              </div>

              <Link
                href="/gallery"
                className="text-white text-lg font-medium hover:text-purple transition duration-300 hover:scale-105"
              >
                Gallery
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer invisible pour compenser la navbar */}
      <div style={{ height: navHeight }} />
    </>
  );
};
