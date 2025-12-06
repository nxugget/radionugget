"use client";

import { useEffect } from "react";
import { useScroll } from "@/src/hooks/useScroll";
import { useI18n } from "@/locales/client";
import { ProjectsGrid } from "./ProjectsGrid";
import { HeroSection } from "./HeroSection";

export default function Homepage({ locale }: { locale: string }) {
  const { scrollPhase, step, passed, triggerScrollDown, isTouchDevice } = useScroll();
  const t = useI18n();

  const handleScrollClick = () => {
    triggerScrollDown();
  };

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
    if (isTouchDevice) return; // Sur mobile, laisser le scroll natif

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

    // Empêche le scroll natif pendant l'animation (desktop)
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
  }, [scrollPhase, isTouchDevice]);

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
        <HeroSection step={step} passed={passed} onCtaClick={handleScrollClick} />

        <ProjectsGrid title={t("projectsSection.title")} items={projectItems} />
      </main>
    </>
  );
}