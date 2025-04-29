"use client";

import { useState, useRef, useEffect } from "react";
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
  const pathname = usePathname() || ""; // Default to empty string if null
  const currentLocale = pathname.startsWith("/fr") ? "fr" : "en";

  // Ajoute ce mapping juste après la déclaration de currentLocale
  const flagSrc = (locale: string) => {
    if (locale === "en") return "/images/flags/gb.png";
    if (locale === "fr") return "/images/flags/fr.png";
    return `/images/flags/${locale}.png`;
  };

  // Indicator states for the smooth navigation effect
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    width: 0,
    display: "none"
  });
  const navLinksRef = useRef<HTMLDivElement>(null);

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

  const langDropdownDesktopRef = useRef<HTMLDivElement | null>(null); // Desktop language dropdown ref
  const langDropdownMobileRef = useRef<HTMLDivElement | null>(null); // Mobile language dropdown ref

  // Close the language dropdown when clicking outside or toggling the mobile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownOpen) {
        const dropdownRef = isMobileMenuOpen ? langDropdownMobileRef : langDropdownDesktopRef;
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setLangDropdownOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [langDropdownOpen, isMobileMenuOpen]);

  // Close the language dropdown when the mobile menu is toggled
  useEffect(() => {
    if (!isMobileMenuOpen) {
      setLangDropdownOpen(false);
    }
  }, [isMobileMenuOpen]);

  // Prevent click propagation inside dropdown
  const preventClickPropagation = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  // Function to update indicator position with better positioning
  const handleLinkHover = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    
    if (navLinksRef.current) {
      const containerRect = navLinksRef.current.getBoundingClientRect();
      
      // Add padding to make the indicator slightly larger than the text
      const padding = 24; // Padding in pixels (12px on each side)
      
      // Calculate position relative to container
      const offsetLeft = rect.left - containerRect.left;
      
      setIndicatorStyle({
        left: offsetLeft - padding / 2, // Position with padding adjustment
        width: rect.width + padding,
        display: "block"
      });
    }
  };

  // Hide the indicator when leaving the navbar
  const handleNavMouseLeave = () => {
    setIndicatorStyle(prev => ({
      ...prev,
      display: "none"
    }));
  };

  return (
    <>
      <div className="w-full h-[65px] fixed top-0 shadow-lg shadow-[#2A0E61]/50 bg-[#03001427] backdrop-blur-md z-50 px-4 md:px-10">
        <div className="w-full h-full flex items-center justify-between m-auto px-[5px]">
          {/* Left: Logo + Name */}
          <div className="flex items-center gap-3">
            <Link href="/">
              <Image
                src="/images/logo.webp"
                alt="Logo"
                width={60}
                height={60}
                priority // Ensures the image is loaded as soon as possible
                className="rounded-full navbar-logo"
                style={{ opacity: 1, transition: "none" }} // Force no opacity/transition
              />
            </Link>
          </div>

          {/* Desktop Navigation: Center */}
          <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex">
            <div 
              ref={navLinksRef}
              className="flex items-center justify-between gap-6 md:gap-12 border-[rgba(112,66,248,0.38)] bg-[rgba(3,0,20,0.37)] px-[20px] py-[10px] rounded-full text-gray-200 relative"
              onMouseLeave={handleNavMouseLeave}
            >
              {/* Smooth moving indicator - fixed positioning */}
              <div 
                className="absolute h-[85%] bg-purple-900/30 backdrop-blur-sm rounded-full transition-all duration-300 ease-out"
                style={{
                  left: `${indicatorStyle.left}px`, // Use direct left positioning instead of transform
                  width: `${indicatorStyle.width}px`,
                  display: indicatorStyle.display,
                  top: '50%',
                  transform: 'translateY(-50%)' // Only transform for vertical centering
                }}
              />
              
              <Link
                href="/"
                className="text-xl font-medium hover:text-[rgb(136,66,248)] transition hover:scale-[1.02] z-10 navbar-link"
                onMouseEnter={handleLinkHover}
              >
                {t("navbar.home")}
              </Link>
              <Link
                href="/blog"
                className="text-xl font-medium hover:text-[rgb(136,66,248)] transition hover:scale-[1.02] z-10 navbar-link"
                onMouseEnter={handleLinkHover}
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
                <button 
                  className="text-xl font-medium flex items-center gap-1 transition-colors duration-300 hover:text-purple-400 z-10"
                  onMouseEnter={handleLinkHover}
                >
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
                    className="absolute left-0 top-full mt-2 bg-black/80 backdrop-blur-xl rounded-2xl shadow-lg overflow-hidden transition-all duration-300 z-[60] flex flex-col gap-1 px-2 py-2 min-w-max"
                  >
                    <Link
                      href="/tools/grid-square"
                      className="block px-2 py-0.5 text-xl transition-colors duration-300 hover:text-[rgb(136,66,248)] whitespace-nowrap"
                    >
                      {t("navbar.gridSquare")}
                    </Link>
                    <Link
                      href="/tools/predi-sat"
                      className="block px-2 py-0.5 text-xl transition-colors duration-300 hover:text-[rgb(136,66,248)] whitespace-nowrap"
                    >
                      {t("navbar.satellitePrediction")}
                    </Link>
                    <Link
                      href="/tools/area-sat"
                      className="block px-2 py-0.5 text-xl transition-colors duration-300 hover:text-[rgb(136,66,248)] whitespace-nowrap"
                    >
                      {t("navbar.satelliteInfo")}
                    </Link>
                  </div>
                )}
              </div>
              <Link
                href="/gallery"
                className="text-xl font-medium hover:text-[rgb(136,66,248)] transition hover:scale-[1.02] z-10 navbar-link"
                onMouseEnter={handleLinkHover}
              >
                {t("navbar.gallery")}
              </Link>
            </div>
          </div>

          {/* Desktop: Language Switcher */}
          <div className="hidden md:flex items-center gap-2" ref={langDropdownDesktopRef}>
            <div className="relative cursor-pointer">
              <Image
                src={flagSrc(currentLocale)}
                alt="Current Language"
                width={40}
                height={30}
                className="rounded-sm transition-transform duration-300 hover:scale-110"
                onClick={() => setLangDropdownOpen(prev => !prev)}
                style={{ width: "auto", height: "auto" }}
              />
              {langDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 bg-black/70 rounded-sm shadow-lg p-2 min-w-[120px]"
                  onClick={preventClickPropagation} // Prevent closing when clicking inside
                >
                  {currentLocale !== "en" && (
                    <Link href={getNewLocalePath("en")} onClick={() => setLangDropdownOpen(false)}>
                      <div className="flex items-center justify-center p-1 rounded-sm">
                        <Image
                          src="/images/flags/gb.png"
                          alt="English"
                          width={40}
                          height={30}
                          className="rounded-sm"
                          style={{ width: "auto", height: "auto" }}
                        />
                        <span className="ml-2 text-white text-sm font-medium">English</span>
                      </div>
                    </Link>
                  )}
                  {currentLocale !== "fr" && (
                    <Link href={getNewLocalePath("fr")} onClick={() => setLangDropdownOpen(false)}>
                      <div className="flex items-center justify-center p-1 rounded-sm">
                        <Image
                          src="/images/flags/fr.png"
                          alt="Français"
                          width={40}
                          height={30}
                          className="rounded-sm"
                          style={{ width: "auto", height: "auto" }}
                        />
                        <span className="ml-2 text-white text-sm font-medium">Français</span>
                      </div>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile: Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => {
                setIsMobileMenuOpen((prev) => !prev);
                setLangDropdownOpen(false); // Close language dropdown when toggling mobile menu
              }}
              className="text-white focus:outline-none"
            >
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
                  <Link href="/tools/predi-sat" onClick={() => setIsMobileMenuOpen(false)} className="text-lg hover:text-[rgb(136,66,248)] transition">
                    {t("navbar.satellitePrediction")}
                  </Link>
                  <Link href="/tools/area-sat" onClick={() => setIsMobileMenuOpen(false)} className="text-lg hover:text-[rgb(136,66,248)] transition">
                    {t("navbar.satelliteInfo")}
                  </Link>
                </div>
              )}
            </div>
            <Link href="/gallery" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-medium hover:text-[rgb(136,66,248)] transition">
              {t("navbar.gallery")}
            </Link>
            
            <div className="relative cursor-pointer" ref={langDropdownMobileRef}>
              <Image
                src={flagSrc(currentLocale)}
                alt="Current Language"
                width={30}
                height={20}
                className="rounded-sm transition-transform duration-300 hover:scale-110"
                onClick={() => setLangDropdownOpen((prev) => !prev)}
                style={{ width: "auto", height: "auto" }}
              />
              {langDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 bg-black/70 rounded-sm shadow-lg p-2 min-w-[100px]"
                  onClick={preventClickPropagation}
                >
                  {currentLocale !== "en" && (
                    <Link href={getNewLocalePath("en")} onClick={() => {
                      setLangDropdownOpen(false);
                      setIsMobileMenuOpen(false);
                    }}>
                      <div className="flex items-center justify-center p-1 rounded-sm">
                        <Image
                          src="/images/flags/gb.png"
                          alt="English"
                          width={30}
                          height={20}
                          className="rounded-sm"
                          style={{ width: "auto", height: "auto" }}
                        />
                        <span className="ml-2 text-white text-sm font-medium">English</span>
                      </div>
                    </Link>
                  )}
                  {currentLocale !== "fr" && (
                    <Link href={getNewLocalePath("fr")} onClick={() => {
                      setLangDropdownOpen(false);
                      setIsMobileMenuOpen(false);
                    }}>
                      <div className="flex items-center justify-center p-1 rounded-sm">
                        <Image
                          src="/images/flags/fr.png"
                          alt="Français"
                          width={30}
                          height={20}
                          className="rounded-sm"
                          style={{ width: "auto", height: "auto" }}
                        />
                        <span className="ml-2 text-white text-sm font-medium">Français</span>
                      </div>
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
