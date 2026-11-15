import path from 'path';
import { fileURLToPath } from 'url';

import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [svelte()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'BlossomColorPickerSvelte',
      formats: ['es', 'umd'],
      fileName: format => `index.${format === 'es' ? 'esm.js' : 'js'}`,
    },
    rolldownOptions: {
      external: ['svelte', /^@dayflow\/blossom-color-picker/],
      output: {
        exports: 'named',
        globals: {
          svelte: 'Svelte',
          '@dayflow/blossom-color-picker': 'BlossomColorPicker',
        },
      },
    },
    sourcemap: true,
    emptyOutDir: true,
  },
});
