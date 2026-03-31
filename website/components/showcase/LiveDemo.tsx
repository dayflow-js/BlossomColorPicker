'use client';

import Link from 'next/link';

import { BlossomColorPickerShowcase } from './BlossomColorPickerShowcase';

export function LiveDemo() {
  return (
    <div className='live-demo-container mx-auto overflow-x-hidden'>
      <section className='space-y-12 py-8'>
        <div className='mx-auto text-center'>
          <span className='inline-flex items-center rounded-full bg-pink-50 px-3 py-1 text-xs font-medium tracking-wide text-pink-600 uppercase dark:bg-pink-500/10 dark:text-pink-300'>
            Blooming Color Picker for Modern Web Apps
          </span>
          <h1 className='mt-6 px-6 text-3xl leading-tight font-semibold sm:text-5xl'>
            A beautiful, blooming color picker for Web
          </h1>
          <p className='mt-4 text-base text-slate-600 sm:text-lg dark:text-slate-400'>
            Blossom color picker provides an elegant and high-performance color
            picking experience.
          </p>
          <div className='mt-8 flex flex-wrap items-center justify-center gap-4'>
            <Link
              href='/docs/introduction'
              className='inline-flex items-center justify-center rounded-full bg-pink-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-pink-400'
            >
              Get started
            </Link>
            <Link
              href='https://github.com/dayflow-js/BlossomColorPicker'
              className='inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-pink-200 hover:text-pink-500 dark:border-slate-700 dark:text-slate-200 dark:hover:border-pink-500/60 dark:hover:text-pink-300'
            >
              View on GitHub
            </Link>
          </div>
        </div>
      </section>

      <section className='space-y-6 py-4'>
        <div className='flex justify-center'>
          <BlossomColorPickerShowcase />
        </div>
      </section>

      <footer className='py-8 text-center text-sm text-slate-500 dark:text-slate-400'>
        MIT {new Date().getFullYear()} © Blossom.
      </footer>
    </div>
  );
}
