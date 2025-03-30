import getSeoConfig from '@/next-seo.config';
import { getSatellites } from '@/src/lib/satelliteAPI'; 

export default async function Head({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const baseSeo = getSeoConfig(locale);

  const isFr = locale.startsWith('fr');
  const title = isFr
    ? 'Prédiction Satellites'
    : 'Satellites Prediction';
  const description = isFr
    ? 'Recherchez parmis les satellites radioamateurs pour obtenir des prédictions de passage.'
    : 'Look up amateur radio satellites to get pass predictions.';

  const url = isFr
    ? 'https://radionugget.com/fr/satellite-prediction'
    : 'https://radionugget.com/en/satellite-prediction';

  // Récupération des satellites
  const satellites = await getSatellites();

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:locale" content={baseSeo.openGraph.locale} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={baseSeo.openGraph.site_name} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />

      {/* Hreflang for alternate languages */}
      <link rel="alternate" hrefLang="fr" href="https://radionugget.com/fr/satellite-prediction" />
      <link rel="alternate" hrefLang="en" href="https://radionugget.com/en/satellite-prediction" />
      <link rel="alternate" hrefLang="x-default" href="https://radionugget.com/en/satellite-prediction" />

      {/* Balises SEO pour chaque satellite */}
      {satellites.map((satellite) => (
        <meta
          key={satellite.id}
          name="keywords"
          content={`${satellite.name}`}
        />
      ))}
    </>
  );
}
