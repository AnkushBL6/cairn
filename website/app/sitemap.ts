import type { MetadataRoute } from 'next';
import { SKILL_SLUGS } from '@/lib/docs';

const BASE = 'https://cairn-inky-five.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const top = ['', '/docs', '/playground'];
  const skills = SKILL_SLUGS.map((slug) => `/docs/${slug}`);
  return [...top, ...skills].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : path.startsWith('/docs') ? 0.8 : 0.6,
  }));
}
