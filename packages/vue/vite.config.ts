import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      include: ['src'],
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'BlossomColorPickerVue',
      formats: ['es', 'umd'],
      fileName: (format) => `index.${format === 'es' ? 'esm.js' : 'js'}`,
    },
    rollupOptions: {
      external: [
        'vue',
        /^@dayflow\/blossom-color-picker/,
      ],
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
