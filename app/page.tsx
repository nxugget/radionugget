"use client";

import { useEffect, useState } from "react";
import SpaceExplore from "./components/space_explore";
import BestProjects from "./components/best-projects";

export default function Home() {
  const [scrollPhase, setScrollPhase] = useState(0);

  useEffect(() => {
    const handleScroll = (event: WheelEvent) => {
      event.preventDefault();

      const spaceExplore = document.getElementById("space-explore");
      const textBlock = document.querySelector(".text-block"); // Sélectionne le texte principal

      if (scrollPhase === 0 && event.deltaY > 0) {
        // 🔹 Étape 1 : Lancer le zoom de space_explore.jsx
        setScrollPhase(1);
        spaceExplore?.classList.add("zoomed");
        textBlock?.classList.remove("reset-text"); // Retirer la réinitialisation si présente
      } else if (scrollPhase === 1 && event.deltaY > 0) {
        // 🔹 Étape 2 : Scroll smooth vers best-projects
        setScrollPhase(2);
        document.getElementById("best-projects")?.scrollIntoView({
          behavior: "smooth",
        });
      } else if (scrollPhase === 2 && event.deltaY < 0) {
        // 🔹 Retour vers space_explore si on scroll vers le haut
        setScrollPhase(1);
        spaceExplore?.scrollIntoView({
          behavior: "smooth",
        });
      } else if (scrollPhase === 1 && event.deltaY < 0) {
        // 🔹 Reset au début si on revient en arrière
        setScrollPhase(0);
        spaceExplore?.classList.remove("zoomed");
        textBlock?.classList.add("reset-text"); // Ajouter la classe pour réinitialiser le texte
      }
    };

    window.addEventListener("wheel", handleScroll, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleScroll);
    };
  }, [scrollPhase]);

  return (
    <main className="overflow-hidden">
      {/* 🔹 Section Space Explore (Parallax) */}
      <section id="space-explore" className="h-screen w-full">
        <SpaceExplore />
      </section>

      {/* 🔹 Section Best Projects */}
      <section id="best-projects" className="h-screen w-full bg-gray-900 flex items-center justify-center">
        <BestProjects />
      </section>
    </main>
  );
}
