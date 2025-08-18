import { MetadataRoute } from 'next';
import { getAllPosts } from '@/src/lib/getPosts';
import { getSatellites } from '@/src/lib/satelliteAPI';

const baseUrl = 'https://radionugget.com';
const locales = ['fr', 'en'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = getAllPosts();
  
  // Fetch all satellites for sitemap
  const satellites = await getSatellites();

  const staticPaths = ['', '/blog', '/gallery', '/tools/grid-square', '/tools/satellite-prediction', '/tools/area-sat'];
  const staticPages: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const path of staticPaths) {
      staticPages.push({
        url: `${baseUrl}/${locale}${path}`,
        lastModified: new Date(),
        priority: 0.8,
      });
    }
  }

  const postPages: MetadataRoute.Sitemap = [];
  for (const locale of locales) {
    for (const post of posts) {
      const formattedSlug = post.slug.replace(/\/\d{4}(?=\/)/, '');
      postPages.push({
        url: `${baseUrl}/${locale}${formattedSlug}`,
        priority: 1.0,
      });
    }
  }
  
  // Create entries for individual satellite pages
  const satellitePages: MetadataRoute.Sitemap = [];
  for (const locale of locales) {
    for (const satellite of satellites) {
      satellitePages.push({
        url: `${baseUrl}/${locale}/tools/area-sat?satelliteId=${encodeURIComponent(satellite.id)}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      });
    }
  }

  return [...staticPages, ...postPages, ...satellitePages];
}
