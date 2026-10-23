# Changelog

## v2.5.0 (2026-10-24)

### New Features

- `petalShape`: `circle` (default), `sakura`, `lotus` or `pinwheel`.
- `petalStyle: 'veined'` draws veins on shaped petals.
- `hoverPreview` and `onHover`: preview a petal's color on the ring and core before it is picked.
- `onChangeComplete`: fires once per pick or finished slider drag.
- CSS variables for theming (`--bcp-surface`, `--bcp-track`, `--bcp-focus-ring`, ...). Unset, the picker looks the same as before.
- Keyboard support: arrow keys move between petals, Escape closes, and the shade slider works with the arrow keys.

### Changes

- **Default `alpha` is now `100`** (was `50`), so pickers without a `defaultValue` start opaque.
- `showAlphaSlider` is renamed to `showShadeSlider`; the old name still works.

### Fixes

- Palettes with repeated hues now select the right petal.
- Touch-dragging the slider no longer scrolls the page.
- Empty space around the bloom no longer blocks clicks on the page.
- `sliderPosition` changes now apply to always-open pickers.
- `openOnHover` pickers close after a click once the pointer leaves.
- ChromePicker calls onChange when the alpha slider or color inputs change (#13, thanks @dajiaohuang)

### Website & Release

- New landing page with a petal style switcher, and a Styling page in all docs locales.
- `publish.sh` now runs a version-sync check and the core tests before publishing; `pnpm tag` tags the release.
- Bumped package versions for this release:
  - `@dayflow/blossom-color-picker` -> `2.5.0`
  - `@dayflow/blossom-color-picker-react` -> `1.5.0`
  - `@dayflow/blossom-color-picker-vue` -> `1.5.0`
  - `@dayflow/blossom-color-picker-svelte` -> `1.5.0`
  - `@dayflow/blossom-color-picker-angular` -> `1.5.0`

## v2.4.0 (2026-10-13)

### Animation

- **Reworked bloom animation**
  - Petals now fan open one after another (outer ring clockwise, inner rings alternating) and land with a jelly-like overshoot.
  - The colour ring swells past full size and settles, followed by the arc slider.
  - Closing winds up before folding back, and the trigger button pops in with a short bounce.
  - `animationDuration` (default now `280`) is the base unit of this timeline; every phase scales with it.
  - Transitions are skipped when `prefers-reduced-motion: reduce` is set.

### Changes

- `showCoreColor` now defaults to `false` for `BlossomColorPicker`; `ChromePicker` keeps `true`.
- Collapsible pickers render a dedicated trigger button that cross-fades with the expanded core.
- The default palette is laid out with yellow at 12 o'clock, running warm to cool clockwise.

### Website & Docs

- Demo palettes for the multi-layer example are generated as a colour wheel that follows the picker's ring layout.
- Documented the animation timing in all localized option references.

## v2.3.0 (2026-09-07)

- Upgrade to Vite 8, Next.js 16.3, Svelte 5.57, and current Fumadocs and Tailwind releases.
- **Breaking (Angular wrapper):** require Angular 22 and build with TypeScript 6.0. Release this wrapper change as a new major version.
- Standardize development and CI on Node.js 24 and pnpm 10 with a frozen lockfile.
- Preserve React 18 support in the React wrapper and use React 19 in the documentation site.
- Add CSS import declarations for TypeScript 6 and include the ChromePicker declaration in the Svelte package.
- Keep newly introduced React compiler lint diagnostics as warnings for follow-up review.
- Bumped package versions for this release:
  - `@dayflow/blossom-color-picker` -> `2.3.0`
  - `@dayflow/blossom-color-picker-react` -> `1.3.0`
  - `@dayflow/blossom-color-picker-vue` -> `1.3.0`
  - `@dayflow/blossom-color-picker-svelte` -> `1.3.0`
  - `@dayflow/blossom-color-picker-angular` -> `1.3.0`

## v2.2.1 (2026-05-05)

- Removed a leftover debug `console.log` from the core package entry (#8, thanks @mertarica).
- Website: shared docs layout across locales, added the Dayflow Calendar link, and updated the basic demo.
- Bumped package versions for this release:
  - `@dayflow/blossom-color-picker` -> `2.2.1`
  - `@dayflow/blossom-color-picker-react` -> `1.2.1`
  - `@dayflow/blossom-color-picker-vue` -> `1.2.1`
  - `@dayflow/blossom-color-picker-svelte` -> `1.2.1`
  - `@dayflow/blossom-color-picker-angular` -> `1.2.1`

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
