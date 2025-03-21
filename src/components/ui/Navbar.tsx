"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export const Navbar = () => {
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  let timeoutRef: NodeJS.Timeout | null = null;

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
              priority
              className="rounded-full"
            />
          </Link>
          <div className="hidden md:flex ml-[10px] text-gray-300 text-2xl font-bold">
            RADIONUGGET
          </div>
        </div>

        {/* Center: Navigation Links (Centered) */}
        <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex">
          <div className="flex items-center justify-between gap-12 border-[rgba(112,66,248,0.38)] bg-[rgba(3,0,20,0.37)] px-[20px] py-[10px] rounded-full text-gray-200">
            <Link
              href="/"
              className="text-xl font-medium hover:text-[rgb(136,66,248)] transition hover:scale-105"
            >
              Home
            </Link>
            <Link
              href="/blog"
              className="text-xl font-medium hover:text-[rgb(136,66,248)] transition hover:scale-105"
            >
              Blog
            </Link>
            {/* Tools Menu */}
            <div
              className="relative"
              onMouseEnter={openToolsMenu}
              onMouseLeave={closeToolsMenu}
            >
              <button className="text-xl font-medium flex items-center gap-1 transition hover:text-[rgb(136,66,248)] hover:scale-105">
                Tools
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
                  className={`absolute left-0 top-full mt-1 bg-black backdrop-blur-xl rounded-lg shadow-lg overflow-hidden transition-all duration-300 z-[60] flex flex-col gap-2 px-2 py-1 min-w-max ${
                    isAnimating
                      ? "opacity-0 scale-95 translate-y-0"
                      : "opacity-100 scale-100 translate-y-0"
                  }`}
                >
                  <Link
                    href="/tools/grid-square"
                    className="block px-4 py-2 text-xl transition-all duration-300 hover:text-[rgb(136,66,248)] hover:translate-x-2 whitespace-nowrap"
                  >
                    Grid Square
                  </Link>
                  <Link
                    href="/tools/satellite-prediction"
                    className="block px-4 py-2 text-xl transition-all duration-300 hover:text-[rgb(136,66,248)] hover:translate-x-2 whitespace-nowrap"
                  >
                    Satellite Prediction
                  </Link>
                </div>
              )}
            </div>
            <Link
              href="/gallery"
              className="text-xl font-medium hover:text-[rgb(136,66,248)] transition hover:scale-105"
            >
              Gallery
            </Link>
          </div>
        </div>

        {/* (Other elements if any could go here) */}
      </div>
    </div>
  );
};
