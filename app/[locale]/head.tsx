import getSeoConfig from '@/next-seo.config';

export default function Head({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const baseSeo = getSeoConfig(locale);

  const isFr = locale.startsWith('fr');
  const title = isFr
    ? 'RadioNugget'
    : 'RadioNugget';
  const description = isFr
    ? 'Explorez le monde fascinant des radiofréquences et des satellites avec des explications simples et claires'
    : 'Explore the fascinating world of radio frequencies and satellites with simple and clear explanations';

  const url = isFr
    ? 'https://radionugget.com/fr'
    : 'https://radionugget.com/en';

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "RadioNugget",
    "description": description,
    "url": url,
    "inLanguage": locale,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${url}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
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
      <link rel="alternate" hrefLang="fr" href="https://radionugget.com/fr" />
      <link rel="alternate" hrefLang="en" href="https://radionugget.com/en" />
      <link rel="alternate" hrefLang="x-default" href="https://radionugget.com/en" />

      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
    </>
  );
}
