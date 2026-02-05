import "@/app/styles/globals.css";
import { Navbar } from "@/src/components/ui/Navbar";
import { BackgroundLayer } from "@/src/components/ui/BackgroundLayer";
import type { ReactNode } from "react";
import { I18nProviderClient } from "@/locales/client";
import { Footer } from "@/src/components/ui/Footer";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { poppins, roboto, firaCode, alien } from "@/src/lib/fonts";
import { GeoRedirectBanner } from "@/src/components/ui/GeoRedirectBanner";

export default async function RootLayout({
  params,
  children,
}: {
  params: Promise<{ locale: string }>;
  children: ReactNode;
}) {
  const { locale } = await params;

  return (
    <html
      lang={locale}
      className="min-h-screen bg-black"
      style={{
        ...poppins.style,
        ...(roboto.style.fontFamily && { "--font-roboto": roboto.style.fontFamily }),
        ...(firaCode.style.fontFamily && { "--font-fira-code": firaCode.style.fontFamily }),
        ...(alien.style.fontFamily && { "--font-alien": alien.style.fontFamily }),
      } as React.CSSProperties}
    >
      <body className="relative min-h-screen bg-transparent text-white">
        {/* Background layers */}
        <BackgroundLayer />

        {/* Foreground elements */}
        <I18nProviderClient locale={locale}>
          <GeoRedirectBanner />
          <Navbar />
          <main className="pt-24 pb-16 relative">
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
