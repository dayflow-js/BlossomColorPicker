import path from 'path';
import { fileURLToPath } from 'url';

import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    dts({
      copyDtsFiles: true,
      insertTypesEntry: true,
      include: ['src'],
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'BlossomColorPicker',
      formats: ['es', 'umd'],
      cssFileName: 'styles',
      fileName: format => `index.${format === 'es' ? 'esm.js' : 'js'}`,
    },
    rolldownOptions: {
      output: {
        exports: 'named',
      },
    },
    sourcemap: true,
    emptyOutDir: true,
  },
});
