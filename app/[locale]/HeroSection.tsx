import { ShootingStars } from "@/src/components/ui/ShootingStars";
import Image from "next/image";

interface HeroSectionProps {
  step: number;
  passed: boolean;
  onCtaClick?: () => void;
}

// Section héro avec effets de parallaxe et typographie "EXPLORE & RADIO SPACE"
export function HeroSection({ step, passed, onCtaClick }: HeroSectionProps) {
  return (
    <section id="space-explore" className="-mt-20 md:-mt-24 min-h-screen w-full overflow-hidden relative z-0">
      <div className="relative w-full h-screen overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60 z-[-6]" />
        {/* Background layer 1 */}
        <div className={`absolute top-0 left-0 w-full h-full transition-transform duration-[1500ms] ${passed ? "scale-[1]" : "scale-[1.4]"} z-[-10]`}>
          <Image
            src="/images/background1.png"
            alt="Background layer 1"
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover md:object-center"
          />
        </div>
        {/* ShootingStars local */}
        <ShootingStars className="absolute inset-0 w-full h-full z-[-9] pointer-events-none" />
        <div className={`absolute inset-0 transition-transform duration-[1500ms] ${passed ? "scale-[1.4]" : "scale-[1]"} z-[-8]`}>
          <Image
            src="/images/background2.png"
            alt="Background layer 2"
            fill
            unoptimized
            sizes="100vw"
            className="object-cover md:object-center"
          />
        </div>
        <div className={`absolute inset-0 transition-transform duration-[1500ms] ${passed ? "scale-[1.4]" : "scale-[1]"} z-[-7]`}>
          <Image
            src="/images/background3.png"
            alt="Background layer 3"
            fill
            unoptimized
            sizes="100vw"
            className="object-cover md:object-center"
          />
        </div>

        {/* ─── Central Hero Content ─── */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-[1500ms] ${step === 1 ? "opacity-100" : "opacity-0"}`}
          style={{ zIndex: 20 }}
        >
          {/* Logo - prominent, glowing, floating */}
          <div className="animate-logo-float mb-6 md:mb-8">
            <div className="animate-logo-glow">
              <Image
                src="/images/logo.webp"
                alt="RadioNugget"
                width={140}
                height={140}
                priority
                unoptimized
                className="rounded-full w-24 h-24 sm:w-32 sm:h-32 md:w-[140px] md:h-[140px] ring-2 ring-purple/30 ring-offset-2 ring-offset-transparent"
              />
            </div>
          </div>

          {/* Typography */}
          <div className="text-center px-4" style={{ maxWidth: "min(95vw, 900px)" }}>
            {/* EXPLORE */}
            <p
              className="text-white font-alien leading-[0.85] mb-1"
              style={{
                fontSize: "clamp(5rem, 18vw, 11rem)",
                fontWeight: 700,
                letterSpacing: "0.03em",
              }}
            >
              EXPLORE
            </p>

            {/* & RADIO SPACE - side by side */}
            <div className="flex items-center justify-center gap-3 sm:gap-5">
              <span
                className="text-white font-alien"
                style={{
                  fontSize: "clamp(3.5rem, 12vw, 8rem)",
                  lineHeight: "1",
                }}
              >
                &
              </span>
              <div className="flex flex-col items-start" style={{ gap: "0.02em" }}>
                <span
                  className="text-gradient-purple font-alien leading-[0.9]"
                  style={{ fontSize: "clamp(3.5rem, 12vw, 8rem)" }}
                >
                  RADIO
                </span>
                <span
                  className="text-white font-alien leading-[0.9]"
                  style={{ fontSize: "clamp(3.5rem, 12vw, 8rem)" }}
                >
                  SPACE
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll CTA */}
        <button
          onClick={onCtaClick}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 group"
          type="button"
          aria-label="Scroll down"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/[0.1] transition-all duration-500 ease-expo-out group-hover:bg-white/[0.12] group-hover:border-purple/30 group-hover:scale-110 group-hover:shadow-glow group-active:scale-95">
              <svg
                className="w-5 h-5 md:w-6 md:h-6 text-white/70 animate-bounce-smooth group-hover:text-purple-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </div>
            <span className="text-white/40 text-xs font-medium tracking-[0.2em] uppercase group-hover:text-white/60 transition-colors duration-300">
              Scroll
            </span>
          </div>
        </button>
      </div>
    </section>
  );
}
