import { MetadataRoute } from 'next';
import { getAllPosts } from '@/src/lib/getPosts';

const baseUrl = 'https://radionugget.com';
const locales = ['fr', 'en'];

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();

  const staticPaths = ['', '/blog', '/gallery', '/tools/grid-square'];
  const staticPages: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const path of staticPaths) {
      staticPages.push({
        url: `${baseUrl}/${locale}${path}`,
        lastModified: new Date(),
      });
    }
  }

  const postPages: MetadataRoute.Sitemap = [];
  for (const locale of locales) {
    for (const post of posts) {

      const formattedSlug = post.slug.replace(/\/\d{4}(?=\/)/, '');
      postPages.push({
        url: `${baseUrl}/${locale}${formattedSlug}`,
        lastModified: new Date(post.metadata.date),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  }

  return [...staticPages, ...postPages];
}
