"use client";

import { useEffect, useState } from "react";
import { useScroll } from "@/src/hooks/useScroll";
import Image from "next/image";
import Link from "next/link";
import { TypewriterEffectSmooth } from "@/src/components/features/Typewritter";

const projects = [
  {
    id: 1,
    title: "Monter une station ADS-B reliée à FlightRadar",
    img: "/images/blog/thumbnail/adsb.webp",
    sourceCode: "/blog/adsb",
  },
  {
    id: 2,
    title: "Réception automatique d'images satellites NOAA",
    img: "/images/blog/thumbnail/noaa.webp",
    sourceCode: "/blog/noaa",
  },
  {
    id: 3,
    title: "Recevoir des images en provenance de l'ISS",
    img: "/images/blog/thumbnail/sstv.webp",
    sourceCode: "/blog/sstv",
  },
  {
    id: 4,
    title: "Fabrication d'une antenne quadrifilaire (QFH)",
    img: "/images/blog/thumbnail/qfh.webp",
    sourceCode: "/blog/qfh",
  },
];

export default function Home() {
  const { scrollPhase, step, passed } = useScroll();
  const [scrolling, setScrolling] = useState(false);

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
      const bestSection = document.getElementById("best-projects");
      if (bestSection) {
        bestSection.scrollIntoView({ behavior: "smooth" });
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

  return (
    <main className="min-h-screen">
      <div className="-mt-24">
        {/* Section SpaceExplore */}
        <section id="space-explore" className="h-screen w-full overflow-hidden relative z-0">
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
              className={`absolute top-0 right-0 h-screen text-center mt-20 pr-20 transition-transform duration-[1500ms] 
            ${step === 1 ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}
            ${step === 0 ? "translate-y-full opacity-0" : ""}`}
              style={{ zIndex: 20 }}
            >
              <p className="text-white text-[6vw] font-poppins leading-[1.5]">EXPLORE</p>
              <p className="text-white text-[4.5vw] font-poppins leading-[1.5]">RADIO & SPACE</p>
            </div>
          </div>
        </section>

        {/* Section BestProjects modifiée */}
        <section id="best-projects" className="w-full min-h-screen flex flex-col items-center snap-start pt-24">
          {/* Titre centré en haut */}
          <div className="w-full flex justify-center items-center mx-auto px-4 mt-8 mb-4 whitespace-normal">
            <TypewriterEffectSmooth
              words={[
                { text: "A", className: "text-purple" },
                { text: "small", className: "text-purple" },
                { text: "selection", className: "text-purple" },
                { text: "of", className: "text-purple" },
                { text: "my", className: "text-orange" },
                { text: "best", className: "text-orange" },
                { text: "projects", className: "text-orange" },
              ]}
              className="text-xl sm:text-2xl md:text-3xl font-bold"
              cursorClassName="bg-purple"
            />
          </div>
          {/* Conteneur modifié pour les cards */}
          <div className="w-full max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="relative group w-full rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] duration-300"
                >
                  <div className="relative w-full aspect-video">
                    <Image
                      src={project.img}
                      alt={project.title}
                      layout="fill"
                      objectFit="cover"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  {/* Titre centré sur la card avec marge */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="mx-4 bg-black/70 px-6 py-3 rounded-lg text-center">
                      <p className="text-white text-xl md:text-3xl font-bold">{project.title}</p>
                    </div>
                  </div>
                  <Link href={project.sourceCode} className="absolute inset-0" passHref />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
