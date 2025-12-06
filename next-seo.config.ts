const enConfig = {
  title: "RadioNugget | Radiofrequency and Satellites",
  description:
    "Radiofrequency and Satellites: Dive into the captivating world of radio waves",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://radionugget.com/en",
    site_name: "RadioNugget",
    title: "RadioNugget | Radiofrequency and Satellites",
    description:
      "Explore radiofrequency and satellite technologies with RadioNugget. Learn about the fascinating world of radio waves.",
  },
};

const frConfig = {
  title: "RadioNugget | Radiofréquence et Satellites",
  description:
    "Radiofréquence et Satellites : Plongez dans l’univers fascinant des ondes radio",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://radionugget.com/fr",
    site_name: "RadioNugget",
    title: "RadioNugget | Radiofréquence et Satellites",
    description:
      "Explorez les technologies de la radiofréquence et des satellites avec RadioNugget. Découvrez le monde fascinant des ondes radio.",
  },
};

export type SeoConfig = typeof enConfig;

export default function getSeoConfig(locale?: string): SeoConfig {
  const normalized = (locale || "en").toLowerCase();
  return normalized.startsWith("fr") ? frConfig : enConfig;
}
