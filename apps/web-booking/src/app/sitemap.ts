import type { MetadataRoute } from 'next';
import { SITE_URL } from '../lib/api';

const PAGES: {
  path: string;
  priority: number;
  freq: 'daily' | 'weekly' | 'monthly';
}[] = [
  { path: '/', priority: 1, freq: 'daily' },
  { path: '/pricing', priority: 0.8, freq: 'weekly' },
  { path: '/cargo', priority: 0.7, freq: 'weekly' },
  { path: '/cargo/book', priority: 0.6, freq: 'monthly' },
  { path: '/cargo/track', priority: 0.5, freq: 'monthly' },
  { path: '/my-tickets', priority: 0.5, freq: 'monthly' },
  { path: '/about', priority: 0.5, freq: 'monthly' },
  { path: '/faq', priority: 0.5, freq: 'monthly' },
  { path: '/contact', priority: 0.5, freq: 'monthly' },
  { path: '/terms', priority: 0.3, freq: 'monthly' },
  { path: '/privacy', priority: 0.3, freq: 'monthly' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return PAGES.map((p) => ({
    url: new URL(p.path, SITE_URL).toString(),
    lastModified: now,
    changeFrequency: p.freq,
    priority: p.priority,
  }));
}
