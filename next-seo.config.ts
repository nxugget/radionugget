const enConfig = {
  title: "RadioNugget",
  description: "English description for SEO",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://radionugget.com/en",
    site_name: "RadioNugget",
  },
};

const frConfig = {
  title: "Titre du Site",
  description: "Description en français pour le SEO",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://radionugget.com/fr",
    site_name: "RadioNugget",
  },
};

export default function getSeoConfig(locale: string) {
  return locale.startsWith("fr") ? frConfig : enConfig;
}
