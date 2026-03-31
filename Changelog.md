# Changelog

## v2.2.0 (2026-03-31)

### New Features

- **ChromePicker Across All Packages**
  - Added `ChromePicker` to the vanilla JS core package.
  - Exposed `ChromePicker` for React, Vue, Svelte, and Angular wrappers.
  - Added direct RGBA / HSLA / HEX editing support for more precise color input workflows.

### Website & Docs

- **New Documentation Site**
  - Migrated the docs site to Fumadocs and refreshed the overall documentation structure.
  - Added built-in docs search and static export support for GitHub Pages deployment.
  - Added localized documentation for English, Chinese, Traditional Chinese, Japanese, Korean, French, and German.
- **Examples & Guides Refresh**
  - Updated demos, framework install guidance, and ChromePicker docs across packages and the website.

### Tooling & Release

- **Release Workflow Improvements**
  - Added `oxlint`, `oxfmt`, and `lefthook` for more consistent local checks.
  - Added `scripts/bump_all.sh` to bump package versions together and keep wrapper core dependencies in sync.
  - Bumped package versions for this release:
    - `@dayflow/blossom-color-picker` -> `2.2.0`
    - `@dayflow/blossom-color-picker-react` -> `1.2.0`
    - `@dayflow/blossom-color-picker-vue` -> `1.2.0`
    - `@dayflow/blossom-color-picker-svelte` -> `1.2.0`
    - `@dayflow/blossom-color-picker-angular` -> `1.2.0`

---

## v2.1.0 (2026-03-04)

### New Features

- **New Customization Options**
  - Added `circularBarWidth`: Customize the thickness of the circular color bar.
  - Added `sliderWidth`: Customize the width of the arc slider handle.
  - Added `sliderOffset`: Fine-tune the radial distance of the slider from the center.
- **Improved Visuals & Animations**
  - Enhanced petal display and blooming animations for a smoother feel.
  - Fixed an issue where petals might appear incomplete during certain animation states.

---

## v2.0.0 （2026-02-09）

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
