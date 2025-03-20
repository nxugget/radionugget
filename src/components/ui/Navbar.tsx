"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation"; // added
import Link from "next/link";
import Image from "next/image";

export const Navbar = () => {
  const pathname = usePathname();
  const isHome = pathname === "/";

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
    setIsAnimating(true);
    timeoutRef.current = setTimeout(() => {
      setIsToolsOpen(false);
      setIsAnimating(false);
    }, 500); // increased delay for easier submenu selection
  };

  return (
    <>
      <nav
        ref={navRef}
        className="fixed top-0 w-full z-[100000] isolate bg-black/30 backdrop-blur-md shadow-md px-8 py-4 flex items-center justify-between transition-all duration-300"
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
          <div className="bg-black/30 backdrop-blur-xl rounded-full px-10 py-3 shadow-md">
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
                    />
                  </svg>
                </button>

                {isToolsOpen && (
                  <div
                    className={`absolute left-0 top-full mt-1 bg-black backdrop-blur-xl rounded-lg shadow-lg overflow-hidden transition-all duration-300 z-[60] flex flex-col gap-2 px-2 py-1 min-w-max ${
                      isAnimating
                        ? "opacity-0 scale-95 translate-y-0"
                        : "opacity-100 scale-100 translate-y-0"
                    }`}
                  >
                    <Link
                      href="/tools/grid-square"
                      className="block px-4 py-2 text-white text-lg transition-all duration-300 hover:text-orange hover:translate-x-2 whitespace-nowrap"
                    >
                      Grid Square
                    </Link>
                    <Link
                      href="/tools/satellite-prediction"
                      className="block px-4 py-2 text-white text-lg transition-all duration-300 hover:text-orange hover:translate-x-2 whitespace-nowrap"
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

      {/* Supprimez ou commentez le spacer ci-dessous */}
      {/* <div style={{ height: navHeight }} /> */}
    </>
  );
};
