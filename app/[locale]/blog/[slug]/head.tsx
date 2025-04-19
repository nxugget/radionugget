import getSeoConfig from '@/next-seo.config';

export default function Head({ params, metadata }: { params: { locale: string; slug: string }; metadata: any }) {
  const { locale } = params;
  const baseSeo = getSeoConfig(locale);

  const title = metadata.title;
  const description = metadata.summary;
  const image = metadata.thumbnail;
  const url = `https://radionugget.com/${locale}/blog/${params.slug}`;

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": title,
    "description": description,
    "image": image,
    "url": url,
    "inLanguage": locale,
    "datePublished": metadata.date,
    "dateModified": metadata.modifiedDate || metadata.date,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    }
  };

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />

      {/* Open Graph */}
      <meta property="og:type" content="article" />
      <meta property="og:locale" content={baseSeo.openGraph.locale} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={baseSeo.openGraph.site_name} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
    </>
  );
}
