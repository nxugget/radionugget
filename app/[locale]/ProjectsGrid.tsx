"use client";

// Using native <img> to avoid Next.js image transformations
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";

export type ProjectItem = {
  title: string;
  image: string;
  link: string;
  type: string;
};

interface ProjectsGridProps {
  title: string;
  items: ProjectItem[];
  priorityCount?: number;
}

// Grille des projets — diaporama plein écran sur desktop, cards empilées sur mobile
export function ProjectsGrid({ title, items }: ProjectsGridProps) {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const DURATION = 5000; // 5s par slide

  const next = useCallback(() => {
    setActive((prev) => (prev + 1) % items.length);
    setProgress(0);
  }, [items.length]);

  const prev = useCallback(() => {
    setActive((prev) => (prev - 1 + items.length) % items.length);
    setProgress(0);
  }, [items.length]);

  const goTo = useCallback((idx: number) => {
    setActive(idx);
    setProgress(0);
  }, []);

  // Auto-advance timer
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          next();
          return 0;
        }
        return p + (100 / (DURATION / 50));
      });
    }, 50);
    return () => clearInterval(interval);
  }, [active, next]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [next, prev]);

  const activeItem = items[active];
  const isToolType = activeItem?.type === "tool";

  return (
    <section
      id="projects-section"
      className="relative w-full bg-black"
    >
      {/* ── Desktop: Fullscreen Diaporama ── */}
      <div className="hidden sm:block relative w-full h-screen overflow-hidden">
        {/* All slides stacked, only active visible */}
        {items.map((item, idx) => (
            <div
            key={idx}
            className="absolute inset-0 transition-opacity duration-700 ease-out"
            style={{ opacity: idx === active ? 1 : 0, zIndex: idx === active ? 1 : 0 }}
          >
            <img
              src={item.image}
              alt={item.title}
              className="object-cover w-full h-full"
              loading={idx < 2 ? "eager" : "lazy"}
            />
            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
          </div>
        ))}

        {/* Content overlay */}
        <div className="absolute inset-0 z-10 flex flex-col justify-end pb-28 px-8 md:px-16 lg:px-24">
          {/* Title section */}
          <div className="mb-10">
            <p className="text-gray-400 text-sm font-medium tracking-[0.2em] uppercase mb-4">
              {title}
            </p>
            <div className="flex items-center gap-4 mb-4">
              <span className={`inline-flex items-center px-3 py-1 text-[11px] font-semibold tracking-wider uppercase rounded-full border ${
                isToolType
                  ? "bg-orange/15 text-orange border-orange/25"
                  : "bg-purple/15 text-purple-300 border-purple/25"
              }`}>
                {isToolType ? "⚡ Tool" : "📡 Article"}
              </span>
              <span className="text-gray-500 text-sm">{String(active + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span>
            </div>
            <h2
              className="font-alien text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-[0.95] tracking-tight max-w-3xl"
              key={active}
              style={{ animation: "reveal-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
            >
              {activeItem?.title}
            </h2>
          </div>

          {/* CTA */}
          <Link
            href={activeItem?.link ?? "#"}
            className="inline-flex items-center gap-3 self-start px-6 py-3 rounded-xl bg-purple text-white font-semibold text-sm tracking-wide transition-all duration-300 hover:bg-purple-300 hover:shadow-glow-lg hover:scale-105 active:scale-95"
          >
            Explore
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* Navigation arrows */}
        <button
          onClick={prev}
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/[0.1] text-white/60 hover:text-white hover:bg-white/[0.12] hover:border-purple/30 transition-all duration-300 hover:scale-110"
          aria-label="Previous"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={next}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/[0.1] text-white/60 hover:text-white hover:bg-white/[0.12] hover:border-purple/30 transition-all duration-300 hover:scale-110"
          aria-label="Next"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Bottom dots + progress bars */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className="group relative h-1.5 rounded-full overflow-hidden transition-all duration-300"
              style={{ width: idx === active ? 48 : 20 }}
              aria-label={`Go to slide ${idx + 1}`}
            >
              <div className="absolute inset-0 bg-white/20 rounded-full" />
              {idx === active && (
                <div
                  className="absolute inset-y-0 left-0 bg-purple rounded-full transition-none"
                  style={{ width: `${progress}%` }}
                />
              )}
              {idx !== active && (
                <div className="absolute inset-0 bg-white/20 rounded-full group-hover:bg-white/40 transition-colors" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Mobile: Fullscreen swipeable carousel ── */}
      <div
        className="sm:hidden relative w-full overflow-hidden bg-black"
        style={{ height: "calc(100vh - 80px)" }}
        onTouchStart={(e) => {
          const touch = e.touches[0];
          (e.currentTarget as any)._touchStartX = touch.clientX;
          (e.currentTarget as any)._touchStartY = touch.clientY;
        }}
        onTouchEnd={(e) => {
          const startX = (e.currentTarget as any)._touchStartX;
          const startY = (e.currentTarget as any)._touchStartY;
          if (startX == null) return;
          const touch = e.changedTouches[0];
          const dx = touch.clientX - startX;
          const dy = touch.clientY - startY;
          if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
            if (dx < 0) next();
            else prev();
          }
        }}
      >
        {/* Slides */}
        {items.map((item, idx) => (
          <div
            key={idx}
            className="absolute inset-0 transition-opacity duration-500 ease-out"
            style={{ opacity: idx === active ? 1 : 0, zIndex: idx === active ? 1 : 0 }}
          >
            <img
              src={item.image}
              alt={item.title}
              className="object-cover w-full h-full"
              loading={idx < 2 ? "eager" : "lazy"}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          </div>
        ))}

        {/* Content */}
        <div className="absolute inset-0 z-10 flex flex-col justify-end px-5 pb-24">
          <p className="text-gray-400 text-[11px] font-medium tracking-[0.2em] uppercase mb-3">
            {title}
          </p>
          <div className="flex items-center gap-3 mb-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full border ${
              isToolType
                ? "bg-orange/15 text-orange border-orange/25"
                : "bg-purple/15 text-purple-300 border-purple/25"
            }`}>
              {isToolType ? "⚡ Tool" : "📡 Article"}
            </span>
            <span className="text-gray-500 text-xs">{String(active + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span>
          </div>
          <h2
            className="font-alien text-3xl font-bold text-white leading-[0.95] tracking-tight mb-5"
            key={`mobile-${active}`}
            style={{ animation: "reveal-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}
          >
            {activeItem?.title}
          </h2>
          <Link
            href={activeItem?.link ?? "#"}
            className="inline-flex items-center gap-2 self-start px-5 py-2.5 rounded-xl bg-purple text-white font-semibold text-sm tracking-wide transition-all duration-300 hover:bg-purple-300 active:scale-95"
          >
            Explore
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* Bottom dots + progress */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className="group relative h-1 rounded-full overflow-hidden transition-all duration-300"
              style={{ width: idx === active ? 36 : 16 }}
              aria-label={`Slide ${idx + 1}`}
            >
              <div className="absolute inset-0 bg-white/20 rounded-full" />
              {idx === active && (
                <div
                  className="absolute inset-y-0 left-0 bg-purple rounded-full transition-none"
                  style={{ width: `${progress}%` }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
