# Blossom Color Picker

[![npm version](https://img.shields.io/npm/v/@dayflow/blossom-color-picker.svg)](https://www.npmjs.com/package/@dayflow/blossom-color-picker)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/dayflow-js/BlossomColorPicker/pulls)
[![GitHub license](https://img.shields.io/github/license/dayflow-js/BlossomColorPicker)](https://github.com/dayflow-js/BlossomColorPicker/blob/main/LICENSE)

A beautiful, blooming color picker for Web. Available as a standalone vanilla JS class, or as a thin React / Vue / Svelte / Angular wrapper.

https://github.com/user-attachments/assets/553ee0ff-1f52-497f-bc8f-cee9a7b91d66

## Packages

| Package                                 | Description                         | Version |
| :-------------------------------------- | :---------------------------------- | :------ |
| `@dayflow/blossom-color-picker`         | Vanilla JS core (zero dependencies) | 2.4.0   |
| `@dayflow/blossom-color-picker-react`   | React wrapper                       | 1.4.0   |
| `@dayflow/blossom-color-picker-vue`     | Vue 3 wrapper                       | 1.4.0   |
| `@dayflow/blossom-color-picker-svelte`  | Svelte wrapper                      | 1.4.0   |
| `@dayflow/blossom-color-picker-angular` | Angular wrapper                     | 1.4.0   |

## Installation

```bash
# Vanilla JS (core)
npm install @dayflow/blossom-color-picker

# React
npm install @dayflow/blossom-color-picker-react

# Vue 3
npm install @dayflow/blossom-color-picker-vue

# Svelte
npm install @dayflow/blossom-color-picker-svelte

# Angular
npm install @dayflow/blossom-color-picker-angular
```

## Usage

### Vanilla JS

```js
import { BlossomColorPicker } from '@dayflow/blossom-color-picker';
import '@dayflow/blossom-color-picker/styles.css';

const picker = new BlossomColorPicker(document.getElementById('picker'), {
  onChange: color => console.log(color.hex),
});

// Programmatic control
picker.expand();
picker.collapse();
picker.toggle();
picker.setValue({ hue: 200, saturation: 50, alpha: 100, layer: 'outer' });
picker.setOptions({ disabled: true });
picker.destroy();
```

### React

```tsx
import { BlossomColorPicker } from '@dayflow/blossom-color-picker-react';

function App() {
  const [color, setColor] = useState({
    hue: 330,
    saturation: 70,
    alpha: 100,
    layer: 'outer' as const,
  });

  return <BlossomColorPicker value={color} onChange={c => setColor(c)} />;
}
```

### Vue 3

```vue
<script setup>
import { ref } from 'vue';
import { BlossomColorPicker } from '@dayflow/blossom-color-picker-vue';

const color = ref({
  hue: 330,
  saturation: 70,
  alpha: 100,
  layer: 'outer',
});

function handleChange(c) {
  color.value = c;
}
</script>

<template>
  <BlossomColorPicker :value="color" @change="handleChange" />
</template>
```

### Svelte

```svelte
<script>
  import { BlossomColorPicker } from '@dayflow/blossom-color-picker-svelte';

  let color = $state({
    hue: 330, saturation: 70, alpha: 100, layer: 'outer',
  });

  function handleChange(newColor) {
    color = newColor;
  }
</script>

<BlossomColorPicker value={color} onchange={handleChange} />
```

### Angular

```typescript
import { Component } from '@angular/core';
import {
  BlossomColorPickerComponent,
  type BlossomColorPickerColor,
} from '@dayflow/blossom-color-picker-angular';

@Component({
  selector: 'app-root',
  imports: [BlossomColorPickerComponent],
  template: `
    <blossom-color-picker
      [value]="color"
      (colorChange)="onColorChange($event)"
    />
  `,
})
export class App {
  color = { hue: 330, saturation: 70, alpha: 100, layer: 'outer' as const };

  onColorChange(c: BlossomColorPickerColor) {
    this.color = c;
  }
}
```

## Options / Props

All packages share the same set of options. In React they are passed as JSX props; in Vue as component props (with events via `@change` / `@collapse`); in Svelte as callback props (`onchange` / `oncollapse`); in Angular as `@Input()` bindings (with events via `(colorChange)` / `(colorCollapse)`).

| Option                | Type                                               | Default                                                    | Description                                                                                                                                                                                                                                                                                        |
| :-------------------- | :------------------------------------------------- | :--------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `value`               | `BlossomColorPickerValue`                          | -                                                          | Controlled value of the picker.                                                                                                                                                                                                                                                                    |
| `defaultValue`        | `BlossomColorPickerValue`                          | `{ hue: 330, saturation: 70, alpha: 100, layer: 'outer' }` | Initial value for uncontrolled mode.                                                                                                                                                                                                                                                               |
| `colors`              | `ColorInput[]`                                     | (Default 18-color set)                                     | Color list, automatically sorted and distributed into layers.                                                                                                                                                                                                                                      |
| `onChange`            | `(color: BlossomColorPickerColor) => void`         | -                                                          | Called when color changes. Vue: `@change`. Svelte: `onchange`. Angular: `(colorChange)`.                                                                                                                                                                                                           |
| `onChangeComplete`    | `(color: BlossomColorPickerColor) => void`         | -                                                          | Called once after petal activation or a shade gesture ends. Vue: `@change-complete`. Svelte: `onchangecomplete`. Angular: `(colorChangeComplete)`.                                                                                                                                                 |
| `onCollapse`          | `(color: BlossomColorPickerColor) => void`         | -                                                          | Called when the picker collapses. Vue: `@collapse`. Svelte: `oncollapse`. Angular: `(colorCollapse)`.                                                                                                                                                                                              |
| `onHover`             | `(color: BlossomColorPickerColor \| null) => void` | -                                                          | Called with the color a petal would select when it is hovered or keyboard-focused, and with `null` when that ends. Vue: `@hover`. Svelte: `onhover`. Angular: `(colorHover)`.                                                                                                                      |
| `disabled`            | `boolean`                                          | `false`                                                    | Whether the picker is disabled.                                                                                                                                                                                                                                                                    |
| `openOnHover`         | `boolean`                                          | `false`                                                    | If true, opens the picker on hover instead of click.                                                                                                                                                                                                                                               |
| `initialExpanded`     | `boolean`                                          | `false`                                                    | Whether the picker starts expanded.                                                                                                                                                                                                                                                                |
| `animationDuration`   | `number`                                           | `280`                                                      | Base timing of the blooming animation in ms; every phase scales with it (at the default the bloom settles in about 550 ms).                                                                                                                                                                        |
| `showShadeSlider`     | `boolean`                                          | `true`                                                     | Whether to show the shade (brightness) arc slider.                                                                                                                                                                                                                                                 |
| `showAlphaSlider`     | `boolean`                                          | `true`                                                     | Deprecated alias for `showShadeSlider`; the new name takes precedence when both are supplied.                                                                                                                                                                                                      |
| `coreSize`            | `number`                                           | `32`                                                       | Diameter of the central circle in px.                                                                                                                                                                                                                                                              |
| `petalSize`           | `number`                                           | `32`                                                       | Diameter of individual color petals in px.                                                                                                                                                                                                                                                         |
| `showCoreColor`       | `boolean`                                          | `false`                                                    | When true, the core shows the selected color while expanded; otherwise it is white.                                                                                                                                                                                                                |
| `hoverPreview`        | `boolean`                                          | `false`                                                    | When true, the ring, core (with `showCoreColor`) and background show the hovered or focused petal's color before it is picked.                                                                                                                                                                     |
| `petalShape`          | `'circle' \| 'sakura' \| 'lotus' \| 'pinwheel'`    | `'circle'`                                                 | Petal outline. `sakura`: broad petals with a notched tip. `lotus`: round base drawn up into a pointed tip. `pinwheel`: tip swept to one side, so the bloom looks like it is turning. Shaped petals point away from the core, are lightly shaded from base to tip, and ignore `--bcp-petal-shadow`. |
| `petalStyle`          | `'flat' \| 'veined'`                               | `'flat'`                                                   | Surface detail on shaped petals. `veined` draws a midrib and side veins on each petal. Ignored when `petalShape` is `circle`.                                                                                                                                                                      |
| `sliderPosition`      | `'top' \| 'bottom' \| 'left' \| 'right'`           | `'right'`                                                  | Fixed position for the arc slider.                                                                                                                                                                                                                                                                 |
| `adaptivePositioning` | `boolean`                                          | `true`                                                     | **Smart Shifter**: Automatically shifts the picker to stay within viewport and repositions the slider for best visibility.                                                                                                                                                                         |
| `className` / `class` | `string`                                           | `""`                                                       | Additional CSS class (React: `className`, Svelte: `class`).                                                                                                                                                                                                                                        |

### CSS Variables

Set these on `.bcp-root` or any ancestor to theme the picker. Each one falls back to the default look, so leaving them unset changes nothing.

| Variable                       | Default                          | Styles                                                  |
| :----------------------------- | :------------------------------- | :------------------------------------------------------ |
| `--bcp-surface`                | `#FFFFFF`                        | Background disc behind the petals.                      |
| `--bcp-surface-shadow`         | soft drop shadow                 | Shadow of the background disc.                          |
| `--bcp-tint-opacity`           | `0.15`                           | Strength of the selected-color tint on the disc.        |
| `--bcp-track`                  | `rgba(0, 0, 0, 0.06)`            | Unfilled track of the ring and the shade slider.        |
| `--bcp-petal-shadow`           | `none`                           | Shadow under each petal.                                |
| `--bcp-petal-shadow-hover`     | `--bcp-petal-shadow`             | Shadow under a hovered petal.                           |
| `--bcp-petal-hover-scale`      | `1.1`                            | How much a hovered petal grows.                         |
| `--bcp-petal-hover-brightness` | `1.1`                            | How much a hovered petal brightens.                     |
| `--bcp-petal-vein-color`       | `#fff`                           | Color of the vein lines with `petalStyle: 'veined'`.    |
| `--bcp-petal-vein-opacity`     | `0.5`                            | Opacity of the vein lines.                              |
| `--bcp-core-bg`                | `#FFFFFF`                        | Core color while expanded, when `showCoreColor` is off. |
| `--bcp-core-shadow`            | subtle ring + shadow             | Shadow of the expanded core.                            |
| `--bcp-trigger-shadow`         | `0 2px 8px rgba(0, 0, 0, 0.12)`  | Shadow of the collapsed trigger.                        |
| `--bcp-trigger-shadow-hover`   | `0 4px 14px rgba(0, 0, 0, 0.18)` | Shadow of the hovered trigger.                          |
| `--bcp-handle-border`          | `white`                          | Outline of the shade slider handle.                     |
| `--bcp-focus-ring`             | `#3b82f6`                        | Keyboard focus outline.                                 |
| `--bcp-focus-ring-gap`         | `white`                          | Gap between the core and its focus outline.             |

```css
.my-dark-theme .bcp-root {
  --bcp-surface: #1e1b2e;
  --bcp-core-bg: #1e1b2e;
  --bcp-track: rgba(255, 255, 255, 0.12);
  --bcp-handle-border: #1e1b2e;
  --bcp-focus-ring-gap: #1e1b2e;
}
```

### Vanilla JS Methods

The core class exposes these additional methods:

| Method             | Description                                           |
| :----------------- | :---------------------------------------------------- |
| `setValue(value)`  | Set the current color value.                          |
| `getValue()`       | Get the current color as a `BlossomColorPickerColor`. |
| `expand()`         | Open the picker.                                      |
| `collapse()`       | Close the picker.                                     |
| `toggle()`         | Toggle open/close.                                    |
| `setOptions(opts)` | Update any options at runtime.                        |
| `destroy()`        | Remove all DOM elements and event listeners.          |

## Features

### Smart Shifter & Adaptive UI

The picker is built for all screen sizes. When `adaptivePositioning` is enabled:

- **Viewport Shifting**: If the expanded picker would overflow the screen edge (common on mobile), it automatically shifts itself into view.
- **Auto Slider Positioning**: The Arc Slider automatically moves to the side with the most available space (Top, Bottom, Left, or Right).
- **Dark Mode Ready**: The background automatically adapts to your theme, using a soft, tinted overlay of the currently selected color.

### Geometric Nesting

Our "Bloom" algorithm uses trigonometric calculations to ensure:

- **Zero Gaps**: Petals aggressively "hug" the core and nestle deep into the "valleys" of previous layers.
- **Staggered Layout**: Adjacent layers are automatically staggered to create a dense, natural blossom effect regardless of the color count.

## Type Reference

### `BlossomColorPickerValue`

The value object used for controlled / uncontrolled state.

| Field                | Type                 | Description                                                                                                               |
| :------------------- | :------------------- | :------------------------------------------------------------------------------------------------------------------------ |
| `hue`                | `number`             | Hue angle (0-360).                                                                                                        |
| `saturation`         | `number`             | Slider position (0-100). 0 = bright, 100 = dark.                                                                          |
| `lightness`          | `number?`            | HSL lightness (auto-computed from slider if omitted).                                                                     |
| `originalSaturation` | `number?`            | Base saturation of the selected petal.                                                                                    |
| `colorIndex`         | `number?`            | Index in the original input palette; preserves petal identity across layout sorting. Reset it when replacing the palette. |
| `alpha`              | `number`             | Alpha value (0-100).                                                                                                      |
| `layer`              | `'inner' \| 'outer'` | Which layer the selected petal belongs to.                                                                                |

### `BlossomColorPickerColor`

Extends `BlossomColorPickerValue` — returned by `onChange` and `onCollapse`.

| Field  | Type     | Description                              |
| :----- | :------- | :--------------------------------------- |
| `hex`  | `string` | Hex color string, e.g. `"#6586E5"`.      |
| `hsl`  | `string` | HSL string, e.g. `"hsl(225, 71%, 65%)"`. |
| `hsla` | `string` | HSLA string with alpha.                  |

### `ColorInput`

```ts
type ColorInput = string | { h: number; s: number; l: number };
```

### Color Formats

The `colors` option accepts any of the following formats, and they can be mixed:

```js
// Vanilla JS
const picker = new BlossomColorPicker(el, {
  colors: [
    '#FF6B6B', // hex
    'rgb(107, 203, 119)', // rgb()
    'rgba(65, 105, 225, 0.9)', // rgba()
    'hsl(280, 70%, 55%)', // hsl()
    'hsl(200 80% 60%)', // hsl() space-separated
    { h: 45, s: 90, l: 65 }, // HSL object
  ],
});
```

```tsx
// React
<BlossomColorPicker
  colors={['#FF6B6B', 'rgb(107, 203, 119)', { h: 45, s: 90, l: 65 }]}
/>
```

## Project Structure

This is a monorepo with five packages:

```
packages/
  core/      @dayflow/blossom-color-picker          — standalone vanilla JS class
  react/     @dayflow/blossom-color-picker-react     — thin React wrapper
  vue/       @dayflow/blossom-color-picker-vue       — thin Vue 3 wrapper
  svelte/    @dayflow/blossom-color-picker-svelte    — thin Svelte 5 wrapper
  angular/   @dayflow/blossom-color-picker-angular   — thin Angular wrapper
```

The React, Vue, Svelte and Angular adapters are lightweight wrappers (~2 KB each) that mount the core instance into a container element and sync framework props/events to it.

Made by [Jayce Li](https://github.com/JayceV552), idea from [@lichinlin](https://x.com/lichinlin/status/2019084548072689980).

### Keyboard interaction and state compatibility

Tab enters the petal group at one focusable petal. Left/Right move counterclockwise/clockwise in the current ring; Up moves inward and Down outward, choosing the nearest angular position. Enter/Space select the focused petal. Escape closes a collapsible picker and restores trigger focus. A picker with `collapsible: false` stays open.

The shade slider exposes `role="slider"` and its current value. Arrow keys change it by 1, Shift+Arrow and PageUp/PageDown by 10; Home/End select 0/100. Increasing shade darkens the color. `onChange` runs during interaction; `onChangeComplete` runs once on pointer release/cancellation, or key release/blur, with the last proposed color. A canceled pointer gesture retains its last change. No completion is emitted when there was no change or the picker is destroyed.

In controlled mode, petal and shade interactions only propose colors through callbacks. Supply the accepted value through `setValue` or `setOptions({ value })`. Passing `setOptions({ value: undefined })` returns to uncontrolled mode while preserving the current accepted value.

For compatibility, `value.saturation` still stores the **shade position**, not HSL saturation. `originalSaturation` stores the petal's HSL saturation. `showAlphaSlider` remains a deprecated name for the shade arc; use `showShadeSlider` in new code. The Blossom picker preserves an explicitly supplied `alpha` but has no opacity control; use `ChromePicker` for its opacity slider. The default alpha is now 100 (opaque); pass 50 explicitly to retain the previous translucent default.
