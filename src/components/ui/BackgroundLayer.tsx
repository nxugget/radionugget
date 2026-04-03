"use client";

import dynamic from "next/dynamic";

const StarsBackground = dynamic(
  () => import("@/src/components/ui/StarsBackground").then(m => ({ default: m.StarsBackground })),
  { ssr: false }
);

const ShootingStars = dynamic(
  () => import("@/src/components/ui/ShootingStars").then(m => ({ default: m.ShootingStars })),
  { ssr: false }
);

export function BackgroundLayer() {
  return (
    <>
      <StarsBackground className="absolute inset-0 z-[-30]" />
      <ShootingStars className="absolute inset-0 z-[-20]" />
    </>
  );
}
