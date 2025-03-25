import "@/app/styles/globals.css";
import { Navbar } from "@/src/components/ui/Navbar";
import { StarsBackground } from "@/src/components/ui/StarsBackground";
import { ShootingStars } from "@/src/components/ui/ShootingStars";
import { BlackHole } from "@/src/components/ui/BlackHole"; 
import { ReactElement } from 'react';
import { I18nProviderClient } from '@/locales/client';
import { Footer } from "@/src/components/ui/Footer";

export default async function RootLayout({ params, children }: { params: Promise<{ locale: string }>, children: ReactElement }) {
  const { locale } = await params;
  return (
    <html lang="en" className="min-h-screen">
      <head>
        {/* head content géré par /[locale]/head.tsx */}
      </head>
      <body className="bg-black relative min-h-screen">
        {/* Background layers */}
        <StarsBackground className="absolute inset-0 z-[-3]" />
        <ShootingStars className="absolute inset-0 z-[-2]" />
        <BlackHole className="absolute inset-0 z-[-3]" />
        {/* Foreground elements */}
        <I18nProviderClient locale={locale}>
          <Navbar />
          <main className="pt-24 pb-[60px] relative z-10">
            {children}
          </main>
        </I18nProviderClient>
        <div className="bottom-0 w-full z-20">
          <Footer />
        </div>
      </body>
    </html>
  );
}
