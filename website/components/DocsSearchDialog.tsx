'use client';

import { useOnChange } from 'fumadocs-core/utils/use-on-change';
import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogFooter,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
  TagsList,
  TagsListItem,
} from 'fumadocs-ui/components/dialog/search';
import { useI18n } from 'fumadocs-ui/contexts/i18n';
import Search from 'flexsearch';
import { useEffect, useMemo, useState } from 'react';

type SearchLink = [name: string, href: string];

type TagItem = {
  name: string;
  value: string;
};

type SearchResultItem = {
  type: 'page' | 'heading' | 'text';
  id: string;
  content: string;
  url: string;
  breadcrumbs?: string[];
};

type SearchDocument = SearchResultItem & {
  page_id: string;
  tags: string[];
};

interface DocsSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  links?: SearchLink[];
  defaultTag?: string;
  tags?: TagItem[];
  api?: string;
  delayMs?: number;
  footer?: React.ReactNode;
  allowClear?: boolean;
}

function isCjkLocale(locale: string) {
  return locale === 'zh' || locale === 'zh-hant' || locale === 'ja' || locale === 'ko';
}

function createSearchDocument(locale: string) {
  return new Search.Document<SearchDocument>({
    tokenize: 'full',
    ...(isCjkLocale(locale) ? { encoder: Search.Charset.CJK } : {}),
    document: {
      id: 'id',
      index: ['content'],
      tag: ['tags'],
      store: true,
    },
  });
}

type SearchIndexDocument = ReturnType<typeof createSearchDocument>;

const searchCache = new Map<
  string,
  Promise<Map<string, SearchIndexDocument>>
>();

async function loadSearchDatabases(from = '/api/search') {
  const cached = searchCache.get(from);
  if (cached) return cached;

  const promise = (async () => {
    const response = await fetch(from);

    if (!response.ok) {
      throw new Error(
        `failed to fetch exported search indexes from ${from}`
      );
    }

    const data = await response.json();
    const databases = new Map<string, SearchIndexDocument>();

    if (data.type === 'i18n') {
      for (const [locale, raw] of Object.entries(
        data.raw as Record<string, Record<string, string>>
      )) {
        const document = createSearchDocument(locale);

        for (const [key, value] of Object.entries(raw)) {
          document.import(key, value);
        }

        databases.set(locale, document);
      }

      return databases;
    }

    const document = createSearchDocument('');

    for (const [key, value] of Object.entries(
      data.raw as Record<string, string>
    )) {
      document.import(key, value);
    }

    databases.set('', document);
    return databases;
  })();

  searchCache.set(from, promise);
  return promise;
}

async function searchStaticDocs({
  from,
  locale,
  query,
  tag,
}: {
  from?: string;
  locale?: string;
  query: string;
  tag?: string;
}) {
  const database = (await loadSearchDatabases(from)).get(locale ?? '');
  if (!database) return [];

  const matches = await database.searchAsync(query, {
    index: 'content',
    limit: 60,
    tag: tag ? { tags: tag } : undefined,
  });

  if (matches.length === 0) return [];

  const out: SearchResultItem[] = [];
  const results = matches[0]?.result ?? [];
  const grouped = new Map<string, SearchDocument[]>();

  for (const id of results) {
    const document = database.get(id);
    if (!document) continue;

    let list = grouped.get(document.page_id);
    if (!list) {
      list = [];
      grouped.set(document.page_id, list);
    }

    if (document.type !== 'page') {
      list.push(document);
    }
  }

  for (const [pageId, documents] of grouped) {
    const page = database.get(pageId);
    if (!page) continue;

    out.push({
      id: pageId,
      type: 'page',
      content: page.content,
      breadcrumbs: page.breadcrumbs,
      url: page.url,
    });

    for (const document of documents) {
      out.push({
        id: document.id,
        type: document.type,
        content: document.content,
        breadcrumbs: document.breadcrumbs,
        url: document.url,
      });
    }
  }

  return out;
}

export function DocsSearchDialog({
  defaultTag,
  tags = [],
  api,
  delayMs,
  allowClear = false,
  links = [],
  footer,
  ...props
}: DocsSearchDialogProps) {
  const { locale } = useI18n();
  const [tag, setTag] = useState(defaultTag);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<SearchResultItem[] | 'empty'>('empty');
  const [isLoading, setIsLoading] = useState(false);

  const defaultItems = useMemo(() => {
    if (links.length === 0) return null;

    return links.map(([name, link]) => ({
      type: 'page' as const,
      id: name,
      content: name,
      url: link,
    }));
  }, [links]);

  useOnChange(defaultTag, value => {
    setTag(value);
  });

  useEffect(() => {
    let active = true;
    const timeoutId = window.setTimeout(async () => {
      if (search.length === 0) {
        if (active) {
          setResults('empty');
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);

      try {
        const nextResults = await searchStaticDocs({
          from: api,
          locale,
          query: search,
          tag,
        });

        if (active) {
          setResults(nextResults);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }, delayMs ?? 100);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [api, delayMs, locale, search, tag]);

  return (
    <SearchDialog
      search={search}
      onSearchChange={setSearch}
      isLoading={isLoading}
      {...props}
    >
      <SearchDialogOverlay />
      <SearchDialogContent>
        <SearchDialogHeader>
          <SearchDialogIcon />
          <SearchDialogInput />
          <SearchDialogClose />
        </SearchDialogHeader>
        <SearchDialogList
          items={results !== 'empty' ? results : defaultItems}
        />
      </SearchDialogContent>
      <SearchDialogFooter>
        {tags.length > 0 && (
          <TagsList tag={tag} onTagChange={setTag} allowClear={allowClear}>
            {tags.map(item => (
              <TagsListItem key={item.value} value={item.value}>
                {item.name}
              </TagsListItem>
            ))}
          </TagsList>
        )}
        {footer}
      </SearchDialogFooter>
    </SearchDialog>
  );
}
