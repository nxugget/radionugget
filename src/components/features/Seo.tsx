'use client';
import { DefaultSeo } from 'next-seo';
import getSeoConfig from '@/next-seo.config';

export default function Seo({ locale }: { locale: string }) {
  const SEO = getSeoConfig(locale);
  return <DefaultSeo {...SEO} />;
}
