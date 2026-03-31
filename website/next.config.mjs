import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createMDX } from 'fumadocs-mdx/next';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const websiteNodeModules = path.resolve(__dirname, 'node_modules');

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  output: 'export',
  reactStrictMode: true,
  basePath: process.env.BASE_PATH || '',
  images: {
    unoptimized: true,
  },
  transpilePackages: [
    '@dayflow/blossom-color-picker',
    '@dayflow/blossom-color-picker-react',
    '@dayflow/blossom-color-picker-vue',
    '@dayflow/blossom-color-picker-svelte',
    '@dayflow/blossom-color-picker-angular',
  ],
};

export default withMDX(config);
