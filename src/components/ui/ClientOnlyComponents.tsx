'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const BackgroundLayer = dynamic(() => import('@/src/components/ui/BackgroundLayer').then(m => ({ default: m.BackgroundLayer })), {
  ssr: false,
});

const GeoRedirectBanner = dynamic(() => import('@/src/components/ui/GeoRedirectBanner').then(m => ({ default: m.GeoRedirectBanner })), {
  ssr: false,
});

export function ClientOnlyComponents() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <BackgroundLayer />
      <GeoRedirectBanner />
    </>
  );
}
