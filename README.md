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
| `coreSize`          | `number`                                   | `32`                                                      | Diameter of the central circle and layout placeholder.                                                                                |
| `petalSize`         | `number`                                   | `32`                                                      | Diameter of individual color petals.                                                                                                  |
| `showCoreColor`     | `boolean`                                  | `true`                                                    | When true, the core shows the selected color while expanded.                                                                          |
| `className`         | `string`                                   | `""`                                                      | Additional CSS class for the container.                                                                                               |

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
