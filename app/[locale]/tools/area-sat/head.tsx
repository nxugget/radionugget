import getSeoConfig from '@/next-seo.config';
import { getSatellites } from '@/src/lib/satelliteAPI';

export default async function Head({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const { locale } = params;
  const areaSatId =
    typeof searchParams?.satelliteId === "string"
      ? searchParams.satelliteId
      : Array.isArray(searchParams?.satelliteId)
      ? searchParams?.satelliteId[0]
      : undefined;
  const baseSeo = getSeoConfig(locale);
  const isFr = locale.startsWith('fr');

  const areaSats = await getSatellites();
  const selectedAreaSat = areaSatId
    ? areaSats.find((sat) => sat.id?.toString() === areaSatId?.toString())
    : null;

  let title, description;
  if (areaSatId) {
    if (selectedAreaSat) {
      title = `${selectedAreaSat.name} | Area Sat`;
      description = isFr
        ? `Infos sur ${selectedAreaSat.name} : fréquence, modulation, position et trajectoire en temps réel.`
        : `Info about ${selectedAreaSat.name}: frequency, modulation, real-time position and trajectory.`;
    } else {
      title = isFr
        ? `Satellite inconnu (${areaSatId}) | Area Sat`
        : `Unknown Satellite (${areaSatId}) | Area Sat`;
      description = isFr
        ? `Aucun satellite trouvé pour l'identifiant ${areaSatId}.`
        : `No satellite found for ID ${areaSatId}.`;
    }
  } else {
    title = isFr
      ? 'Area Sat | RadioNugget'
      : 'Area Sat | RadioNugget';
    description = isFr
      ? 'Explorez facilement les satellites avec AreaSat : fréquences, modulations, TLE actualisés, cartes orbitales et polar charts interactives. Le satellite sous toutes ses ondes !'
      : 'Easily explore satellites with AreaSat : real-time frequencies, modulations, updated TLE, interactive maps, and detailed polar charts. All satellite data at your fingertips!';
  }

  const baseUrl = isFr
    ? 'https://radionugget.com/fr/tools/area-sat'
    : 'https://radionugget.com/en/tools/area-sat';
  const url = selectedAreaSat
    ? `${baseUrl}?satelliteId=${encodeURIComponent(selectedAreaSat.id)}`
    : baseUrl;

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content={baseSeo.openGraph.locale} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={baseSeo.openGraph.site_name} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <link rel="alternate" hrefLang="fr" href={`https://radionugget.com/fr/tools/area-sat${selectedAreaSat ? `?satelliteId=${encodeURIComponent(selectedAreaSat.id)}` : ''}`} />
      <link rel="alternate" hrefLang="en" href={`https://radionugget.com/en/tools/area-sat${selectedAreaSat ? `?satelliteId=${encodeURIComponent(selectedAreaSat.id)}` : ''}`} />
      <link rel="alternate" hrefLang="x-default" href={`https://radionugget.com/en/tools/area-sat${selectedAreaSat ? `?satelliteId=${encodeURIComponent(selectedAreaSat.id)}` : ''}`} />
      {selectedAreaSat ? (
        <meta
          name="keywords"
          content={`${selectedAreaSat.name}, satellite tracker, ${selectedAreaSat.name} frequency, ${selectedAreaSat.name} position, amateur radio, radio amateur, ham radio, ${selectedAreaSat.category || ''}, ${selectedAreaSat.country || ''}`}
        />
      ) : (
        <meta
          name="keywords"
          content="satellites, amateur radio, ham radio, radio amateur, satellite tracking, satellite prediction, orbital tracking, satellite pass calculator, ham radio satellites"
        />
      )}
    </>
  );
}
