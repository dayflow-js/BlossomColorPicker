import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import React from 'react';
// any fix

import { DocsHeader } from '@/components/DocsHeader';
import { baseOptions, gitConfig } from '@/lib/layout.shared';
import { sourceDe } from '@/lib/source';

export default function Layout({ children }: any) {
  return (
    <DocsLayout
      tree={sourceDe.getPageTree()}
      {...baseOptions()}
      links={[]}
      nav={{
        component: (
          <DocsHeader
            githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}`}
          />
        ),
      }}
      sidebar={{ collapsible: false }}
      containerProps={{
        style: {
          '--fd-banner-height': '56px',
          gridTemplate: `"banner banner banner banner banner" 56px "sidebar sidebar header toc toc" "sidebar sidebar toc-popover toc toc" "sidebar sidebar main toc toc" 1fr / minmax(min-content, 1fr) var(--fd-sidebar-col) minmax(0, calc(var(--fd-layout-width,97rem) - var(--fd-sidebar-width) - var(--fd-toc-width))) var(--fd-toc-width) minmax(min-content, 1fr)`,
        } as React.CSSProperties,
      }}
    >
      {children}
    </DocsLayout>
  );
}
