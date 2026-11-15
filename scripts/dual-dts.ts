// Shared vite-plugin-dts options for packages that ship both ESM and CJS.
// Emits each declaration twice: `.d.ts` for the `import` condition and
// `.d.cts` for `require`. Relative specifiers inside the `.d.cts` copies are
// rewritten from `.js` to `.cjs` so they resolve to the sibling `.d.cts`
// files instead of the ESM `.d.ts` ones.
const RELATIVE_JS_SPECIFIER =
  /(\bfrom\s*|\bimport\(\s*)(['"])(\.{1,2}\/[^'"]+?)\.js\2/g;

export const dualDtsOptions = {
  outDirs: ['dist', { dir: 'dist', moduleFormat: 'cjs' as const }],
  beforeWriteFile(filePath: string, content: string) {
    if (!filePath.endsWith('.d.cts')) return;
    return { content: content.replace(RELATIVE_JS_SPECIFIER, '$1$2$3.cjs$2') };
  },
};

export const libFileName = (format: string) =>
  ({ es: 'index.esm.js', cjs: 'index.cjs', umd: 'index.js' })[format] ??
  `index.${format}.js`;
