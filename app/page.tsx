"use client";

import { useEffect, useState } from "react";
import SpaceExplore from "./components/space_explore";
import BestProjects from "./components/best-projects";

export default function Home() {
  const [scrollPhase, setScrollPhase] = useState(0);

  useEffect(() => {
    const handleScroll = (event: WheelEvent) => {
      if (event.deltaY > 50) {
        if (scrollPhase === 0) {
          setScrollPhase(1);
        } else if (scrollPhase === 1) {
          setScrollPhase(2);
          document.getElementById("best-projects")?.scrollIntoView({ behavior: "smooth" });
        }
      } else if (event.deltaY < -50) {
        if (scrollPhase === 2) {
          setScrollPhase(1);
          document.getElementById("space-explore")?.scrollIntoView({ behavior: "smooth" });
        } else if (scrollPhase === 1) {
          setScrollPhase(0);
        }
      }
    };

    window.addEventListener("wheel", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleScroll);
    };
  }, [scrollPhase]);

  return (
    <main className="overflow-hidden">
      <section id="space-explore" className="h-screen w-full overflow-hidden relative">
        <SpaceExplore scrollPhase={scrollPhase} />
      </section>

      <section id="best-projects" className="h-screen w-full flex items-center justify-center">
        <BestProjects />
      </section>
    </main>
  );
}
