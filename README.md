# Blossom Color Picker

A beautiful, blooming color picker component for React.

https://github.com/user-attachments/assets/041c2002-c45b-4506-8323-d65bb7bb9ed5

## Installation

```bash
npm install @dayflow/blossom-color-picker
```

## Usage

```tsx
import { BlossomColorPicker } from '@dayflow/blossom-color-picker';

const MyComponent = () => {
  return (
    <BlossomColorPicker
      onChange={(color) => console.log(color)}
    />
  );
};
```

## Props

### `BlossomColorPickerProps`

| Prop                | Type                                       | Default                                                   | Description                                                                                                                           |
|:--------------------|:-------------------------------------------|:----------------------------------------------------------|:--------------------------------------------------------------------------------------------------------------------------------------|
| `value`             | `BlossomColorPickerValue`                  | -                                                         | Controlled value of the picker.                                                                                                       |
| `defaultValue`      | `BlossomColorPickerValue`                  | `{ hue: 220, saturation: 70, alpha: 50, layer: 'outer' }` | Initial value for uncontrolled mode.                                                                                                  |
| `colors`            | `ColorInput[]`                             | (Default 18-color set)                                    | Color list, automatically sorted and distributed into layers. Accepts hex, `rgb()`, `hsl()`, or `{ h, s, l }` objects — can be mixed. |
| `onChange`          | `(color: BlossomColorPickerColor) => void` | -                                                         | Called when color changes.                                                                                                            |
| `onCollapse`        | `(color: BlossomColorPickerColor) => void` | -                                                         | Called when the picker collapses.                                                                                                     |
| `disabled`          | `boolean`                                  | `false`                                                   | Whether the picker is disabled.                                                                                                       |
| `openOnHover`       | `boolean`                                  | `false`                                                   | If true, opens the picker on hover instead of click.                                                                                  |
| `initialExpanded`   | `boolean`                                  | `false`                                                   | Whether the picker starts expanded.                                                                                                   |
| `animationDuration` | `number`                                   | `300`                                                     | Duration of the blooming animation in ms.                                                                                             |
| `showAlphaSlider`   | `boolean`                                  | `true`                                                    | Whether to show the saturation arc slider.                                                                                            |
| `coreSize`          | `number`                                   | `28`                                                      | Diameter of the central circle in px.                                                                                                 |
| `petalSize`         | `number`                                   | `32`                                                      | Diameter of individual color petals in px.                                                                                            |
| `showCoreColor`     | `boolean`                                  | `true`                                                    | When true, the core shows the selected color while expanded.                                                                          |
| `className`         | `string`                                   | `""`                                                      | Additional CSS class for the container.                                                                                               |

### `BlossomColorPickerValue`

The value object used for controlled / uncontrolled state.

| Field               | Type                | Description                                        |
|:--------------------|:--------------------|:---------------------------------------------------|
| `hue`               | `number`            | Hue angle (0–360).                                 |
| `saturation`        | `number`            | Slider position (0–100). 0 = bright, 100 = dark.   |
| `lightness`         | `number?`           | HSL lightness (auto-computed from slider if omitted). |
| `originalSaturation`| `number?`           | Base saturation of the selected petal.             |
| `alpha`             | `number`            | Alpha value (0–100).                               |
| `layer`             | `'inner' \| 'outer'`| Which layer the selected petal belongs to.         |

### `BlossomColorPickerColor`

Extends `BlossomColorPickerValue` — returned by `onChange` and `onCollapse`.

| Field  | Type     | Description                             |
|:-------|:---------|:----------------------------------------|
| `hex`  | `string` | Hex color string, e.g. `"#6586E5"`.    |
| `hsl`  | `string` | HSL string, e.g. `"hsl(225, 71%, 65%)"`. |
| `hsla` | `string` | HSLA string with alpha.                 |

### `ColorInput`

```ts
type ColorInput = string | { h: number; s: number; l: number };
```

### Color Formats

The `colors` prop accepts any of the following formats, and they can be mixed in the same array:

```tsx
<BlossomColorPicker
  colors={[
    "#FF6B6B",                    // hex
    "rgb(107, 203, 119)",         // rgb()
    "rgba(65, 105, 225, 0.9)",    // rgba()
    "hsl(280, 70%, 55%)",         // hsl()
    "hsl(200 80% 60%)",           // hsl() space-separated
    { h: 45, s: 90, l: 65 },     // HSL object
  ]}
/>
```

Made by [Jayce Li](https://github.com/JayceV552), idea from [@lichinlin](https://x.com/lichinlin/status/2019084548072689980).
