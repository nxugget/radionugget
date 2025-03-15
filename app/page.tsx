"use client";

import { useEffect, useState } from "react";
import SpaceExplore from "./components/space_explore";
import BestProjects from "./components/best-projects";

export default function Home() {
  const [scrollPhase, setScrollPhase] = useState(0);
  const navbarHeight = 80; // Ajuste selon la hauteur de ta navbar
  const scrollLockTime = 800;
  let isScrolling = false;

  useEffect(() => {
    const handleScroll = (event: WheelEvent) => {
      if (isScrolling) return;

      const bestProjects = document.getElementById("best-projects");

      if (scrollPhase === 1 && event.deltaY > 0) {
        // 🔹 Étape 2 : Scroll automatique vers best-projects
        setScrollPhase(2);
        if (bestProjects) {
          const top = bestProjects.offsetTop - navbarHeight;
          window.scrollTo({ top, behavior: "smooth" });
        }
      } else if (scrollPhase === 2 && event.deltaY < 0) {
        // 🔹 Retour à SpaceExplore
        setScrollPhase(1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      isScrolling = true;
      setTimeout(() => {
        isScrolling = false;
      }, scrollLockTime);
    };

    window.addEventListener("wheel", handleScroll, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleScroll);
    };
  }, [scrollPhase]);

  return (
    <main className="overflow-hidden">
      {/* 🔹 Space Explore */}
      <section id="space-explore" className="h-screen w-full">
        <SpaceExplore onScrollComplete={() => {
          // Dès que l'animation est terminée, on passe en phase 1 pour que le scroll vers best-projects fonctionne
          setScrollPhase(1);
        }} />
      </section>

      {/* 🔹 Best Projects */}
      <section id="best-projects" className="h-screen w-full bg-gray-900 flex items-center justify-center pt-[80px]">
        <BestProjects />
      </section>
    </main>
  );
}
