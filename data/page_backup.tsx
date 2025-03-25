// ...existing code copied from /app/[locale]/page.tsx...
"use client";

import { useEffect, useState } from "react";
import { useScroll } from "@/src/hooks/useScroll";
import Image from "next/image";
import Link from "next/link";
import { TypewriterEffectSmooth } from "@/src/components/features/Typewritter";
import "@/app/styles/solar_system.scss"; // assure l'application des styles

// Mise à jour du type Project pour inclure "image"
interface Project {
  title: string;
  summary: string;
  path: string;
  image: string;
}

export default function Home() {
  const { scrollPhase, step, passed } = useScroll();
  const [randomProjects, setRandomProjects] = useState<Project[]>([]);
  const [preview, setPreview] = useState<Project | { message: string } | null>(null);
  // Planètes : "sun" et "pluto" n'ont pas de projet
  const planetNames = ["sun", "mercury", "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"];

  useEffect(() => {
    document.body.style.height = "100%";
    document.body.style.overflowY = "auto";

    return () => {
      // Rétablir le style du body pour que le scroll fonctionne sur les autres pages
      document.body.style.height = "100%";
      document.body.style.overflowY = "auto";
    };
  }, []);

  // Update scroll handling for both directions
  useEffect(() => {
    if (scrollPhase === 2) {
      // Modifier ici pour cibler "solar-system" au lieu de "best-projects"
      const solarSystemSection = document.getElementById("solar-system");
      if (solarSystemSection) {
        solarSystemSection.scrollIntoView({ behavior: "smooth" });
      }
    } else if (scrollPhase === 1) {
      const spaceSection = document.getElementById("space-explore");
      if (spaceSection) {
        spaceSection.scrollIntoView({ behavior: "smooth" });
      }
    } else if (scrollPhase === 0) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [scrollPhase]);

  useEffect(() => {
    fetch("/api/random-projects")
      .then((res) => res.json())
      .then(setRandomProjects);
  }, []);

  return (
    <main className="min-h-screen">
      {/* Section SpaceExplore */}
      <section id="space-explore" className="-mt-24 min-h-screen w-full overflow-hidden relative z-0">
        <div className="relative w-full h-screen overflow-hidden">
          <div
            className={`absolute top-0 left-0 w-full h-full bg-center bg-cover transition-transform duration-[1500ms] ${passed ? "scale-[1]" : "scale-[1.4]"}`}
            style={{ backgroundImage: "url('/images/background1.webp')", zIndex: -10 }}
          ></div>
          <div
            className={`absolute inset-0 bg-center bg-cover transition-transform duration-[1500ms] ${passed ? "scale-[1.4]" : "scale-[1]"}`}
            style={{ backgroundImage: "url('/images/background2.webp')", zIndex: -9 }}
          ></div>
          <div
            className={`absolute inset-0 bg-center bg-cover transition-transform duration-[1500ms] ${passed ? "scale-[1.4]" : "scale-[1]"}`}
            style={{ backgroundImage: "url('/images/background3.webp')", zIndex: -8 }}
          ></div>
          {/* Texte de SpaceExplore */}
          <div
            className={`absolute right-0 bottom-0 mr-12 flex flex-col items-center text-center transition-all duration-[1500ms] ${step === 1 ? "translate-y-[-50vh] opacity-100" : "translate-y-full opacity-0"}`}
            style={{ zIndex: 20 }}
          >
            <p className="text-white text-[6vw] font-poppins leading-[1.5]">EXPLORE</p>
            <p className="text-white text-[4.5vw] font-poppins leading-[1.5]">RADIO & SPACE</p>
          </div>
        </div>
      </section>

      {/* Section pour le système solaire (header uniquement) */}
      <section id="solar-system" className="w-full relative z-10 min-h-screen pt-16 pb-12">
        <header className="w-full flex flex-col items-center justify-center text-center">
          <TypewriterEffectSmooth
            words={[{ text: "A random selection of my projects", className: "text-3xl font-bold text-white" }]}
            cursorClassName="text-purple"
            className="mb-2"
          />
          <p className="text-sm text-gray-300">Click on a real planet to view details</p>
        </header>
      </section>
    </main>
  );
}
