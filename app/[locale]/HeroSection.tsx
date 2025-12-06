import { ShootingStars } from "@/src/components/ui/ShootingStars";

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
          style={{ zIndex: 20, width: "min(90vw, 600px)", maxWidth: "100%" }}
        >
          {/* Vue Mobile uniquement */}
          <div className="md:hidden grid w-full">
            <p
              className="text-white font-alien leading-[0.9] mb-0 w-full text-center col-span-2"
              style={{
                fontSize: "clamp(4.5rem, 15vw, 8rem)",
                fontWeight: 700,
                letterSpacing: "0.02em",
                width: "100%",
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
                &
              </span>
              <div
                className="inline-flex flex-col items-center justify-center w-full pl-[2.3em]"
                style={{ gap: "0.05em" }}
              >
                <span
                  className="text-white font-alien leading-[0.9] text-center"
                  style={{ fontSize: "clamp(4rem, 12vw, 7rem)" }}
                >
                  RADIO
                </span>
                <span
                  className="text-white font-alien leading-[0.9] text-center"
                  style={{ fontSize: "clamp(4rem, 12vw, 7rem)" }}
                >
                  SPACE
                </span>
              </div>
            </div>
          </div>

          {/* Vue Desktop */}
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
                width: "100%",
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
                transform: "none",
              }}
            >
              &
            </span>
            <div
              className="flex flex-col items-start justify-center h-full w-full"
              style={{ gridRow: 2, gridColumn: 2, paddingLeft: "0", paddingTop: "0", gap: "0.05em" }}
            >
              <span
                className="text-white font-alien leading-[0.9] w-full text-left"
                style={{ fontSize: "clamp(4rem, 12vw, 7rem)", paddingLeft: "0" }}
              >
                RADIO
              </span>
              <span
                className="text-white font-alien leading-[0.9] w-full text-left"
                style={{ fontSize: "clamp(4rem, 12vw, 7rem)", paddingLeft: "0" }}
              >
                SPACE
              </span>
            </div>
          </div>
        </div>
        {/* Bouton scroll large et visible */}
        <button
          onClick={onCtaClick}
          className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 group"
          type="button"
          aria-label="Scroll down"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="px-10 py-6 rounded-full bg-white/15 backdrop-blur-xl border-2 border-white/30 shadow-2xl transition-all duration-300 group-hover:bg-white/25 group-hover:border-white/40 group-hover:scale-110 group-active:scale-95">
              <svg
                className="w-10 h-10 md:w-12 md:h-12 text-white animate-bounce"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </div>
            <span className="text-white text-base md:text-lg font-medium tracking-wide opacity-90 group-hover:opacity-100 transition-opacity duration-300">
              Scroll
            </span>
          </div>
        </button>
      </div>
    </section>
  );
}
