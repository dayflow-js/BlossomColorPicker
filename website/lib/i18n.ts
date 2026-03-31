import { defineI18n } from 'fumadocs-core/i18n';

export const languageCodes = ['en', 'zh', 'zh-hant', 'ja', 'ko', 'de', 'fr'] as const;

export type LanguageCode = (typeof languageCodes)[number];

export const languages = [
  { code: 'en', name: 'English', prefix: '/docs' },
  { code: 'zh', name: '简体中文', prefix: '/docs-zh' },
  { code: 'zh-hant', name: '繁體中文', prefix: '/docs-zh-hant' },
  { code: 'ja', name: '日本語', prefix: '/docs-ja' },
  { code: 'ko', name: '한국어', prefix: '/docs-ko' },
  { code: 'de', name: 'Deutsch', prefix: '/docs-de' },
  { code: 'fr', name: 'Français', prefix: '/docs-fr' },
] as const;

export const defaultLanguage: LanguageCode = 'en';

export const docsI18n = defineI18n({
  languages: [...languageCodes],
  defaultLanguage,
});

export const localeItems = languages.map(language => ({
  locale: language.code,
  name: language.name,
}));

export function getLanguageFromPathname(pathname: string) {
  return (
    [...languages]
      .sort((a, b) => b.prefix.length - a.prefix.length)
      .find(
        language =>
          pathname === language.prefix ||
          pathname.startsWith(`${language.prefix}/`)
      ) ?? languages[0]
  );
}

export function getLanguageCodeFromPathname(pathname: string): LanguageCode {
  return getLanguageFromPathname(pathname).code;
}
