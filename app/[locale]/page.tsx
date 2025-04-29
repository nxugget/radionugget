"use client";

import { useEffect, useState } from "react";
import { useScroll } from "@/src/hooks/useScroll";
import Image from "next/image";
import Link from "next/link";
import { TypewriterEffectSmooth } from "@/src/components/features/Typewritter";
import { ShootingStars } from "@/src/components/ui/ShootingStars";

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
    <>
      <style>{`
        footer {
          display: none !important;
        }
      `}</style>
      <main className="min-h-screen">
        {/* ShootingStars au premier plan */}
        <ShootingStars className="fixed inset-0 pointer-events-none z-[30]" />
        
        {/* Section SpaceExplore */}
        <section id="space-explore" className="-mt-24 min-h-screen w-full overflow-hidden relative z-0">
          <div className="relative w-full h-screen overflow-hidden">
            <div
              className={`absolute top-0 left-0 w-full h-full md:bg-center bg-[15%_center] bg-cover transition-transform duration-[1500ms] ${passed ? "scale-[1]" : "scale-[1.4]"}`}
              style={{ backgroundImage: "url('/images/background1.png')", zIndex: -10 }}
            ></div>
            <div
              className={`absolute inset-0 md:bg-center bg-[15%_center] bg-cover transition-transform duration-[1500ms] ${passed ? "scale-[1.4]" : "scale-[1]"}`}
              style={{ backgroundImage: "url('/images/background2.png')", zIndex: -9 }}
            ></div>
            <div
              className={`absolute inset-0 md:bg-center bg-[15%_center] bg-cover transition-transform duration-[1500ms] ${passed ? "scale-[1.4]" : "scale-[1]"}`}
              style={{ backgroundImage: "url('/images/background3.png')", zIndex: -8 }}
            ></div>
            {/* Texte de SpaceExplore */}
            <div
              className={`absolute inset-0 flex flex-col items-center justify-center md:items-end md:justify-end mx-auto text-center transition-all duration-[1500ms] ${step === 1 ? "opacity-100" : "opacity-0"} ${step === 1 && "md:translate-y-[-50vh]"} md:inset-auto md:right-12 md:bottom-12`}
              style={{ 
                zIndex: 20, 
                width: "min(90vw, 600px)", 
                maxWidth: "100%"
              }}
            >
              {/* Vue Mobile uniquement */}
              <div className="md:hidden grid w-full">
                <p
                  className="text-white font-alien leading-[0.9] mb-0 w-full text-center col-span-2"
                  style={{
                    fontSize: "clamp(4.5rem, 15vw, 8rem)",
                    fontWeight: 700,
                    letterSpacing: "0.02em",
                    width: "100%"
                  }}
                >
                  EXPLORE
                </p>
                <div className="flex flex-row items-center justify-center w-full">
                  <span
                    className="text-white font-alien inline-block"
                    style={{
                      fontSize: "clamp(4rem, 12vw, 7rem)",
                      lineHeight: "1",
                      height: "100%",
                      marginTop: "0", 
                      paddingRight: "0.1em", // Petit espace après le & sur mobile
                    }}
                  >
                    &amp;
                  </span>
                  <div
                    className="inline-flex flex-col items-center justify-center"
                    style={{ 
                      gap: "0.05em"
                    }}
                  >
                    <span
                      className="text-white font-alien leading-[0.9] text-center"
                      style={{ 
                        fontSize: "clamp(4rem, 12vw, 7rem)",
                      }}
                    >
                      RADIO
                    </span>
                    <span
                      className="text-white font-alien leading-[0.9] text-center"
                      style={{ 
                        fontSize: "clamp(4rem, 12vw, 7rem)",
                      }}
                    >
                      SPACE
                    </span>
                  </div>
                </div>
              </div>

              {/* Vue Desktop inchangée */}
              <div
                className="hidden md:grid md:mr-0"
                style={{
                  gridTemplateColumns: "0.5fr 4.5fr",
                  gridTemplateRows: "auto 1fr",
                  width: "100%",
                  height: "auto",
                  gap: "0",
                }}
              >
                <p
                  className="text-white font-alien leading-[0.9] mb-0 w-full text-right col-span-2"
                  style={{
                    gridColumn: "1 / span 2",
                    fontSize: "clamp(4.5rem, 15vw, 8rem)",
                    fontWeight: 700,
                    letterSpacing: "0.02em",
                    paddingRight: "0",
                    marginRight: "0",
                    width: "100%"
                  }}
                >
                  EXPLORE
                </p>
                <span
                  className="text-white font-alien flex justify-end"
                  style={{
                    fontSize: "clamp(4rem, 12vw, 7rem)",
                    lineHeight: "1",
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gridRow: 2,
                    gridColumn: 1,
                    marginTop: "0", 
                    paddingRight: "0",
                    transform: "none"
                  }}
                >
                  &amp;
                </span>
                <div
                  className="flex flex-col items-start justify-center h-full w-full"
                  style={{ 
                    gridRow: 2, 
                    gridColumn: 2,
                    paddingLeft: "0",
                    paddingTop: "0",
                    gap: "0.05em"
                  }}
                >
                  <span
                    className="text-white font-alien leading-[0.9] w-full text-left"
                    style={{ 
                      fontSize: "clamp(4rem, 12vw, 7rem)",
                      paddingLeft: "0"
                    }}
                  >
                    RADIO
                  </span>
                  <span
                    className="text-white font-alien leading-[0.9] w-full text-left"
                    style={{ 
                      fontSize: "clamp(4rem, 12vw, 7rem)",
                      paddingLeft: "0"
                    }}
                  >
                    SPACE
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
