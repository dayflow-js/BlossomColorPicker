import {
  BlossomColorPicker,
  ChromePicker,
} from '@dayflow/blossom-color-picker-svelte';
import type { ComponentProps } from 'svelte';

type PickerProps = ComponentProps<typeof BlossomColorPicker>;
type ChromeProps = ComponentProps<typeof ChromePicker>;

export const props: PickerProps = {
  coreSize: 32,
  defaultValue: { hue: 330, saturation: 70, alpha: 100, layer: 'outer' },
  onchange: color => void color.hex,
};
// @ts-expect-error coreSize must be a number.
export const invalidProps: PickerProps = { coreSize: '32' };

export const chromeProps: ChromeProps = { darkMode: true };
// @ts-expect-error darkMode must be a boolean.
export const invalidChromeProps: ChromeProps = { darkMode: 'true' };
