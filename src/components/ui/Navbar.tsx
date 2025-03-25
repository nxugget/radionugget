"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useI18n } from "@/locales/client"; 

export const Navbar = () => {
  const t = useI18n(); // extraction de la fonction de traduction
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // MOBILE MENU STATE
  let timeoutRef: NodeJS.Timeout | null = null;

  // New state for language dropdown
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const langTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();
  const currentLocale = pathname.startsWith("/fr") ? "fr" : "en";

  // Function to generate the new path by replacing the language prefix
  const getNewLocalePath = (targetLocale: string) => {
    let rest = pathname;
    if (pathname.startsWith("/fr") || pathname.startsWith("/en"))
      rest = pathname.slice(3) || "/";
    return `/${targetLocale}${rest}`;
  };

  // Nouvelle reference pour le Tools menu
  const toolsTimerRef = useRef<NodeJS.Timeout | null>(null);

  const openToolsMenu = () => {
    if (timeoutRef) clearTimeout(timeoutRef);
    setIsAnimating(false);
    setIsToolsOpen(true);
  };

  const closeToolsMenu = () => {
    setIsAnimating(true);
    timeoutRef = setTimeout(() => {
      setIsToolsOpen(false);
      setIsAnimating(false);
    }, 500);
  };

  return (
    <>
      <div className="w-full h-[65px] fixed top-0 shadow-lg shadow-[#2A0E61]/50 bg-[#03001427] backdrop-blur-md z-50 px-10">
        <div className="w-full h-full flex items-center justify-between m-auto px-[10px]">
          {/* Left: Logo + Name */}
          <div className="flex items-center gap-3">
            <Link href="/">
              <Image
                src="/images/logo.webp"
                alt="Logo"
                width={60}
                height={60}
                priority // Ensures the image is loaded as soon as possible
                className="rounded-full"
              />
            </Link>
            <div className="hidden md:flex ml-[10px] text-gray-300 text-2xl font-bold">
              RADIONUGGET
            </div>
          </div>

          {/* Desktop Navigation: Center */}
          <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex">
            <div className="flex items-center justify-between gap-12 border-[rgba(112,66,248,0.38)] bg-[rgba(3,0,20,0.37)] px-[20px] py-[10px] rounded-full text-gray-200">
              <Link
                href="/"
                className="text-xl font-medium hover:text-[rgb(136,66,248)] transition hover:scale-105"
              >
                {t("navbar.home")}
              </Link>
              <Link
                href="/blog"
                className="text-xl font-medium hover:text-[rgb(136,66,248)] transition hover:scale-105"
              >
                {t("navbar.blog")}
              </Link>
              {/* Tools Menu */}
              <div
                className="relative"
                onMouseEnter={() => {
                  if (toolsTimerRef.current) clearTimeout(toolsTimerRef.current);
                  setIsToolsOpen(true);
                }}
                onMouseLeave={() => {
                  toolsTimerRef.current = setTimeout(() => {
                    setIsToolsOpen(false);
                  }, 300);
                }}
              >
                <button className="text-xl font-medium flex items-center gap-1 transition hover:text-[rgb(136,66,248)] hover:scale-105">
                  {t("navbar.tools")}
                  <svg
                    className={`w-4 h-4 transition-transform duration-300 ${isToolsOpen ? "rotate-180" : ""}`}
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
                    className="absolute left-0 top-full mt-1 bg-black/50 backdrop-blur-xl rounded-sm shadow-lg overflow-hidden transition-all duration-300 z-[60] flex flex-col gap-1 px-2 py-0.5 min-w-max"
                  >
                    <Link
                      href="/tools/grid-square"
                      className="block px-2 py-0.5 text-xl transition-all duration-300 hover:text-[rgb(136,66,248)] hover:translate-x-2 whitespace-nowrap"
                    >
                      {t("navbar.gridSquare")}
                    </Link>
                    {/*<Link
                      href="/tools/satellite-prediction"
                      className="block px-2 py-0.5 text-xl transition-all duration-300 hover:text-[rgb(136,66,248)] hover:translate-x-2 whitespace-nowrap"
                    >
                      {t("navbar.satellitePrediction")}
                    </Link>*/}
                  </div>
                )}
              </div>
              <Link
                href="/gallery"
                className="text-xl font-medium hover:text-[rgb(136,66,248)] transition hover:scale-105"
              >
                {t("navbar.gallery")}
              </Link>
            </div>
          </div>

          {/* Desktop: Language Switcher */}
          <div className="hidden md:flex items-center gap-2 ml-auto">
            <div className="relative cursor-pointer" onClick={() => setLangDropdownOpen(prev => !prev)}>
              {/* Active language flag only */}
              <Image
                src={`/images/flags/${currentLocale}.png`}
                alt="Current Language"
                width={40}
                height={30}
                className="rounded-sm"
                style={{ width: "auto", height: "auto" }}
              />
              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 bg-black/70 rounded-sm shadow-lg p-2 min-w-[120px]">
                  {currentLocale !== "en" && (
                    <Link href={getNewLocalePath("en")}>
                      <div className="flex items-center justify-center p-1 rounded-sm">
                        <Image
                          src="/images/flags/en.png"
                          alt="English"
                          width={40}
                          height={30}
                          className="rounded-sm"
                          style={{ width: "auto", height: "auto" }}
                        />
                      </div>
                    </Link>
                  )}
                  {currentLocale !== "fr" && (
                    <Link href={getNewLocalePath("fr")}>
                      <div className="flex items-center justify-center p-1 rounded-sm">
                        <Image
                          src="/images/flags/fr.png"
                          alt="Français"
                          width={40}
                          height={30}
                          className="rounded-sm"
                          style={{ width: "auto", height: "auto" }}
                        />
                      </div>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile: Hamburger Button */}
          <div className="flex md:hidden">
            <button onClick={() => setIsMobileMenuOpen(prev => !prev)} className="text-white focus:outline-none">
              {isMobileMenuOpen ? (
                // Close icon
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                // Hamburger icon
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-[65px] left-0 w-full bg-[#03001427] backdrop-blur-md z-40 transform transition-transform duration-300">
          <div className="flex flex-col items-center gap-4 p-4 text-gray-200">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-medium hover:text-[rgb(136,66,248)] transition">
              {t("navbar.home")}
            </Link>
            <Link href="/blog" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-medium hover:text-[rgb(136,66,248)] transition">
              {t("navbar.blog")}
            </Link>
            <div className="text-xl font-medium flex flex-col">
              <button className="flex items-center gap-1 hover:text-[rgb(136,66,248)] transition" onClick={() => setIsToolsOpen(prev => !prev)}>
                {t("navbar.tools")}
                <svg
                  className={`w-4 h-4 transition-transform duration-300 ${isToolsOpen ? "rotate-180" : ""}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 011.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.23 8.27a.75.75 0 01.02-1.06z" />
                </svg>
              </button>
              {isToolsOpen && (
                <div className="flex flex-col pl-4 mt-2">
                  <Link href="/tools/grid-square" onClick={() => setIsMobileMenuOpen(false)} className="text-lg hover:text-[rgb(136,66,248)] transition">
                    {t("navbar.gridSquare")}
                  </Link>
                  {/* ...add additional mobile tools links as needed... */}
                </div>
              )}
            </div>
            <Link href="/gallery" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-medium hover:text-[rgb(136,66,248)] transition">
              {t("navbar.gallery")}
            </Link>
            {/* Mobile Language Switcher */}
            <div className="flex items-center gap-2 pt-2 border-t border-gray-700">
              <div className="cursor-pointer" onClick={() => setLangDropdownOpen(prev => !prev)}>
                <Image
                  src={`/images/flags/${currentLocale}.png`}
                  alt="Current Language"
                  width={40}
                  height={30}
                  className="rounded-sm"
                  style={{ width: "auto", height: "auto" }}
                />
              </div>
              {langDropdownOpen && (
                <div className="flex gap-2">
                  {currentLocale !== "en" && (
                    <Link href={getNewLocalePath("en")} onClick={() => setIsMobileMenuOpen(false)}>
                      <Image src="/images/flags/en.png" alt="English" width={40} height={30} className="rounded-sm" style={{ width: "auto", height: "auto" }} />
                    </Link>
                  )}
                  {currentLocale !== "fr" && (
                    <Link href={getNewLocalePath("fr")} onClick={() => setIsMobileMenuOpen(false)}>
                      <Image src="/images/flags/fr.png" alt="Français" width={40} height={30} className="rounded-sm" style={{ width: "auto", height: "auto" }} />
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
