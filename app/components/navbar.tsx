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
    }

    const handleResize = () => {
      if (navRef.current) {
        setNavHeight(navRef.current.offsetHeight);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* La navbar avec un ref */}
      <nav
        ref={navRef}
        className="fixed top-0 w-full z-50 bg-transparent backdrop-blur-lg shadow-md px-8 py-4 flex items-center justify-between"
      >
        {/* Partie gauche : Logo + Texte */}
        <div className="flex items-center gap-3">
          <Link href="/">
            <Image
              src="/logo.webp"
              alt="Logo"
              width={60}
              height={60}
              priority
              className="rounded-full"
            />
          </Link>
          <div className="relative text-2xl font-bold text-white">
            RADIONUGGET
          </div>
        </div>

        {/* Conteneur des liens, parfaitement centré */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <div className="bg-black/50 backdrop-blur-md rounded-full px-10 py-3">
            <div className="flex gap-10">
              <Link
                href="/"
                className="text-white text-lg font-medium hover:text-purple-400 transition"
              >
                Home
              </Link>
              <Link
                href="/blog"
                className="text-white text-lg font-medium hover:text-purple-400 transition"
              >
                Blog
              </Link>
              <Link
                href="/gallery"
                className="text-white text-lg font-medium hover:text-purple-400 transition"
              >
                Gallery
              </Link>
              <Link
                href="/aboutme"
                className="text-white text-lg font-medium hover:text-purple-400 transition"
              >
                About Me
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
