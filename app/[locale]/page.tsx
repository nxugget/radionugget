import { Metadata } from 'next';
import Homepage from './Homepage';
import getSeoConfig from '@/next-seo.config';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const { locale } = params;
  const baseSeo = getSeoConfig(locale);

  const isFr = locale.startsWith('fr');
  
  const title = isFr
    ? 'Home | RadioNugget'
    : 'Home | RadioNugget';
  
  const description = isFr
    ? 'Explorez le monde fascinant des radiofréquences, des satellites, de la SDR, des  antennes avec des explications simples et claires pour tous les passionnés de radio et d\'espace'
    : 'Explore the fascinating world of radio frequencies, satellites, SDR, antennas with simple and clear explanations for all radio and space enthusiasts';

  const url = isFr
    ? 'https://radionugget.com/fr'
    : 'https://radionugget.com/en';
    
  const keywords = isFr
    ? 'satellite, radiofréquence, SDR, NOAA, antenne, SSTV, réception radio, radio amateur, signaux radio, décodage, prédiction satellite, grid square, hackasat, writeup'
    : 'satellite, radio frequency, SDR, NOAA, antenna, SSTV, radio reception, ham radio, space exploration, radio signals, decoding, satellite prediction, grid square, hackasat, writeup';

  const ogImage = {
    url: 'https://radionugget.com/images/logo.webp', 
    width: 1200,
    height: 630,
    alt: isFr ? 'RadioNugget - Exploration radio et spatiale' : 'RadioNugget - Radio and Space Exploration',
  };

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      url,
      siteName: baseSeo.openGraph.site_name,
      locale: baseSeo.openGraph.locale,
      type: 'website',
      images: [ogImage], 
    },
    alternates: {
      languages: {
        'en': 'https://radionugget.com/en',
        'fr': 'https://radionugget.com/fr',
        'x-default': 'https://radionugget.com/en',
      },
      canonical: url, 
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-video-preview': -1,
        'max-snippet': -1,
      },
    },
    other: {
      'application-ld+json': JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "RadioNugget",
        "description": description,
        "url": url,
        "inLanguage": locale,
        "keywords": keywords.split(', '),
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${url}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string"
        },
        "author": {
          "@type": "Organization",
          "name": "RadioNugget",
          "url": url,
          "logo": "https://radionugget.com/images/logo.webp" 
        },
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "EUR",
          "availability": "https://schema.org/InStock",
          "url": url
        },
        "audience": {
          "@type": "Audience",
          "audienceType": "Radio enthusiasts, space enthusiasts, satellite tracking"
        }
      }),
      'breadcrumb-schema': JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": isFr ? "Accueil" : "Home",
            "item": url
          }
        ]
      }),
    },
  };
}

export default function Home({ params }: { params: { locale: string } }) {
  return <Homepage locale={params.locale} />;
}
