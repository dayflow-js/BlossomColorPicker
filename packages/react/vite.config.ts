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
      name: 'BlossomColorPickerReact',
      formats: ['es', 'umd'],
      fileName: (format) => `index.${format === 'es' ? 'esm.js' : 'js'}`,
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react-is',
        /^react\//,
        /^react-dom\//,
        /^@dayflow\/blossom-color-picker/,
      ],
      output: {
        banner: '"use client";',
        exports: 'named',
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
          '@dayflow/blossom-color-picker': 'BlossomColorPicker',
        },
      },
    },
    sourcemap: true,
    emptyOutDir: true,
  },
});
