import path from 'path';
import { fileURLToPath } from 'url';

import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

import { dualDtsOptions, libFileName } from '../../scripts/dual-dts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      include: ['src'],
      ...dualDtsOptions,
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'BlossomColorPickerVue',
      formats: ['es', 'cjs', 'umd'],
      fileName: libFileName,
    },
    rolldownOptions: {
      external: ['vue', /^@dayflow\/blossom-color-picker/],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
          '@dayflow/blossom-color-picker': 'BlossomColorPicker',
        },
      },
    },
    sourcemap: true,
    emptyOutDir: true,
  },
});
