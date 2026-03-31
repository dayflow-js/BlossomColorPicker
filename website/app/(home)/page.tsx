import type { Metadata } from 'next';

import { LiveDemo } from '@/components/showcase/LiveDemo';

export const metadata: Metadata = {
  title: 'Blossom Color Picker - Blooming Animation Color Picker',
  description:
    'A beautiful, blooming animation color picker for React, Vue, Svelte, and Angular. High performance, framework-agnostic core, and elegant UI.',
  openGraph: {
    title: 'Blossom Color Picker - Blooming Animation Color Picker',
    description:
      'A beautiful, blooming animation color picker for React, Vue, Svelte, and Angular. High performance, framework-agnostic core, and elegant UI.',
  },
};

export default function HomePage() {
  return <LiveDemo />;
}
