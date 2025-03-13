"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-transparent backdrop-blur-lg shadow-md px-8 py-4 flex items-center justify-between">
      
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
            <Link href="/" className="text-white text-lg font-medium hover:text-purple-400 transition">Home</Link>
            <Link href="/blog" className="text-white text-lg font-medium hover:text-purple-400 transition">Blog</Link>
            <Link href="/gallery" className="text-white text-lg font-medium hover:text-purple-400 transition">Gallery</Link>
            <Link href="/aboutme" className="text-white text-lg font-medium hover:text-purple-400 transition">About Me</Link>
          </div>
        </div>
      </div>

      {/* Menu Hamburger Mobile */}
      <button 
        className="md:hidden text-white text-3xl focus:outline-none"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        ☰
      </button>

      {/* Menu Mobile */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-black/90 backdrop-blur-md py-5 flex flex-col items-center gap-4 md:hidden">
          <Link href="/" className="text-white text-xl font-medium hover:text-purple-400 transition" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
          <Link href="/blog" className="text-white text-xl font-medium hover:text-purple-400 transition" onClick={() => setIsMobileMenuOpen(false)}>Blog</Link>
          <Link href="/gallery" className="text-white text-xl font-medium hover:text-purple-400 transition" onClick={() => setIsMobileMenuOpen(false)}>Gallery</Link>
          <Link href="/aboutme" className="text-white text-xl font-medium hover:text-purple-400 transition" onClick={() => setIsMobileMenuOpen(false)}>About Me</Link>
        </div>
      )}
    </nav>
  );
};
