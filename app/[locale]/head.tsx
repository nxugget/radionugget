import Seo from '@/src/components/features/Seo';

export default function Head({ params }: { params: { locale: string } }) {
  const { locale } = params;
  return (
    <>
      <Seo locale={locale} />
    </>
  );
}
