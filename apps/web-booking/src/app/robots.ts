import type { MetadataRoute } from 'next';
import { SITE_URL } from '../lib/api';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/booking/', '/my-tickets/', '/cargo/success/'],
      },
    ],
    sitemap: new URL('/sitemap.xml', SITE_URL).toString(),
  };
}
