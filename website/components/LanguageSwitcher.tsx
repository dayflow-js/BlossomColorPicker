'use client';

import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import { Languages } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { getLanguageFromPathname, languages } from '@/lib/i18n';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

function switchTo(code: string, currentPath: string) {
  const currentLanguage = getLanguageFromPathname(currentPath);
  const nextLanguage = languages.find(language => language.code === code);

  if (!nextLanguage) return;

  const isDocsPath = languages.some(
    language =>
      currentPath === language.prefix ||
      currentPath.startsWith(`${language.prefix}/`)
  );

  if (!isDocsPath) {
    localStorage.setItem('dayflow-locale', code);
    window.location.href = `${BASE}${nextLanguage.prefix}/introduction`;
    return;
  }

  let contentPath = currentPath;
  if (
    currentPath === currentLanguage.prefix ||
    currentPath.startsWith(`${currentLanguage.prefix}/`)
  ) {
    contentPath = currentPath.slice(currentLanguage.prefix.length) || '/';
  }

  if (!contentPath.startsWith('/')) {
    contentPath = `/${contentPath}`;
  }

  const nextPath =
    contentPath === '/'
      ? nextLanguage.prefix
      : `${nextLanguage.prefix}${contentPath}`;

  localStorage.setItem('dayflow-locale', code);
  window.location.href = `${BASE}${nextPath}`;
}

export function LanguageSwitcher() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentLanguage = getLanguageFromPathname(pathname);

  useEffect(() => {
    function onMouseDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener('mousedown', onMouseDown);
    }

    return () => {
      document.removeEventListener('mousedown', onMouseDown);
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div ref={containerRef} className='relative mr-4'>
      <button
        type='button'
        aria-label='Switch language'
        aria-expanded={open}
        aria-haspopup='menu'
        onClick={() => setOpen(value => !value)}
        className={buttonVariants({ size: 'icon-sm', color: 'ghost' })}
      >
        <Languages className='size-4' />
      </button>

      {open && (
        <div className='bg-fd-background absolute end-0 top-full z-50 mt-1 w-36 rounded-lg border py-1 shadow-md'>
          {languages.map(language => (
            <button
              key={language.code}
              type='button'
              onClick={() => {
                setOpen(false);
                switchTo(language.code, pathname);
              }}
              className={`hover:bg-fd-accent hover:text-fd-accent-foreground flex w-full items-center justify-between px-3 py-1.5 text-sm transition-colors ${
                currentLanguage.code === language.code
                  ? 'text-fd-primary font-medium'
                  : 'text-fd-muted-foreground'
              }`}
            >
              {language.name}
              {currentLanguage.code === language.code && (
                <svg
                  className='size-3.5'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                  aria-hidden='true'
                >
                  <path
                    fillRule='evenodd'
                    clipRule='evenodd'
                    d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
