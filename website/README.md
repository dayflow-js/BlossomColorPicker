# Blossom Color Picker Website

This is the documentation website for Blossom Color Picker, built with Next.js and Fumadocs.

## Getting Started

Use Node.js 24 (see the root `.nvmrc`) and pnpm 10.34.5. Run these commands from the repository root:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm --filter './packages/**' build
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:5177](http://localhost:5177) to view the landing page, or [http://localhost:5177/docs/introduction](http://localhost:5177/docs/introduction) for the documentation. The root `dev` command builds the core and React packages before starting the full website.

Use `pnpm dev:demo` for the standalone Vite component demo. To watch component package changes while working on the website, run `pnpm dev:packages` in another terminal.

## Building for Production

To build the static website:

```bash
pnpm build
```

The output will be in the `website/out` directory. `pnpm typecheck` checks all packages and the website.
