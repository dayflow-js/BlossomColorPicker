import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Image from 'next/image';

import { Badge } from '@/components/ui/badge';
import { calendarUrl, proUrl, schedulerUrl } from '@/lib/ecosystem';

function GithubButton() {
  return (
    <svg
      fill='currentColor'
      viewBox='3 3 18 18'
      height='24'
      aria-label='Project repository'
      className='size-4'
    >
      <path d='M12 3C7.0275 3 3 7.12937 3 12.2276C3 16.3109 5.57625 19.7597 9.15374 20.9824C9.60374 21.0631 9.77249 20.7863 9.77249 20.5441C9.77249 20.3249 9.76125 19.5982 9.76125 18.8254C7.5 19.2522 6.915 18.2602 6.735 17.7412C6.63375 17.4759 6.19499 16.6569 5.8125 16.4378C5.4975 16.2647 5.0475 15.838 5.80124 15.8264C6.51 15.8149 7.01625 16.4954 7.18499 16.7723C7.99499 18.1679 9.28875 17.7758 9.80625 17.5335C9.885 16.9337 10.1212 16.53 10.38 16.2993C8.3775 16.0687 6.285 15.2728 6.285 11.7432C6.285 10.7397 6.63375 9.9092 7.20749 9.26326C7.1175 9.03257 6.8025 8.08674 7.2975 6.81794C7.2975 6.81794 8.05125 6.57571 9.77249 7.76377C10.4925 7.55615 11.2575 7.45234 12.0225 7.45234C12.7875 7.45234 13.5525 7.55615 14.2725 7.76377C15.9937 6.56418 16.7475 6.81794 16.7475 6.81794C17.2424 8.08674 16.9275 9.03257 16.8375 9.26326C17.4113 9.9092 17.76 10.7281 17.76 11.7432C17.76 15.2843 15.6563 16.0687 13.6537 16.2993C13.98 16.5877 14.2613 17.1414 14.2613 18.0065C14.2613 19.2407 14.25 20.2326 14.25 20.5441C14.25 20.7863 14.4188 21.0746 14.8688 20.9824C16.6554 20.364 18.2079 19.1866 19.3078 17.6162C20.4077 16.0457 20.9995 14.1611 21 12.2276C21 7.12937 16.9725 3 12 3Z' />
    </svg>
  );
}

export const gitConfig = {
  user: 'dayflow-js',
  repo: 'BlossomColorPicker',
  branch: 'main',
};

const NavTitle = (
  <span className='flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white'>
    <span className='text-2xl' role='img' aria-label='Blossom'>
      🌸
    </span>
    Blossom Color Picker
  </span>
);

const githubUrl = `https://github.com/${gitConfig.user}/${gitConfig.repo}`;

const BASE = process.env.BASE_PATH || '';
const CALENDAR_URL = calendarUrl('nav');
const PRO_URL = proUrl('nav');
const SCHEDULER_URL = schedulerUrl('nav');

const CalendarLink = (
  <a
    href={CALENDAR_URL}
    target='_blank'
    rel='noopener noreferrer'
    className='inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
  >
    <Image
      src={`${BASE}/logo.png`}
      alt='DayFlow Calendar logo'
      width={486}
      height={424}
      className='h-6 w-auto'
    />
    Calendar
  </a>
);

const ProLink = (
  <a
    href={PRO_URL}
    target='_blank'
    rel='noopener noreferrer'
    className='inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
  >
    <Image
      src={`${BASE}/pro-logo.png`}
      alt='DayFlow Pro logo'
      width={1254}
      height={1254}
      className='h-6 w-auto'
    />
    <Badge
      variant='outline'
      className='border-amber-200 bg-amber-50 px-1.5 py-0 text-[10px] font-bold tracking-[0.16em] text-amber-700 uppercase dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200'
    >
      Pro
    </Badge>
  </a>
);

const SchedulerLink = (
  <a
    href={SCHEDULER_URL}
    target='_blank'
    rel='noopener noreferrer'
    className='inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
  >
    <Image
      src={`${BASE}/schedule-logo.png`}
      alt='Dayflow Scheduler logo'
      width={1254}
      height={1254}
      className='h-6 w-auto'
    />
    <Badge
      variant='outline'
      className='border-sky-200 bg-sky-50 px-1.5 py-0 text-[10px] font-bold tracking-[0.12em] text-sky-700 uppercase dark:border-sky-400/30 dark:bg-sky-400/10 dark:text-sky-200'
    >
      Scheduler
    </Badge>
  </a>
);

export const sidebarTabs = [
  {
    title: 'Blossom Color Picker',
    url: '/docs',
    icon: (
      <span
        className='from-fd-background to-fd-secondary flex size-6 items-center justify-center rounded-md border bg-gradient-to-b text-xs shadow-sm'
        role='img'
        aria-label='Blossom'
      >
        🌸
      </span>
    ),
  },
  {
    title: 'Calendar',
    url: calendarUrl('docs_sidebar'),
    icon: (
      <div className='from-fd-background to-fd-secondary flex size-6 items-center justify-center rounded-md border bg-gradient-to-b shadow-sm'>
        <Image
          src={`${BASE}/logo.png`}
          alt='Dayflow'
          width={16}
          height={16}
          className='size-3.5'
        />
      </div>
    ),
  },
  {
    title: 'Calendar Pro',
    url: proUrl('docs_sidebar'),
    icon: (
      <div className='from-fd-background to-fd-secondary flex size-6 items-center justify-center rounded-md border bg-gradient-to-b shadow-sm'>
        <Image
          src={`${BASE}/pro-logo.png`}
          alt='DayFlow Pro'
          width={16}
          height={16}
          className='size-3.5'
        />
      </div>
    ),
  },
  {
    title: 'Scheduler',
    url: schedulerUrl('docs_sidebar'),
    icon: (
      <div className='from-fd-background to-fd-secondary flex size-6 items-center justify-center rounded-md border bg-gradient-to-b shadow-sm'>
        <Image
          src={`${BASE}/schedule-logo.png`}
          alt='Dayflow Scheduler'
          width={16}
          height={16}
          className='size-3.5'
        />
      </div>
    ),
  },
];

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: NavTitle,
    },
    links: [
      {
        type: 'custom',
        children: CalendarLink,
      },
      {
        type: 'custom',
        children: ProLink,
      },
      {
        type: 'custom',
        children: SchedulerLink,
      },
      {
        type: 'icon',
        text: 'GitHub',
        label: 'GitHub',
        icon: <GithubButton />,
        url: githubUrl,
        external: true,
      },
    ],
  };
}

export function homeOptions(): BaseLayoutProps {
  return baseOptions();
}
