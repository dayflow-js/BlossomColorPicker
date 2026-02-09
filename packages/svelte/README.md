# @dayflow/blossom-color-picker-svelte

Svelte wrapper for [Blossom Color Picker](https://github.com/dayflow-js/BlossomColorPicker).

## Installation

```bash
npm install @dayflow/blossom-color-picker-svelte @dayflow/blossom-color-picker
```

## Usage

```svelte
<script>
  import { BlossomColorPicker } from '@dayflow/blossom-color-picker-svelte';
  import '@dayflow/blossom-color-picker/styles.css';

  let color = {
    hue: 330,
    saturation: 70,
    alpha: 100,
    layer: 'outer',
  };

  function handleChange(event) {
    color = event.detail;
    console.log('Selected color:', color.hex);
  }
</script>

<BlossomColorPicker
  value={color}
  on:change={handleChange}
/>
```

## Props

Supports all props from the core `BlossomColorPickerOptions`.

| Prop | Type | Default |
| :--- | :--- | :--- |
| `value` | `BlossomColorPickerValue` | - |
| `defaultValue` | `BlossomColorPickerValue` | - |
| `colors` | `ColorInput[]` | - |
| `disabled` | `boolean` | `false` |
| `openOnHover` | `boolean` | `false` |
| `initialExpanded` | `boolean` | `false` |
| `animationDuration` | `number` | `300` |
| `showAlphaSlider` | `boolean` | `true` |
| `coreSize` | `number` | `32` |
| `petalSize` | `number` | `32` |
| `showCoreColor` | `boolean` | `true` |
| `sliderPosition` | `'top' \| 'bottom' \| 'left' \| 'right'` | `undefined` |
| `adaptivePositioning` | `boolean` | `true` |
| `class` | `string` | `""` |

## Events

| Event | Detail | Description |
| :--- | :--- | :--- |
| `change` | `BlossomColorPickerColor` | Fired when the color changes. |
| `collapse` | `BlossomColorPickerColor` | Fired when the picker collapses. |

## License

MIT
