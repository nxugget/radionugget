"use client";

import "./styles/globals.css";
import { Navbar } from "@/src/components/ui/Navbar";
import { StarsBackground } from "@/src/components/ui/StarsBackground";
import { ShootingStars } from "@/src/components/ui/ShootingStars";
import { BlackHole } from "@/src/components/ui/BlackHole"; 

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black relative">
        {/* Background layers */}
        <StarsBackground className="absolute inset-0 z-[-2]" />
        <ShootingStars className="absolute inset-0 z-[-2]" />
        <BlackHole />
        {/* Foreground elements */}
        <Navbar />
        <main className="pt-24 relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
