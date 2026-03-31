'use client';

import { RootProvider } from 'fumadocs-ui/provider/next';
import { usePathname } from 'next/navigation';

import { DocsSearchDialog } from '@/components/DocsSearchDialog';
import { getLanguageCodeFromPathname, localeItems } from '@/lib/i18n';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const locale = getLanguageCodeFromPathname(pathname);

  return (
    <RootProvider
      search={{
        SearchDialog: DocsSearchDialog,
        preload: false,
        options: { api: `${BASE}/api/search` },
      }}
      i18n={{ locale, locales: localeItems }}
    >
      {children}
    </RootProvider>
  );
}
