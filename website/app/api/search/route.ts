import { flexsearchI18n } from 'fumadocs-core/search/flexsearch';

import { docsI18n } from '@/lib/i18n';
import {
  source,
  sourceDe,
  sourceFr,
  sourceJa,
  sourceKo,
  sourceZh,
  sourceZhHant,
} from '@/lib/source';

export const dynamic = 'force-static';

const sourcesByLocale = {
  en: source,
  zh: sourceZh,
  'zh-hant': sourceZhHant,
  ja: sourceJa,
  ko: sourceKo,
  de: sourceDe,
  fr: sourceFr,
} as const;

type SearchSource = (typeof sourcesByLocale)[keyof typeof sourcesByLocale];
type SearchPage = ReturnType<SearchSource['getPages']>[number];

type TreeNode = {
  type?: string;
  name?: unknown;
  url?: string;
  children?: TreeNode[];
};

function findPagePath(
  nodes: TreeNode[] | undefined,
  url: string,
  parents: TreeNode[] = []
): TreeNode[] | undefined {
  if (!nodes) return;

  for (const node of nodes) {
    const nextParents = [...parents, node];

    if (node.type === 'page' && node.url === url) {
      return nextParents;
    }

    const nested = findPagePath(node.children, url, nextParents);
    if (nested) return nested;
  }
}

function buildBreadcrumbs(docSource: SearchSource, page: SearchPage) {
  const tree = docSource.getPageTree() as TreeNode;
  const path = findPagePath(tree.children, page.url);

  if (!path) return undefined;

  const breadcrumbs: string[] = [];

  if (typeof tree.name === 'string' && tree.name.length > 0) {
    breadcrumbs.push(tree.name);
  }

  for (const node of path.slice(0, -1)) {
    if (typeof node.name === 'string' && node.name.length > 0) {
      breadcrumbs.push(node.name);
    }
  }

  return breadcrumbs.length > 0 ? breadcrumbs : undefined;
}

async function getStructuredData(page: SearchPage) {
  const pageData = page.data as {
    structuredData?: unknown | (() => unknown | Promise<unknown>);
    load?: () => Promise<{ structuredData?: unknown }>;
  };

  if (typeof pageData.structuredData === 'function') {
    return pageData.structuredData();
  }

  if (pageData.structuredData) {
    return pageData.structuredData;
  }

  if (typeof pageData.load === 'function') {
    return (await pageData.load()).structuredData;
  }

  return undefined;
}

async function buildSearchIndex(docSource: SearchSource, page: SearchPage) {
  const structuredData = await getStructuredData(page);

  if (!structuredData) {
    throw new Error(`Cannot build search index for ${page.url}`);
  }

  return {
    id: page.url,
    title: page.data.title ?? page.slugs.at(-1) ?? page.path,
    description: page.data.description,
    url: page.url,
    structuredData,
    breadcrumbs: buildBreadcrumbs(docSource, page),
  };
}

const search = flexsearchI18n({
  i18n: docsI18n,
  localeMap: {
    zh: 'cjk',
    'zh-hant': 'cjk',
    ja: 'cjk',
    ko: 'cjk',
  },
  async indexes() {
    const indexes = Object.entries(sourcesByLocale).flatMap(
      ([locale, docSource]) =>
        docSource.getPages().map(async page => ({
          locale,
          ...(await buildSearchIndex(docSource, page)),
        }))
    );

    return Promise.all(indexes);
  },
});

export const GET = search.staticGET;
