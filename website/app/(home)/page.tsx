import type { Metadata } from 'next';
import { Bricolage_Grotesque } from 'next/font/google';

import { Landing } from '@/components/landing/Landing';

const display = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display',
});

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
  return (
    <div className={display.variable}>
      <Landing />
    </div>
  );
}
