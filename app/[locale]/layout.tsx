import "@/app/styles/globals.css";
import { Navbar } from "@/src/components/ui/Navbar";
import { StarsBackground } from "@/src/components/ui/StarsBackground";
import { ShootingStars } from "@/src/components/ui/ShootingStars";
import { BlackHole } from "@/src/components/ui/BlackHole";
import type { ReactNode } from "react";
import { I18nProviderClient } from "@/locales/client";
import { Footer } from "@/src/components/ui/Footer";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default async function RootLayout({
  params,
  children,
}: {
  params: Promise<{ locale: string }>;
  children: ReactNode;
}) {
  const { locale } = await params;

  return (
    <html lang={locale} className="min-h-screen bg-black">
      <body className="relative min-h-screen bg-transparent">
        {/* Background layers */}
        <StarsBackground className="absolute inset-0 z-[-30]" />
        <ShootingStars className="absolute inset-0 z-[-20]" />
        <BlackHole className="absolute inset-0 z-[-10]" />

        {/* Foreground elements */}
        <I18nProviderClient locale={locale}>
          <Navbar />
          <main className="pt-24 pb-[60px] relative">
            {children}
          </main>
        </I18nProviderClient>

        <div className="bottom-0 w-full z-20">
          <Footer />
        </div>

        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
