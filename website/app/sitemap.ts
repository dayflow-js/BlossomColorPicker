import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

import { source } from '@/lib/source';

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://dayflow-js.github.io/blossomColorPicker';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const docPages = source.getPages().map(page => ({
    url: `${BASE_URL}${page.url}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: page.url === '/docs' ? 0.9 : 0.8,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    ...docPages,
  ];
}
