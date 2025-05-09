"use client";

import { useEffect, useState } from "react";
import { useScroll } from "@/src/hooks/useScroll";
import Image from "next/image";
import Link from "next/link";
import { TypewriterEffectSmooth } from "@/src/components/features/Typewritter";
import { ShootingStars } from "@/src/components/ui/ShootingStars";
import { useI18n } from "@/locales/client";

interface Project {
  title: string;
  summary: string;
  path: string;
  image: string;
}

export default function Home() {
  const { scrollPhase, step, passed } = useScroll();
  const [preview, setPreview] = useState<Project | { message: string } | null>(null);
  const t = useI18n();

  const projectItems = [
    {
      title: t("projectsSection.weatherSatelliteStation"),
      image: "/images/blog/thumbnail/noaa.webp",
      link: "/blog/noaa",
      type: "article",
    },
    {
      title: t("projectsSection.satellitePrediction"),
      image: "/images/selection/predisat.png",
      link: "tools/predi-sat",
      type: "tool",
    },
    {
      title: t("projectsSection.decodingSignal"),
      image: "/images/blog/thumbnail/never_the_same_color.webp",
      link: "/blog/never_the_same_color",
      type: "article",
    },
    {
      title: t("projectsSection.satelliteExplorer"),
      image: "/images/selection/areasat.png",
      link: "tools/area-sat",
      type: "tool",
    },
    {
      title: t("projectsSection.homemadeQfhAntenna"),
      image: "/images/blog/thumbnail/qfh.webp",
      link: "/blog/qfh",
      type: "article",
    },
    {
      title: t("projectsSection.sstvReception"),
      image: "/images/blog/thumbnail/sstv.webp",
      link: "/blog/sstv",
      type: "article",
    },
  ];

  useEffect(() => {
    document.body.style.height = "100%";
    document.body.style.overflowY = "auto";

    return () => {
      // Rétablir le style du body pour que le scroll fonctionne sur les autres pages
      document.body.style.height = "100%";
      document.body.style.overflowY = "auto";
    };
  }, []);

  // Gère le scroll body ET html selon le scrollPhase (mobile)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const html = document.documentElement;
      if (scrollPhase !== 0) {
        // Body
        document.body.style.overflowY = "hidden";
        document.body.style.overscrollBehavior = "none";
        document.body.style.position = "fixed";
        document.body.style.width = "100vw";
        document.body.style.height = "100dvh";
        document.body.style.top = "0";
        document.body.style.left = "0";
        document.body.style.right = "0";
        document.body.style.bottom = "0";
        document.body.style.inset = "0";
        document.body.style.padding = "0";
        document.body.style.margin = "0";
        document.body.style.touchAction = "none";
        // HTML
        html.style.overflowY = "hidden";
        html.style.overscrollBehavior = "none";
        html.style.position = "fixed";
        html.style.width = "100vw";
        html.style.height = "100dvh";
        html.style.top = "0";
        html.style.left = "0";
        html.style.right = "0";
        html.style.bottom = "0";
        html.style.inset = "0";
        html.style.padding = "0";
        html.style.margin = "0";
        html.style.touchAction = "none";
      } else {
        // Body
        document.body.style.overflowY = "auto";
        document.body.style.overscrollBehavior = "";
        document.body.style.position = "";
        document.body.style.width = "";
        document.body.style.height = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.bottom = "";
        document.body.style.inset = "";
        document.body.style.padding = "";
        document.body.style.margin = "";
        document.body.style.touchAction = "";
        // HTML
        html.style.overflowY = "auto";
        html.style.overscrollBehavior = "";
        html.style.position = "";
        html.style.width = "";
        html.style.height = "";
        html.style.top = "";
        html.style.left = "";
        html.style.right = "";
        html.style.bottom = "";
        html.style.inset = "";
        html.style.padding = "";
        html.style.margin = "";
        html.style.touchAction = "";
      }
    }

    // Empêche le scroll natif sur mobile pendant l'animation
    const preventTouchMove = (e: TouchEvent) => {
      if (scrollPhase !== 0) {
        e.preventDefault();
      }
    };
    window.addEventListener("touchmove", preventTouchMove, { passive: false });

    return () => {
      // Body
      document.body.style.overflowY = "auto";
      document.body.style.overscrollBehavior = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.height = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.bottom = "";
      document.body.style.inset = "";
      document.body.style.padding = "";
      document.body.style.margin = "";
      document.body.style.touchAction = "";
      // HTML
      document.documentElement.style.overflowY = "auto";
      document.documentElement.style.overscrollBehavior = "";
      document.documentElement.style.position = "";
      document.documentElement.style.width = "";
      document.documentElement.style.height = "";
      document.documentElement.style.top = "";
      document.documentElement.style.left = "";
      document.documentElement.style.right = "";
      document.documentElement.style.bottom = "";
      document.documentElement.style.inset = "";
      document.documentElement.style.padding = "";
      document.documentElement.style.margin = "";
      document.documentElement.style.touchAction = "";
      // Retire le listener
      window.removeEventListener("touchmove", preventTouchMove);
    };
  }, [scrollPhase]);

  // Scroll automatique vers la section projets dès scrollPhase 3, sinon vers space-explore ou top
  useEffect(() => {
    if (scrollPhase === 3) {
      const projectsSection = document.getElementById("projects-section");
      if (projectsSection) {
        projectsSection.scrollIntoView({ behavior: "smooth" });
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
    <>
      <style>{`
        footer {
          display: none !important;
        }
      `}</style>
      <main className="bg-transparent">
        {/* Section SpaceExplore */}
        <section id="space-explore" className="-mt-24 min-h-screen w-full overflow-hidden relative z-0">
          <div className="relative w-full h-screen overflow-hidden">
            <div
              className={`absolute top-0 left-0 w-full h-full md:bg-center bg-[15%_center] bg-cover transition-transform duration-[1500ms] ${passed ? "scale-[1]" : "scale-[1.4]"} z-[-10]`}
              style={{ backgroundImage: "url('/images/background1.png')" }}
            ></div>
            {/* ShootingStars local, devant background1 mais derrière background2 */}
            <ShootingStars className="absolute inset-0 w-full h-full z-[-9] pointer-events-none" />
            <div
              className={`absolute inset-0 md:bg-center bg-[15%_center] bg-cover transition-transform duration-[1500ms] ${passed ? "scale-[1.4]" : "scale-[1]"} z-[-8]`}
              style={{ backgroundImage: "url('/images/background2.png')" }}
            ></div>
            <div
              className={`absolute inset-0 md:bg-center bg-[15%_center] bg-cover transition-transform duration-[1500ms] ${passed ? "scale-[1.4]" : "scale-[1]"} z-[-7]`}
              style={{ backgroundImage: "url('/images/background3.png')" }}
            ></div>
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
                <div className="flex flex-row items-center justify-center w-full relative" style={{ minHeight: "calc(2 * clamp(4rem, 12vw, 7rem))" }}>
                  <span
                    className="text-white font-alien inline-block absolute left-0"
                    style={{
                      fontSize: "clamp(4rem, 12vw, 7rem)",
                      lineHeight: "1",
                      height: "auto",
                      top: "50%",
                      transform: "translateY(-50%)",
                      zIndex: 1,
                      paddingRight: "0.1em",
                    }}
                  >
                    &amp;
                  </span>
                  <div
                    className="inline-flex flex-col items-center justify-center w-full pl-[2.3em]"
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

        {/* Section Projects Cards - occupe tout l'écran, grille responsive */}
        <section
          id="projects-section"
          className="relative flex flex-col items-center z-0 w-full justify-start bg-transparent pb-4 md:pb-16"
        >
          {/* Titre bien placé sous la navbar */}
          <div className="h-10 md:h-24" />
          <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-6xl font-bold text-purple font-alien tracking-wide z-10 mb-4 md:mb-6 text-center px-2 drop-shadow-lg">
            {t("projectsSection.title")}
          </h2>
          <div className="w-full flex justify-center z-10 relative">
            <div className="w-full max-w-[100vw] px-1 sm:px-4 md:px-8 flex">
              <div
                className={`
                  grid w-full
                  gap-x-3 gap-y-4
                  sm:gap-x-8 sm:gap-y-8
                  md:gap-x-10 md:gap-y-10
                  grid-cols-2 grid-rows-3
                  sm:grid-cols-2 sm:grid-rows-3
                  md:grid-cols-3 md:grid-rows-2
                  lg:grid-cols-3 lg:grid-rows-2
                  items-stretch justify-center
                  overflow-visible
                  min-h-[calc(100dvh-120px)] md:min-h-0
                `}
                style={{
                  // On retire toute hauteur forcée
                }}
              >
                {projectItems.map((item, idx) => (
                  <Link
                    href={item.link}
                    key={idx}
                    className="
                      group
                      rounded-2xl
                      overflow-hidden
                      bg-[#181028]/90
                      shadow-2xl
                      border border-purple/40
                      transition-all
                      duration-300
                      hover:shadow-[0_0_24px_4px_rgba(180,0,255,0.25),0_0_32px_8px_rgba(180,0,255,0.10)]
                      hover:border-purple
                      hover:scale-[1.04]
                      focus:outline-none
                      focus:ring-2
                      focus:ring-purple
                      flex flex-col
                      cursor-pointer
                      aspect-[4/2.8]
                      max-w-full
                    "
                  >
                    <div
                      className="
                        relative w-full flex-1 min-h-0
                        sm:min-h-[40px] md:min-h-[55px] lg:min-h-[65px]
                      "
                      style={{ flexBasis: "70%" }}
                    >
                      <div className="absolute inset-0">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover transition-all duration-300 group-hover:scale-105"
                          sizes="(max-width: 480px) 50vw, (max-width: 768px) 25vw, 20vw"
                          priority={idx < 2}
                        />
                      </div>
                      <span className="
                        absolute top-1 right-1
                        bg-purple/90 text-white text-[0.55rem] xs:text-xs sm:text-sm px-1.5 xs:px-2 py-[1.5px] rounded-full font-bold uppercase tracking-wider
                        shadow
                        pointer-events-none
                        drop-shadow-lg
                        z-10
                        select-none
                      ">
                        {item.type}
                      </span>
                    </div>
                    <div className="flex flex-col items-center justify-center px-2 py-1 flex-[0_0_30%]">
                      <h3 className="text-[0.8rem] xs:text-xs sm:text-sm md:text-xl lg:text-2xl font-bold text-white mb-1 font-alien text-center drop-shadow">
                        {item.title}
                      </h3>
                      {/* Ajoute ici un résumé ou autre info si besoin */}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
