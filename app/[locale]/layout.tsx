import "@/app/styles/globals.css";
import { Navbar } from "@/src/components/ui/Navbar";
import { StarsBackground } from "@/src/components/ui/StarsBackground";
import { ShootingStars } from "@/src/components/ui/ShootingStars";
import { BlackHole } from "@/src/components/ui/BlackHole"; 
import { ReactElement } from 'react';
import { I18nProviderClient } from '@/locales/client';

export default async function RootLayout({ params, children }: { params: Promise<{ locale: string }>, children: ReactElement }) {
  const { locale } = await params;
  return (
    <html lang="en">
      <body className="bg-black relative">
        {/* Background layers */}
        <StarsBackground className="absolute inset-0 z-[-3]" />
        <ShootingStars className="absolute inset-0 z-[-2]" />
        <BlackHole className="absolute inset-0 z-[-3]" />
        {/* Foreground elements wrapped inside I18nProviderClient */}
        <I18nProviderClient locale={locale}>
          <Navbar />
          <main className="pt-24 relative z-10">
            {children}
          </main>
        </I18nProviderClient>
      </body>
    </html>
  );
}
