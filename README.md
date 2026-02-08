# Blossom Color Picker

[![npm version](https://img.shields.io/npm/v/@dayflow/blossom-color-picker.svg)](https://www.npmjs.com/package/@dayflow/blossom-color-picker)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/dayflow-js/BlossomColorPicker/pulls)
[![GitHub license](https://img.shields.io/github/license/dayflow-js/BlossomColorPicker)](https://github.com/dayflow-js/BlossomColorPicker/blob/main/LICENSE)

A beautiful, blooming color picker component for Web.

https://github.com/user-attachments/assets/553ee0ff-1f52-497f-bc8f-cee9a7b91d66

## Installation

```bash
npm install @dayflow/blossom-color-picker
```

## Usage

```tsx
import { BlossomColorPicker } from '@dayflow/blossom-color-picker';

const MyComponent = () => {
  return <BlossomColorPicker onChange={(color) => console.log(color)} />;
};
```

## Props

### `BlossomColorPickerProps`

| Prop                  | Type                                       | Default                                                   | Description                                                                                                                |
|:----------------------|:-------------------------------------------|:----------------------------------------------------------|:---------------------------------------------------------------------------------------------------------------------------|
| `value`               | `BlossomColorPickerValue`                  | -                                                         | Controlled value of the picker.                                                                                            |
| `defaultValue`        | `BlossomColorPickerValue`                  | `{ hue: 330, saturation: 70, alpha: 50, layer: 'outer' }` | Initial value for uncontrolled mode (Pink).                                                                                |
| `colors`              | `ColorInput[]`                             | (Default 18-color set)                                    | Color list, automatically sorted and distributed into layers.                                                              |
| `onChange`            | `(color: BlossomColorPickerColor) => void` | -                                                         | Called when color changes.                                                                                                 |
| `onCollapse`          | `(color: BlossomColorPickerColor) => void` | -                                                         | Called when the picker collapses.                                                                                          |
| `disabled`            | `boolean`                                  | `false`                                                   | Whether the picker is disabled.                                                                                            |
| `openOnHover`         | `boolean`                                  | `false`                                                   | If true, opens the picker on hover instead of click.                                                                       |
| `initialExpanded`     | `boolean`                                  | `false`                                                   | Whether the picker starts expanded.                                                                                        |
| `animationDuration`   | `number`                                   | `300`                                                     | Duration of the blooming animation in ms.                                                                                  |
| `showAlphaSlider`     | `boolean`                                  | `true`                                                    | Whether to show the saturation arc slider.                                                                                 |
| `coreSize`            | `number`                                   | `32`                                                      | Diameter of the central circle in px.                                                                                      |
| `petalSize`           | `number`                                   | `32`                                                      | Diameter of individual color petals in px.                                                                                 |
| `showCoreColor`       | `boolean`                                  | `true`                                                    | When true, the core shows the selected color while expanded.                                                               |
| `sliderPosition`      | `'top' \| 'bottom' \| 'left' \| 'right'`   | `'right'`                                                 | Fixed position for the arc slider.                                                                                         |
| `adaptivePositioning` | `boolean`                                  | `true`                                                    | **Smart Shifter**: Automatically shifts the picker to stay within viewport and repositions the slider for best visibility. |
| `className`           | `string`                                   | `""`                                                      | Additional CSS class for the container.                                                                                    |

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

### `BlossomColorPickerValue`

The value object used for controlled / uncontrolled state.

| Field                | Type                 | Description                                           |
|:---------------------|:---------------------|:------------------------------------------------------|
| `hue`                | `number`             | Hue angle (0–360).                                    |
| `saturation`         | `number`             | Slider position (0–100). 0 = bright, 100 = dark.      |
| `lightness`          | `number?`            | HSL lightness (auto-computed from slider if omitted). |
| `originalSaturation` | `number?`            | Base saturation of the selected petal.                |
| `alpha`              | `number`             | Alpha value (0–100).                                  |
| `layer`              | `'inner' \| 'outer'` | Which layer the selected petal belongs to.            |

### `BlossomColorPickerColor`

Extends `BlossomColorPickerValue` — returned by `onChange` and `onCollapse`.

| Field  | Type     | Description                              |
|:-------|:---------|:-----------------------------------------|
| `hex`  | `string` | Hex color string, e.g. `"#6586E5"`.      |
| `hsl`  | `string` | HSL string, e.g. `"hsl(225, 71%, 65%)"`. |
| `hsla` | `string` | HSLA string with alpha.                  |

### `ColorInput`

```ts
type ColorInput = string | { h: number; s: number; l: number };
```

### Color Formats

The `colors` prop accepts any of the following formats, and they can be mixed in the same array:

```tsx
<BlossomColorPicker
  colors={[
    '#FF6B6B', // hex
    'rgb(107, 203, 119)', // rgb()
    'rgba(65, 105, 225, 0.9)', // rgba()
    'hsl(280, 70%, 55%)', // hsl()
    'hsl(200 80% 60%)', // hsl() space-separated
    { h: 45, s: 90, l: 65 }, // HSL object
  ]}
/>
```

Made by [Jayce Li](https://github.com/JayceV552), idea from [@lichinlin](https://x.com/lichinlin/status/2019084548072689980).
