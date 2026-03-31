# v2.0.0

**Breaking Change:** `@dayflow/blossom-color-picker` is now a standalone vanilla JS color picker (zero dependencies).
The React component has moved to a separate package.

## Migration

```diff
- npm install @dayflow/blossom-color-picker
+ npm install @dayflow/blossom-color-picker-react
```

```diff
- import { BlossomColorPicker } from '@dayflow/blossom-color-picker';
+ import { BlossomColorPicker } from '@dayflow/blossom-color-picker-react';
```

Props and behavior remain the same — only the import path changes.

## What's New

- **Vanilla JS core** — use directly with `new BlossomColorPicker(el, options)`, no framework required
- **Vue 3 support** — `@dayflow/blossom-color-picker-vue`
- **Svelte 5 support** — `@dayflow/blossom-color-picker-svelte`
- **Angular 16+ support** — `@dayflow/blossom-color-picker-angular`
- **Adaptive Positioning** — picker auto-shifts to stay within viewport on mobile
- **Slider Position** — configurable arc slider placement (`top` / `bottom` / `left` / `right`)
- **iOS Safari fix** — slider no longer causes page scrolling on touch devices
