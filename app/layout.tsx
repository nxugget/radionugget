"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import "./styles/globals.css";
import { Navbar } from "./components/navbar";
import { ShootingStars } from "./components/ShootingStars";
import { StarsBackground } from "./components/StarsBackground";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname(); // 🔹 Récupère l'URL actuelle

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" }); // 🔹 Remonte en haut à chaque changement de page
    }, [pathname]); // 🔹 Déclenché à chaque fois que l'URL change

    return (
        <html lang="en">
            <body className="relative w-full min-h-screen overflow-hidden bg-black">
                {/* Fond étoilé */}
                <StarsBackground className="absolute top-0 left-0 w-full h-full z-[-1]" />
                <ShootingStars />

                {/* Contenu principal */}
                <div className="relative z-10">
                    <Navbar />
                    <main>{children}</main>
                </div>
            </body>
        </html>
    );
}
