import type { Metadata } from 'next';

import './global.css';
import { Inter } from 'next/font/google';

import { AppProvider } from '@/components/AppProvider';

const inter = Inter({
  subsets: ['latin'],
});

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_PATH
      ? `https://dayflow-js.github.io/blossomColorPicker/`
      : 'http://localhost:3000'
  ),
  title: {
    template: '%s | Blossom Color Picker',
    default: 'Blossom Color Picker - Blooming Animation for your UI',
  },
  description:
    'A beautiful, blooming animation color picker for React, Vue, Svelte, and Angular. High performance, customizable, and framework-agnostic.',
  keywords: [
    'color picker',
    'blossom',
    'react color picker',
    'vue color picker',
    'svelte color picker',
    'angular color picker',
    'animation',
    'ui components',
  ],
  openGraph: {
    type: 'website',
    siteName: 'Blossom Color Picker',
    title: {
      template: '%s | Blossom Color Picker',
      default: 'Blossom Color Picker - Blooming Animation for your UI',
    },
    description:
      'A beautiful, blooming animation color picker for React, Vue, Svelte, and Angular.',
    images: [
      {
        url: `${BASE}/logo.png`,
        width: 512,
        height: 512,
        alt: 'Blossom Color Picker Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: {
      template: '%s | Blossom Color Picker',
      default: 'Blossom Color Picker - Blooming Animation for your UI',
    },
    description:
      'A beautiful, blooming animation color picker for React, Vue, Svelte, and Angular.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' className={inter.className} suppressHydrationWarning>
      <body className='flex min-h-screen flex-col'>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
