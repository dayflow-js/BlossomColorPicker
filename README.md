# Blossom Color Picker

A beautiful, blooming color picker component for React.

## Installation

```bash
npm install blossom-color-picker
```

## Usage

```tsx
import { BlossomColorPicker } from 'blossom-color-picker';

const MyComponent = () => {
  return (
    <BlossomColorPicker
      onChange={(color) => console.log(color)}
    />
  );
};
```

## Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `value` | `BlossomColorPickerValue` | - | Controlled value of the picker. |
| `defaultValue` | `BlossomColorPickerValue` | `{ hue: 220, saturation: 70, alpha: 50, layer: 'outer' }` | Initial value for uncontrolled mode. |
| `innerColors` | `{ h: number; s: number; l: number }[]` | (Default inner set) | Custom color set for the inner ring of petals. |
| `outerColors` | `{ h: number; s: number; l: number }[]` | (Default outer set) | Custom color set for the outer ring of petals. |
| `onChange` | `(color: BlossomColorPickerColor) => void` | - | Called when color changes. |
| `onCollapse` | `(color: BlossomColorPickerColor) => void` | - | Called when the picker collapses. |
| `disabled` | `boolean` | `false` | Whether the picker is disabled. |
| `openOnHover` | `boolean` | `false` | If true, opens the picker on hover instead of click. |
| `initialExpanded` | `boolean` | `false` | Whether the picker starts expanded. |
| `animationDuration` | `number` | `300` | Duration of the blooming animation in ms. |
| `showAlphaSlider` | `boolean` | `true` | Whether to show the alpha/saturation arc slider. |
| `coreSize` | `number` | `28` | Diameter of the central circle and layout placeholder. |
| `petalSize` | `number` | `32` | Diameter of individual color petals. |
| `className` | `string` | `""` | Additional CSS class for the container. |

## License

MIT
