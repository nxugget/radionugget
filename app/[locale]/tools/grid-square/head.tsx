import getSeoConfig from '@/next-seo.config';

export default function Head({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const baseSeo = getSeoConfig(locale);

  const isFr = locale.startsWith('fr');
  const title = isFr
    ? 'Map & Calculateur de Grid Square | RadioNugget'
    : 'Grid Square Calculator & Map | RadioNugget';
  const description = isFr
    ? 'Entrez une adresse pour obtenir son Grid Square, visualisez-la sur une carte interactive, et explorez ses coordonnées.'
    : 'Enter an address to get its Grid Square, view it on an interactive map, and explore its coordinates.';

  const url = isFr
    ? 'https://radionugget.com/fr/grid-square'
    : 'https://radionugget.com/en/grid-square';

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": title,
    "description": description,
    "url": url,
    "applicationCategory": "UtilityApplication",
    "operatingSystem": "All",
    "inLanguage": locale,
  };

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
      <link rel="alternate" hrefLang="fr" href="https://radionugget.com/fr/grid-square" />
      <link rel="alternate" hrefLang="en" href="https://radionugget.com/en/grid-square" />
      <link rel="alternate" hrefLang="x-default" href="https://radionugget.com/en/grid-square" />

      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
    </>
  );
}
