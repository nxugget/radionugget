'use client';
import Seo from '@/src/components/features/Seo';

export default function Head({ params }: { params: { locale: string } }) {
  return <Seo locale={params.locale} />;
}
