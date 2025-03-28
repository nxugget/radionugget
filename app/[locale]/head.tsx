import getSeoConfig from '@/next-seo.config';

export default function Head({ params }: { params: { locale: string } }) {
  const seo = getSeoConfig(params.locale);

  return (
    <>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta property="og:type" content={seo.openGraph.type} />
      <meta property="og:locale" content={seo.openGraph.locale} />
      <meta property="og:url" content={seo.openGraph.url} />
      <meta property="og:site_name" content={seo.openGraph.site_name} />
      <meta property="og:title" content={seo.openGraph.title} />
      <meta property="og:description" content={seo.openGraph.description} />

      <link rel="alternate" hrefLang="fr" href="https://radionugget.com/fr" />
      <link rel="alternate" hrefLang="en" href="https://radionugget.com/en" />
      <link rel="alternate" hrefLang="x-default" href="https://radionugget.com/en" />

    </>
  );
}
