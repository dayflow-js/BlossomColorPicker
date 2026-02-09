import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Root vite config for dev server (demo site)
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@dayflow/blossom-color-picker-react': path.resolve(__dirname, './packages/react/src'),
      '@dayflow/blossom-color-picker': path.resolve(__dirname, './packages/core/src'),
    },
  },
});
