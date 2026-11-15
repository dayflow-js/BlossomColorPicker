import path from 'path';
import { fileURLToPath } from 'url';

import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

import { dualDtsOptions, libFileName } from '../../scripts/dual-dts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    dts({
      copyDtsFiles: true,
      insertTypesEntry: true,
      include: ['src'],
      ...dualDtsOptions,
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'BlossomColorPicker',
      formats: ['es', 'cjs', 'umd'],
      cssFileName: 'styles',
      fileName: libFileName,
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
