"use client";

import "./styles/globals.css";
import { Navbar } from "@/src/components/ui/Navbar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black overflow-auto">
        <Navbar />
        {/* Ajout d'un padding-top pour compenser la hauteur de la navbar */}
        <main className="pt-24">{children}</main>
      </body>
    </html>
  );
}
