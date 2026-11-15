// Emits declarations with real prop types for the .svelte components.
// vite-plugin-dts can only stub .svelte files as an untyped SvelteComponent.
import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

import { emitDts } from 'svelte2tsx';

const require = createRequire(import.meta.url);
const fromRoot = path => fileURLToPath(new URL(`../${path}`, import.meta.url));

await emitDts({
  declarationDir: fromRoot('dist'),
  libRoot: fromRoot('src'),
  tsconfig: fromRoot('tsconfig.json'),
  svelteShimsPath: require.resolve('svelte2tsx/svelte-shims-v4.d.ts'),
});

// `./X.svelte` only resolves to X.svelte.d.ts under bundler resolution.
// `./X.svelte.js` resolves to it under node16/nodenext as well.
const entry = fromRoot('dist/index.d.ts');
const source = await readFile(entry, 'utf8');
await writeFile(
  entry,
  source.replace(/(from\s*)(['"])(\.{1,2}\/[^'"]+\.svelte)\2/g, '$1$2$3.js$2')
);
