import path from 'path';
import { fileURLToPath } from 'url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/BlossomColorPicker/',
  resolve: {
    alias: {
      '@dayflow/blossom-color-picker-react': path.resolve(
        __dirname,
        './packages/react/src'
      ),
      '@dayflow/blossom-color-picker': path.resolve(
        __dirname,
        './packages/core/src'
      ),
    },
  },
  build: {
    outDir: 'dist-demo',
    emptyOutDir: true,
  },
});
