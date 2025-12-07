'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export function GeoRedirectBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [suggestedLocale, setSuggestedLocale] = useState<'en' | 'fr' | null>(null);
  const params = useParams();
  const currentLocale = params.locale as string;

  useEffect(() => {
    // Vérifier si on doit afficher la bannière
    const hasSeenBanner = sessionStorage.getItem('geo-banner-dismissed');
    if (hasSeenBanner) return;

    // Déterminer si l'utilisateur est sur la "mauvaise" version
    const hostname = window.location.hostname;
    const isFrDomain = hostname.includes('.fr');
    const isComDomain = hostname.includes('.com');

    // Simulation simple : si la locale ne correspond pas au domaine
    if (isFrDomain && currentLocale === 'en') {
      setSuggestedLocale('fr');
      setShowBanner(true);
    } else if (isComDomain && currentLocale === 'fr') {
      setSuggestedLocale('en');
      setShowBanner(true);
    }
  }, [currentLocale]);

  const handleDismiss = () => {
    sessionStorage.setItem('geo-banner-dismissed', '1');
    setShowBanner(false);
  };

  const handleSwitch = () => {
    if (suggestedLocale) {
      const hostname = window.location.hostname;
      const pathname = window.location.pathname;
      const search = window.location.search;
      
      // Changer de domaine
      let newHostname = hostname;
      if (suggestedLocale === 'fr') {
        newHostname = hostname.replace('.com', '.fr');
      } else {
        newHostname = hostname.replace('.fr', '.com');
      }
      
      // Changer la locale dans l'URL
      const newPathname = pathname.replace(`/${currentLocale}`, `/${suggestedLocale}`);
      
      window.location.href = `${window.location.protocol}//${newHostname}${newPathname}${search}`;
    }
  };

  if (!showBanner || !suggestedLocale) return null;

  const messages = {
    fr: {
      message: 'Il semblerait que vous préféreriez voir ce site en français. Voulez-vous changer ?',
      switch: 'Passer en français',
      dismiss: 'Rester en anglais',
    },
    en: {
      message: 'It looks like you might prefer to view this site in English. Would you like to switch?',
      switch: 'Switch to English',
      dismiss: 'Stay in French',
    },
  };

  const text = messages[suggestedLocale];

  const switchFlagImage = suggestedLocale === 'fr' ? '/images/flags/fr.png' : '/images/flags/gb.png';
  const dismissFlagImage = suggestedLocale === 'fr' ? '/images/flags/gb.png' : '/images/flags/fr.png';

  return (
    <div className="fixed top-20 left-0 right-0 z-50 mx-auto max-w-4xl px-4">
      <div className="bg-nottooblack rounded-lg shadow-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-slide-down">
        <p className="text-white text-sm sm:text-base text-center sm:text-left flex-1">
          {text.message}
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleSwitch}
            className="relative overflow-hidden group rounded"
          >
            {/* Drapeau net en fond */}
            <div 
              className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-all duration-300 will-change-transform"
              style={{ backgroundImage: `url(${switchFlagImage})` }}
            />
            {/* Overlay semi-transparent pour texte lisible */}
            <div className="absolute inset-0 bg-black/20" />
            {/* Texte */}
            <div className="relative px-3 py-1.5 text-white text-sm font-medium drop-shadow-lg">
              {text.switch}
            </div>
          </button>
          <button
            onClick={handleDismiss}
            className="relative overflow-hidden group rounded"
          >
            {/* Drapeau net en fond */}
            <div 
              className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-all duration-300 will-change-transform"
              style={{ backgroundImage: `url(${dismissFlagImage})` }}
            />
            {/* Overlay semi-transparent pour texte lisible */}
            <div className="absolute inset-0 bg-black/20" />
            {/* Texte */}
            <div className="relative px-3 py-1.5 text-white text-sm font-medium drop-shadow-lg">
              {text.dismiss}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
